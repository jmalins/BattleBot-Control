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
  var _state, _updateRate = 0;
  var _leftPower = 0, _rightPower = 0, _weaponPower = 0;

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

  // build a packet from current values //
  function getPacketValue() {
    return _leftPower + ':' + _rightPower + ':' + Math.round(_weaponPower * 1023);
  }

  // send a control packet to the robot   //
  // takes an (err, value) style callback //
  function sendUpdate(value, callback) {
    var xhr = new XMLHttpRequest();

    // suppress update when debugging locally //
    if(document.location.protocol === 'file:') return;

    xhr.open('PUT', '/control', true);
    xhr.onload = function(e) {
      var res = { text: xhr.responseText, status: xhr.status };
      callback((res.status != 200)? res.text: null, res);
    };
    xhr.onerror = function(e) {
      callback(e.type, e);
    };
    xhr.timeout   = RobotControl.timeout;
    xhr.ontimeout = xhr.onerror;

    xhr.send(value);
  }

  // start the polling loop //
  function pollRobot() {
    var pollStart = new Date();
    sendUpdate(getPacketValue(), function(err, res) {
      //console.log('packet received', err, res);

      // was the loop terminated? //
      _lastError = err;
      if(_state === RobotControl.STOPPED) {
        _updateRate = 0;
        return;
      }

      // handle errors //
      if(_lastError) {
        setState(RobotControl.ERROR);
      } else if(_state !== RobotControl.CONNECTED) {
        setState(RobotControl.CONNECTED);
      }

      // poll again //
      var pollMs = (_state === RobotControl.ERROR)? 1000: 1; // back off if error //
      setTimeout(pollRobot, pollMs);
      
      // compute update rate //
      var delayMs = new Date().getTime() - pollStart.getTime();
      if(delayMs > 0) {
        _updateRate = Math.floor(1000 * 100 / delayMs) / 100;
      }
    });
  }

  window.RobotControl = {
    start: function() {
      setState(RobotControl.CONNECTING);
      pollRobot();
    },
    stop: function() {
      setState(RobotControl.STOPPED);
    },

    // state management //
    STOPPED:    'stopped',
    CONNECTING: 'connecting',
    CONNECTED:  'connected',
    ERROR:      'error',
    getState: function() {
      return _state;
    },
    onstatechange: null,
    getLastError: function() {
      return _lastError;
    },
    getUpdateRate: function() {
      return _updateRate;
    },
    timeout: 250, // 250ms //

    // control motor power //
    setPower: function(left, right) {
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
