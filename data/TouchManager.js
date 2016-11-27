/**
 *  TouchManager
 *
 *    Implements an abstraction layer on top of raw touch / mouse events to emulate
 *    a configurable number of joysticks and/or buttons. External interface is as
 *    follows:
 *
 *    setCanvas(canvas) : attach to the main drawing canvas
 *    draw(c) : called with a 2D context to draw the active joysticks / buttons
 *    debug : [bool] display debug info when drawing (default false)
 *
 *    ontouchstart : [function] called when a new touch / click is detected
 *      arguments are (touch, tracker)
 *        touch : touch or mouse event object (see DOM reference)
 *        tracker : callback handler
 *          tracker.addJoystick(key, maxMagnitude, style, originPos)
 *            key : [string] name of joystick (e.g. 'left', 'right', etc.), used to get value later
 *            maxMagnitude : [number] maximum value in each axis (e.g. 100)
 *            style : [string] canvas 'strokeStyle' for drawing joystick
 *            originPos : [object] { x: 0, y: 0 }, where to center the joystick
 *                        defaults to the start position
 *          tracker.addButton(key, style)
 *            key : name of button (e.g. 'trigger', etc.), used to get value later
 *            style : canvas 'strokeStyle' for drawing button
 *
 *    clear() : remove all tracked items
 *    getItem(key): return the item (joystick or button) with 'key'
 *    getItems() : return all raw items
 *    onitemchange : [function] called when an item changes
 *      arguments are (action, item)
 *         action: [string] ('add', 'update', 'delete')
 *         item: [object] the item, during delete the item contains only the key
 *
 **/
(function() {
  var _canvas;
  var _touches = {}, _trackedMap = {};

  // send a change notification //
  function sendChange(action, item) {
    if(TouchManager.debug) console.log(action, item);
    if(typeof TouchManager.onitemchange !== 'function') return;
    TouchManager.onitemchange(action, item);
  }

  // compute joystick value //
  function setJoystickValues(joy) {
    var deltaX = joy.currentPos.x - joy.originPos.x;
    var deltaY = joy.currentPos.y - joy.originPos.y;

    Object.assign(joy, { 
      x: Math.max(Math.min(deltaX, joy.maxMagnitude), -joy.maxMagnitude) / joy.maxMagnitude, 
      y: Math.max(Math.min(deltaY, joy.maxMagnitude), -joy.maxMagnitude) / joy.maxMagnitude,
      angle: Math.atan2(deltaY, deltaX),
      magnitude: Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    });
  }

  // create new touches by passing through callback //
  function doAdd(touch) {
    if(typeof TouchManager.ontouchstart !== 'function') return;
    
    var item = null;
    var tracker = {
      item: null,
      addJoystick: function(key, maxMagnitude, style, originPos) {
        console.log('create joystick', touch);
        if(_trackedMap[key]) {
          doRemove(TouchManager.getItem(key));
        }
        _trackedMap[key] = touch.identifier;
        item = _touches[touch.identifier] = { 
          key: key, type: 'joystick', id: touch.identifier, style: style,
          originPos:   originPos || { x: touch.clientX, y: touch.clientY },
          currentPos: { x: touch.clientX, y: touch.clientY },
          maxMagnitude: maxMagnitude || 100
        };
      },
      addButton: function(key, style) {
        console.log('create button', touch);
        if(_trackedMap[key]) {
          doRemove(TouchManager.getItem(key));
        }
        _trackedMap[key] = touch.identifier;
        item = _touches[touch.identifier] = { 
          key: key, type: 'button', id: touch.identifier, style: style,
          currentPos: { x: touch.clientX, y: touch.clientY }
        };
      }
    };

    TouchManager.ontouchstart(touch, tracker);
    if(item) {
      if(item.type === 'joystick') {
        setJoystickValues(item);
      }
      sendChange('add', item);
    }
  }

  // handle an update //
  function doUpdate(item, touch) {
    item.currentPos = { x: touch.clientX, y: touch.clientY };
    if(item.type === 'joystick') {
      setJoystickValues(item);
    }
    sendChange('update', item);
  }

  // handle a delete //
  function doRemove(item) {
    delete _touches[item.id];
    delete _trackedMap[item.key];
    sendChange('remove', { key: item.key })
  }

  // add event handlers //
  function onTouchStart(e) {
    for(var i = 0; i < e.changedTouches.length; i++) {
      doAdd(e.changedTouches[i]);
    }
  }

  function onMouseStart(e) {
    // make mouse event look like touch //
    e.identifier = 'mouse';
    doAdd(e);
  }

  // update event handlers //
  function onTouchMove(e) {
    // stop the default browser behavior (scroll, zoom) //
    e.preventDefault();

    for(var i = 0; i < e.changedTouches.length; i++) {
      var touch = e.changedTouches[i];
      var item  = _touches[touch.identifier];
      if(!item) continue;
      doUpdate(item, touch);      
    }
  }

  function onMouseMove(e) {
    var item = _touches['mouse'];
    if(!item) return;
    doUpdate(item, e);
  }

  // remove ended touches //
  function onTouchEnd(e) {
    for(var i = 0; i < e.changedTouches.length; i++) {
      var touch = e.changedTouches[i];
      var item   = _touches[touch.identifier];
      if(!item) continue;
      doRemove(item);
    }
  }

  function onMouseEnd(e) {
    var item = _touches['mouse'];
    if(!item) return;
    doRemove(item);
  }

  // handle style //
  function getStyle(item) {
    switch(typeof item.style) {
      case 'function': return item.style(item);
      case 'string':   return item.style;
      default: return 'white'; // sensible default //
    }
  }

  window.TouchManager = {
    setCanvas: function(canvas) {
      if(_canvas) {
        _canvas.removeEventListener('touchstart', onTouchStart, false);
        _canvas.removeEventListener('touchmove',  onTouchMove,  false);
        _canvas.removeEventListener('touchend',   onTouchEnd,   false);

        _canvas.removeEventListener('mousedown', onMouseStart, false);
        _canvas.removeEventListener('mousemove', onMouseMove,  false);
        _canvas.removeEventListener('mouseup',   onMouseEnd,   false);
        TouchManager.clear();
      }
      canvas.addEventListener('touchstart', onTouchStart, false);
      canvas.addEventListener('touchmove',  onTouchMove,  false);
      canvas.addEventListener('touchend',   onTouchEnd,   false);

      canvas.addEventListener('mousedown', onMouseStart, false);
      canvas.addEventListener('mousemove', onMouseMove,  false);
      canvas.addEventListener('mouseup',   onMouseEnd,   false);
      _canvas = canvas;
    },

    // touch tracking functions //
    ontouchstart: null,
    clear: function() {
      _touches    = {};
      _trackedMap = {};
    },

    // handling of tracked objects //
    getItem: function(key) {
      return _touches[_trackedMap[key]];
    },
    getItems: function() {
      return Object.values(_touches);
    },
    onitemchange: null,

    // draw method //
    debug: false,
    draw: function(c) {
      for(id in _touches) {
        var touch = _touches[id];
        var style = getStyle(touch);
        var pos   = touch.currentPos;
        switch(touch.type) {
          case 'joystick':
            // draw a joystick //
            c.beginPath(); 
            c.strokeStyle = style; 
            c.lineWidth   = 6; 
            c.arc(touch.originPos.x, touch.originPos.y, 40, 0, Math.PI * 2, true); 
            c.stroke();
        
            c.beginPath(); 
            c.strokeStyle = style;
            c.lineWidth   = 2; 
            c.arc(touch.originPos.x, touch.originPos.y, 60, 0, Math.PI * 2, true); 
            c.stroke();
            
            c.beginPath();
            c.strokeStyle = style; 
            c.arc(pos.x, pos.y, 40, 0, Math.PI * 2, true); 
            c.stroke();

            if(TouchManager.debug) {
              c.beginPath(); 
              c.fillStyle = 'white';
              c.fillText('joystick: ' + touch.key 
                + ', x: ' + (Math.round(touch.x * 1000) / 1000)
                + ', y: ' + (Math.round(touch.y * 1000) / 1000),
                touch.originPos.x - 50, touch.originPos.y + 75
              );
            }
            break;
          case 'button':
            // draw a button // 
            c.beginPath(); 
            c.strokeStyle = style;
            c.lineWidth   = '6';
            c.arc(pos.x, pos.y, 40, 0, Math.PI * 2, true); 
            c.stroke();

            if(TouchManager.debug) {
              c.beginPath(); 
              c.fillStyle = 'white';
              c.fillText('button: ' + touch.key + ', x: ' + pos.x + ', y: ' + pos.y,
                pos.x - 45, pos.y + 55
              );
            }
            break;
        }
      }
    }
  };
})();
