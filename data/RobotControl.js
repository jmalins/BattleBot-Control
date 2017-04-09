/**
 *  RobotControl
 *
 *    Implements real-time connection management and command transmission to the
 *    robot. External interface is as follows:
 *
 *    start() : update the robot continuously
 *    stop() :  stop updating
 *
 *    getState() : current state of the control interface
 *                  STOPPED     not updating
 *                  CONNECTING  start() was called, attempting first connection
 *                  CONNECTED   robot is being updated
 *                  ERROR       the last update failed
 *    onstatechanged : [function] to be notified on state changes
 *      arguments are (newState, oldState)
 *
 *    getUpdateRate() : rate of robot updates in Hz
 *    getLastError() : the error return, or null if no error
 *    timeout : [number] network timeout in millis
 *
 *    setPower(left, right) : update the robot motor powers
 *    getPower() : returns the current motor powers as a { left, right } object
 **/
(function() {
  var _state, _stateMachineInterval;
  var _leftPower = 0, _rightPower = 0, _weaponPower = 0;
  var _deadBandLeft = 0, _deadBandRight = 0;
  var _socket, _lastError, _lastHeartbeat = Date.now();

  // handle state change //
  function setState(state) {
    if(state === _state) return;
    var oldState = _state;
    _state = state;

    // notify listener //
    if(typeof RobotControl.onstatechange === 'function') {
      RobotControl.onstatechange(state, oldState);
    }
  }

  // state machine monitoring, run on an interval //
  function runStateMachine() {
    switch(_state) {
      case RobotControl.CONNECTED:
        // if we haven't gotten a heartbeat in 1 second, we're disconnected // 
        const elapsed = Date.now() - _lastHeartbeat;
        if(elapsed > 2000) {
          console.log('watchdog time out', elapsed)
          setState(RobotControl.DISCONNECTED);
        }
        break;
      case RobotControl.DISCONNECTED:
      case RobotControl.ERROR:
        // attempt to reconnect //
        //connect();
        break;
    }
  }

  // build a packet from current values //
  function getPacketValue() {
    return _leftPower + ':' + _rightPower + ':' + Math.round(_weaponPower * 1023);
  }

  function connect() {
    if(_state === RobotControl.CONNECTING) return;

    setState(RobotControl.CONNECTING);
    const host = (document.location.protocol === 'file:')?
      'battlebot.local': document.location.hostname

  	_socket = new WebSocket('ws://' + host + ':81/', ['arduino']);
	  _socket.onopen = function() { 
      _lastHeartbeat = Date.now();
      setState(RobotControl.CONNECTED);
    }; 
	  _socket.onerror = function(error) {
      _lastError = error;
      console.error('Error', error);
      setState(RobotControl.ERROR);
    };
	  _socket.onmessage = function(e) {  
      if(e.data === 'heartbeat') {
        _lastHeartbeat = Date.now();
      } else {
  		  console.log('Message', e.data);
      }
	  };
	  _socket.onclose = function(e) {
		  console.log('Close', e.data);
      if(_state !== RobotControl.ERROR && _state !== RobotControl.STOPPED) {
        setState(RobotControl.DISCONNECTED);
      }
	  };
  }

  function disconnect() {
    if(_socket) {
      if(_socket.readyState === WebSocket.OPEN) {
        _socket.close();
      }
      _socket = null;
    }
  }

  function update() {
    if(_socket && _state === RobotControl.CONNECTED) {
      if(_socket.readyState !== WebSocket.OPEN) {
        _lastError = 'Invalid state: ' +
          (_socket.readyState === WebSocket.CONNECTING)? 'CONNECTING':
          (_socket.readyState === WebSocket.CLOSING)? 'CLOSING':
          (_socket.readyState === WebSocket.CLOSED)?  'CLOSED':
          'UNKNOWN';
        setState(RobotControl.ERROR);
        return;
      } 
      try {
        _socket.send(getPacketValue());
      } catch(e) {
        _lastError = e;
        setState(RobotControl.ERROR);
      }
    }
  }

  window.RobotControl = {
    start: function() {
      connect();
      _stateMachineInterval = window.setInterval(runStateMachine, 2000);
    },
    stop: function() {
      setState(RobotControl.STOPPED);
      disconnect();
      window.clearInterval(_stateMachineInterval);
    },

    // state management //
    STOPPED:      'stopped',
    CONNECTING:   'connecting',
    CONNECTED:    'connected',
    ERROR:        'error',
    DISCONNECTED: 'disconnected',
    getState: function() {
      return _state;
    },
    onstatechange: null,
    getLastError: function() {
      return _lastError;
    },

    // set deadband //
    setDeadBand(left, right) {
      _deadBandLeft  = left;
      _deadBandRight = right;
    },

    // control motor power //
    setPower: function(left, right) {
      left = (
        (left > 0)?  _deadBandLeft + left:
        (left < 0)? -_deadBandLeft + left:
        left
      )
      right = (
        (right > 0)?  _deadBandRight + right:
        (right < 0)? -_deadBandRight + right:
        right
      )

      _leftPower = (
        (left >  1023)? 1023:
        (left < -1023)? -1023:
        Math.round(left)
      );
      _rightPower = (
        (right >  1023)? 1023:
        (right < -1023)? -1023:
        Math.round(right)
      );
      update()
    },
    getPower: function() {
      return { left: _leftPower, right: _rightPower };
    },
    setWeaponPower: function(power) {
      _weaponPower = power;
    },
    getWeaponPower: function() {
      return _weaponPower;
    },

    arcadeDrive: function(speed, rotation, squaredInputs) {
      // clamp the inputs //
      speed    = (speed > 1)?    1: (speed < -1)?    -1: speed;
      rotation = (rotation > 1)? 1: (rotation < -1)? -1: rotation;

      // square the inputs (while preserving the sign) to increase //
      // fine control while permitting full power                  //
      if(squaredInputs) {
        speed    = (speed >= 0.0)? speed * speed: -(speed * speed);
        rotation = (rotation >= 0.0)? rotation * rotation: -(rotation * rotation);
      }

      // mix speed and rotation signals //
      var leftOutput, rightOutput;
      if(speed > 0.0) {
        if(rotation > 0.0) {
          leftOutput  = speed - rotation;
          rightOutput = Math.max(speed, rotation);
        } else {
          leftOutput  = Math.max(speed, -rotation);
          rightOutput = speed + rotation;
        }
      } else {
        if(rotation > 0.0) {
          leftOutput  = -Math.max(-speed, rotation);
          rightOutput = speed + rotation;
        } else {
          leftOutput  = speed - rotation;
          rightOutput = -Math.max(-speed, -rotation);
        }
      }

      // clamp motor outputs //
      leftOutput  = (leftOutput  > 1)? 1: (leftOutput  < -1)? -1: leftOutput;
      rightOutput = (rightOutput > 1)? 1: (rightOutput < -1)? -1: rightOutput;
      
      window.RobotControl.setPower(leftOutput * 1023, rightOutput * 1023);
    }
  };

  // set initial state //
  _state = RobotControl.STOPPED;
})();
