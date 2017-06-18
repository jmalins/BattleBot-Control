/** machine generated, do not edit **/

/* eslint-disable */
'use strict';

var _devices = { };
var _config = null;
var HardwareManager = function HardwareManager () {};
var staticAccessors = { config: {} };
staticAccessors.config.set = function (value) {
  _config = value
};
HardwareManager.validateConfig = function validateConfig () {
  var errors = [ ];
  var addError = function (message) { return errors.push({ type: 'HARDWARE', message: message }); };
  if (!_config) {
    addError('Hardware configuration not set')
  } else if (!_config.devices) {
    addError('Hardware configuration is missing devices')
  }
  if (errors.length) { return errors }
  for (var deviceName in HardwareManager.devices) {
    var device = HardwareManager.devices[deviceName];
    var config = HardwareManager.config.devices[deviceName];
    if (config) {
      var driverName = config.driver;
      if (!device.supportsDriver(driverName)) {
        errors.push(("Device " + deviceName + " has invalid driver: " + driverName))
      }
    } else {
      addError(("Device has no configuration: " + deviceName))
    }
  }
  return (errors.length) ? errors : null
};
HardwareManager.getOutputs = function getOutputs () {
  var packet = { };
  for (var deviceName in _devices) {
    var device = _devices[deviceName];
    if (device.getOutput) {
      packet[deviceName] = device.getOutput()
    }
  }
  return packet
};
HardwareManager.setInputs = function setInputs (values) {
  for (var deviceName in values) {
    var device = _devices[deviceName];
    if (device && device.setInput) {
      device.setInput(values[deviceName])
    }
  }
};
HardwareManager.registerDevice = function registerDevice (device) {
  var name = device.name;
  if (_devices[name]) {
    throw new Error(("Device already exists: " + name))
  }
  _devices[name] = device
};
Object.defineProperties( HardwareManager, staticAccessors );

var Device = function Device (name) {
  this.name = name
  this.value = 0
  HardwareManager.registerDevice(this)
};
Device.prototype.set = function set (value) {
  this.value = value
};
Device.prototype.get = function get () {
  return this.value
};
Device.prototype.getOutput = function getOutput () {
  return null
};
Device.prototype.supportsDriver = function supportsDriver (driverName) {
  return false
};

function constrain (value, min, max) {
  if (value < min) { return min }
  if (value > max) { return max }
  return value
}
function map (value, inputMin, inputMax, outputMin, outputMax) {
  return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin
}
function ajax (method, url, data, timeout, callback) {
  if (typeof timeout === 'function') {
    callback = timeout
    timeout = undefined
  }
  var getResponse = function (xhr, data) { return ({
    status: xhr.status,
    statusText: xhr.statusText,
    data: data,
    xhr: xhr
  }); };
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true)
  xhr.timeout = timeout
  xhr.addEventListener('load', function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(null, getResponse(xhr, xhr.responseText))
    } else {
      callback(new Error(((xhr.status) + " - " + (xhr.statusText))), getResponse(xhr))
    }
  })
  xhr.addEventListener('error', function (e) { return callback(new Error('Request failed'), getResponse(xhr)); })
  xhr.addEventListener('timeout', function () { return callback(new Error('Request timeout'), getResponse(xhr)); })
  if (data) {
    xhr.send(typeof data !== 'string' ? JSON.stringify(data) : data)
  } else {
    xhr.send()
  }
}
function ajaxGet (url, timeoutMs, callback) {
  return ajax('GET', url, null, timeoutMs, callback)
}
function ajaxPut (url, data, timeout, callback) {
  return ajax('PUT', url, data, timeout, callback)
}

var Motor = (function (Device$$1) {
  function Motor (name) {
    Device$$1.call(this, name)
    this.reversed = false
    this.set(0)
  }
  if ( Device$$1 ) Motor.__proto__ = Device$$1;
  Motor.prototype = Object.create( Device$$1 && Device$$1.prototype );
  Motor.prototype.constructor = Motor;
  Motor.prototype.set = function set (value) {
    if ( value === void 0 ) value = 0;
    Device$$1.prototype.set.call(this, constrain(this.reversed ? -value : value, -1.0, 1.0))
  };
  Motor.prototype.getOutput = function getOutput () {
    return Math.round(this.get() * 1023).toString()
  };
  Motor.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'PWM_HBRIDGE', 'PWM' ].indexOf(driverName) !== -1
  };
  return Motor;
}(Device));

var Servo = (function (Device$$1) {
  function Servo (name) {
    Device$$1.call(this, name)
    this.minOutput = 0.0
    this.maxOutput = 1.0
    this.reversed = false
    this.set(0.5)
  }
  if ( Device$$1 ) Servo.__proto__ = Device$$1;
  Servo.prototype = Object.create( Device$$1 && Device$$1.prototype );
  Servo.prototype.constructor = Servo;
  Servo.prototype.set = function set (value) {
    if ( value === void 0 ) value = 0;
    if (this.reversed) {
      Device$$1.prototype.set.call(this, map(value, 0.0, 1.0, this.minOutput, this.maxOutput))
    } else {
      Device$$1.prototype.set.call(this, map(value, 0.0, 1.0, this.maxOutput, this.minOutput))
    }
  };
  Servo.prototype.getOutput = function getOutput () {
    return Math.round(this.get() * 1023).toString()
  };
  Servo.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'PWM' ].indexOf(driverName) !== -1
  };
  return Servo;
}(Device));

var DigitalOutput = (function (Device$$1) {
  function DigitalOutput (name) {
    Device$$1.call(this, name)
    this.inverted = false
    this.set(false)
  }
  if ( Device$$1 ) DigitalOutput.__proto__ = Device$$1;
  DigitalOutput.prototype = Object.create( Device$$1 && Device$$1.prototype );
  DigitalOutput.prototype.constructor = DigitalOutput;
  DigitalOutput.prototype.set = function set (value) {
    Device$$1.prototype.set.call(this, !!value ^ this.reversed ? 1 : 0)
  };
  DigitalOutput.prototype.getOutput = function getOutput () {
    return this.get().toString()
  };
  DigitalOutput.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'DIGITAL_OUT' ].indexOf(driverName) !== -1
  };
  return DigitalOutput;
}(Device));

var DigitalInput = (function (Device$$1) {
  function DigitalInput (name) {
    Device$$1.call(this, name)
    this.value = false
  }
  if ( Device$$1 ) DigitalInput.__proto__ = Device$$1;
  DigitalInput.prototype = Object.create( Device$$1 && Device$$1.prototype );
  DigitalInput.prototype.constructor = DigitalInput;
  DigitalInput.prototype.get = function get () {
    return this.value
  };
  DigitalInput.prototype.setInput = function setInput (value) {
    this.value = !!value
  };
  DigitalInput.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'DIGITAL_IN' ].indexOf(driverName) !== -1
  };
  return DigitalInput;
}(Device));

var TwoWheelDrive = function TwoWheelDrive (leftMotor, rightMotor) {
  var getMotor = function (motor) { return typeof motor === 'string' ? new Motor(motor) : motor; };
  this.motors = [
    getMotor(leftMotor) || new Motor('leftMotor'),
    getMotor(rightMotor) || new Motor('rightMotor')
  ]
  this.swapMotors = false
};
var prototypeAccessors = { leftMotor: {},rightMotor: {} };
prototypeAccessors.leftMotor.get = function () {
  return this.motors[this.swapMotors ? 1 : 0]
};
prototypeAccessors.rightMotor.get = function () {
  return this.motors[this.swapMotors ? 0 : 1]
};
TwoWheelDrive.prototype.setMotorPowers = function setMotorPowers (left, right) {
  this.leftMotor.set(constrain(left || 0, -1.0, 1.0))
  this.rightMotor.set(constrain(right || 0, -1.0, 1.0))
};
TwoWheelDrive.prototype.stop = function stop () {
  this.leftMotor.set(0)
  this.rightMotor.set(0)
};
Object.defineProperties( TwoWheelDrive.prototype, prototypeAccessors );

var ArcadeDrive = (function (TwoWheelDrive$$1) {
  function ArcadeDrive () {
    TwoWheelDrive$$1.apply(this, arguments);
  }
  if ( TwoWheelDrive$$1 ) ArcadeDrive.__proto__ = TwoWheelDrive$$1;
  ArcadeDrive.prototype = Object.create( TwoWheelDrive$$1 && TwoWheelDrive$$1.prototype );
  ArcadeDrive.prototype.constructor = ArcadeDrive;
  ArcadeDrive.prototype.setSpeedAndRotation = function setSpeedAndRotation (speed, rotation) {
    speed = constrain(speed, -1.0, 1.0)
    if (this.speedScalar) {
      speed = this.speedScalar.scale(speed)
    }
    rotation = constrain(rotation, -1.0, 1.0)
    if (this.rotationScalar) {
      rotation = this.rotationScalar.scale(rotation)
    }
    var leftPower, rightPower;
    if (speed > 0.0) {
      if (rotation > 0.0) {
        leftPower = speed - rotation
        rightPower = Math.max(speed, rotation)
      } else {
        leftPower = Math.max(speed, -rotation)
        rightPower = speed + rotation
      }
    } else {
      if (rotation > 0.0) {
        leftPower = -Math.max(-speed, rotation)
        rightPower = speed + rotation
      } else {
        leftPower = speed - rotation
        rightPower = -Math.max(-speed, -rotation)
      }
    }
    this.setMotorPowers(leftPower, rightPower)
  };
  return ArcadeDrive;
}(TwoWheelDrive));

var TankDrive = (function (TwoWheelDrive$$1) {
  function TankDrive () {
    TwoWheelDrive$$1.apply(this, arguments);
  }
  if ( TwoWheelDrive$$1 ) TankDrive.__proto__ = TwoWheelDrive$$1;
  TankDrive.prototype = Object.create( TwoWheelDrive$$1 && TwoWheelDrive$$1.prototype );
  TankDrive.prototype.constructor = TankDrive;
  TankDrive.prototype.setLeftAndRightSpeed = function setLeftAndRightSpeed (left, right) {
    this.setMotorPowers(left, right)
  };
  return TankDrive;
}(TwoWheelDrive));

var _controlCount = 0;
var Control = function Control (name) {
  this.name = name || ("control" + (++_controlCount))
  this.touch = null
  this.pixelCache = null
  ControlManager.registerControl(this)
};
Control.prototype.matchesTouch = function matchesTouch (touch) {
  return false
};
Control.prototype.setTouch = function setTouch (touch) {
  this.touch = touch
};
Control.prototype.getDimensions = function getDimensions () {
  return { }
};
Control.prototype.getPixelDimensions = function getPixelDimensions () {
  if (this.pixelCache) { return this.pixelCache }
  var dimensions = this.getDimensions();
  var pixels = {};
  for (var dimName in dimensions) {
    pixels[dimName] = ControlManager.convertToPixels(dimName, dimensions[dimName])
  }
  return (this.pixelCache = pixels)
};
Control.prototype.draw = function draw (ctx) {
};

var Button = (function (Control$$1) {
  function Button (name) {
    Control$$1.call(this, name)
    this.position = { x: 0, y: 0 }
    this.radius = 10
    this.sticky = false
    this.groupName = null
    this.style = 'white'
    this.pressed = false
  }
  if ( Control$$1 ) Button.__proto__ = Control$$1;
  Button.prototype = Object.create( Control$$1 && Control$$1.prototype );
  Button.prototype.constructor = Button;
  Button.prototype.getDimensions = function getDimensions () {
    return { x: this.position.x, y: this.position.y, r: this.radius }
  };
  Button.prototype.matchesTouch = function matchesTouch (touch) {
    var clientX = touch.clientX;
    var clientY = touch.clientY;
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var dx = (x - clientX);
    var dy = (y - clientY);
    return Math.sqrt(dx * dx + dy * dy) <= r
  };
  Button.prototype.setTouch = function setTouch (touch) {
    var this$1 = this;
    var lastState = !!this.touch;
    console.log(this.sticky, this.touch, lastState, touch, this.pressed)
    Control$$1.prototype.setTouch.call(this, touch)
    if (this.sticky || this.groupName) {
      if (touch && !lastState) {
        if (this.groupName) {
          if (!this.pressed) {
            for (var controlName in ControlManager.controls) {
              var control = ControlManager.controls[controlName];
              if (control instanceof Button && control.groupName === this$1.groupName) {
                control.pressed = false
              }
            }
            this.pressed = true
          }
        } else {
          this.pressed = !!(this.pressed ^ true)
        }
      }
    } else {
      this.pressed = !!touch
    }
  };
  Button.prototype.draw = function draw (ctx) {
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    ctx.beginPath()
    ctx.strokeStyle = this.style
    ctx.fillStyle = this.style
    ctx.lineWidth = 6
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    if (this.pressed) {
      ctx.fill()
    } else {
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.fillText(
      ((this.name) + ", pressed: " + (this.pressed)),
      x - 50, y + r + 15
    )
  };
  return Button;
}(Control));

var FRAME_RATE = 30;
var _touchOwners = { };
var _controls = { };
var _canvas = null;
var _context = null;
var _intervalID = null;
var _oldWidth = 0;
var _oldHeight = 0;
function transformTouch (touch) {
  return {
    identifier: touch.identifier,
    clientX: Math.round(touch.clientX - _canvas.offsetLeft),
    clientY: Math.round(touch.clientY - _canvas.offsetTop),
    force: touch.force
  }
}
function doAdd (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  touch = transformTouch(touch)
  for (var controlName in ControlManager.controls) {
    var control = ControlManager.controls[controlName];
    if (control.matchesTouch(touch)) {
      _touchOwners[touch.identifier] = control
      control.setTouch(touch)
      fireUpdate()
      break
    }
  }
}
function doUpdate (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  var control = _touchOwners[touch.identifier];
  if (!control) { return }
  control.setTouch(transformTouch(touch))
  fireUpdate()
}
function doRemove (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  var control = _touchOwners[touch.identifier];
  if (!control) { return }
  control.setTouch(null)
  delete _touchOwners[touch.identifier]
  fireUpdate()
}
function fireUpdate () {
  var onupdate = ControlManager.onupdate;
  if (typeof onupdate === 'function') {
    onupdate()
  }
}
function drawControls () {
  var resized = (_canvas.width !== _oldWidth || _canvas.height !== _oldHeight);
  if (resized) {
    _oldWidth = _canvas.width
    _oldHeight = _canvas.height
  }
  _context.clearRect(0, 0, _canvas.width, _canvas.height)
  for (var controlName in _controls) {
    var control = _controls[controlName];
    if (resized) { control.pixelCache = null }
    control.draw(_context)
  }
}
var ControlManager = function ControlManager () {};
var staticAccessors$1 = { controls: {} };
staticAccessors$1.controls.get = function () {
  return _controls
};
ControlManager.setCanvas = function setCanvas (canvas) {
  function handleTouches (e, handler) {
    e.preventDefault()
    for (var i = 0; i < e.changedTouches.length; i++) {
      handler(e.changedTouches[i])
    }
  }
  canvas.addEventListener('touchstart', function (e) { return handleTouches(e, doAdd); }, false)
  canvas.addEventListener('touchmove', function (e) { return handleTouches(e, doUpdate); }, false)
  canvas.addEventListener('touchend', function (e) { return handleTouches(e, doRemove); }, false)
  canvas.addEventListener('mousedown', doAdd, false)
  canvas.addEventListener('mousemove', doUpdate, false)
  canvas.addEventListener('mouseup', doRemove, false)
  _canvas = canvas
  _context = canvas.getContext('2d')
};
ControlManager.start = function start () {
  var buttonGroups = { };
  for (var controlName in _controls) {
    var control = _controls[controlName];
    if (control instanceof Button && control.groupName) {
      var groupName = control.groupName;
      if (buttonGroups[groupName]) {
        buttonGroups[groupName].push(control)
      } else {
        buttonGroups[groupName] = [ control ]
      }
    }
  }
  for (var groupName$1 in buttonGroups) {
    var buttons = buttonGroups[groupName$1];
    if (!buttons.some(function (button) { return button.pressed; })) {
      buttons[0].pressed = true
    }
  }
  _intervalID = setInterval(function () { return drawControls(); }, 1000 / FRAME_RATE)
};
ControlManager.stop = function stop () {
  if (_intervalID) {
    clearInterval(_intervalID)
    _intervalID = null
  }
};
ControlManager.convertToPixels = function convertToPixels (dim, value) {
  var reference;
  switch (dim) {
    case 'y':
    case 'height':
      reference = _canvas.height
      break
    default:
      reference = _canvas.width
      break
  }
  switch (typeof value) {
    case 'number':
      if (value > 0 && value < 1.0) {
        value *= 100
      }
      return Math.round(value * reference / 100)
    case 'string':
      var matches = value.match(/^([0-9]+)([^0-9]*)$/);
      if (matches) {
        var num = matches[1];
          var unit = matches[2];
        value = parseInt(num)
        switch (unit) {
          case '%':
          case '':
            return Math.round(value * reference / 100)
          case 'px':
            return value
        }
      }
    default:
      return null
  }
};
ControlManager.registerControl = function registerControl (control) {
  var name = control.name;
  if (_controls[name]) {
    throw new Error(("Control already exists: " + name))
  }
  _controls[name] = control
};
Object.defineProperties( ControlManager, staticAccessors$1 );

var Joystick = (function (Control$$1) {
  function Joystick (name) {
    Control$$1.call(this, name)
    this.position = { x: 0, y: 0 }
    this.radius = 10
    this.sticky = false
    this.style = 'white'
    this.x = 0
    this.y = 0
  }
  if ( Control$$1 ) Joystick.__proto__ = Control$$1;
  Joystick.prototype = Object.create( Control$$1 && Control$$1.prototype );
  Joystick.prototype.constructor = Joystick;
  Joystick.prototype.getDimensions = function getDimensions () {
    return { x: this.position.x, y: this.position.y, r: this.radius }
  };
  Joystick.prototype.matchesTouch = function matchesTouch (touch) {
    var clientX = touch.clientX;
    var clientY = touch.clientY;
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var dx = (x - clientX);
    var dy = (y - clientY);
    return Math.sqrt(dx * dx + dy * dy) <= r
  };
  Joystick.prototype.setTouch = function setTouch (touch) {
    Control$$1.prototype.setTouch.call(this, touch)
    if (touch) {
      var ref = this.getPixelDimensions();
      var x = ref.x;
      var y = ref.y;
      var r = ref.r;
      this.x = constrain((x - touch.clientX) / r, -1.0, 1.0)
      this.y = constrain((y - touch.clientY) / r, -1.0, 1.0)
    } else if (!this.sticky) {
      this.x = 0.0
      this.y = 0.0
    }
  };
  Joystick.prototype.draw = function draw (ctx) {
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var ir = Math.round(r / 3);
    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 5
    ctx.arc(x, y, ir, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 2
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = this.style
    ctx.arc(x - this.x * r, y - this.y * r, ir, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.fillText(
      ((this.name) + ", x: " + (this.x.toFixed(3)) + ", y: " + (this.y.toFixed(3))),
      x - 50, y + r + 15
    )
  };
  return Joystick;
}(Control));

var Slider = (function (Control$$1) {
  function Slider (name) {
    Control$$1.call(this, name)
    this.position = { x: 0, y: 0 }
    this.radius = 10
    this.length = 30
    this.type = Slider.VERTICAL
    this.sticky = true
    this.style = 'white'
    this.value = 0
  }
  if ( Control$$1 ) Slider.__proto__ = Control$$1;
  Slider.prototype = Object.create( Control$$1 && Control$$1.prototype );
  Slider.prototype.constructor = Slider;
  Slider.prototype.getDimensions = function getDimensions () {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.radius,
      l: this.length
    }
  };
  Slider.prototype.getHelperDimensions = function getHelperDimensions () {
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var l = ref.l;
    if (this.type === Slider.HORIZONTAL) {
      return {
        x: x,
        x1: x,
        x2: x + l,
        xa: x + l,
        y: y,
        y1: y - r,
        y2: y + r,
        ya: y,
        r: r,
        l: l
      }
    } else {
      return {
        x: x,
        x1: x - r,
        x2: x + r,
        xa: x,
        y: y,
        y1: y,
        y2: y + l,
        ya: y + l,
        r: r,
        l: l
      }
    }
  };
  Slider.prototype.matchesTouch = function matchesTouch (touch) {
    var clientX = touch.clientX;
    var clientY = touch.clientY;
    var ref = this.getHelperDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var x1 = ref.x1;
    var y1 = ref.y1;
    var x2 = ref.x2;
    var y2 = ref.y2;
    var xa = ref.xa;
    var ya = ref.ya;
    var dx = (x - clientX);
    var dy = (y - clientY);
    if (Math.sqrt(dx * dx + dy * dy) <= r) { return true }
    var dxa = (xa - clientX);
    var dya = (ya - clientY);
    if (Math.sqrt(dxa * dxa + dya * dya) <= r) { return true }
    return (clientX >= x1) && (clientX <= x2) && (clientY >= y1) && (clientY <= y2)
  };
  Slider.prototype.setTouch = function setTouch (touch) {
    Control$$1.prototype.setTouch.call(this, touch)
    if (touch) {
      var ref = this.getHelperDimensions();
      var l = ref.l;
      var xa = ref.xa;
      var ya = ref.ya;
      if (this.type === Slider.HORIZONTAL) {
        this.value = constrain((xa - touch.clientX) / l, 0.0, 1.0)
      } else {
        this.value = constrain((ya - touch.clientY) / l, 0.0, 1.0)
      }
    } else if (!this.sticky) {
      this.value = 0
    }
  };
  Slider.prototype.draw = function draw (ctx) {
    var ref = this.getHelperDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var l = ref.l;
    var x1 = ref.x1;
    var y1 = ref.y1;
    var x2 = ref.x2;
    var y2 = ref.y2;
    var xa = ref.xa;
    var ya = ref.ya;
    ctx.beginPath()
    ctx.strokeStyle = this.style
    ctx.lineWidth = 2
    if (this.type === Slider.HORIZONTAL) {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y1)
      ctx.arc(xa, ya, r, Math.PI * 3 / 2, Math.PI / 2, false)
      ctx.moveTo(x2, y2)
      ctx.lineTo(x1, y2)
      ctx.arc(x, y, r, Math.PI / 2, Math.PI * 3 / 2, false)
    } else {
      ctx.arc(x, y, r, Math.PI, Math.PI * 2, false)
      ctx.moveTo(x2, y1)
      ctx.lineTo(x2, y2)
      ctx.arc(xa, ya, r, 0, Math.PI, false)
      ctx.moveTo(x1, y2)
      ctx.lineTo(x1, y1)
    }
    ctx.stroke()
    ctx.beginPath()
    if (this.type === Slider.HORIZONTAL) {
      ctx.arc(xa - (this.value * l), y, r - 4, 0, Math.PI * 2, true)
    } else {
      ctx.arc(x, ya - (this.value * l), r - 4, 0, Math.PI * 2, true)
    }
    ctx.strokeStyle = this.style
    ctx.stroke()
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.fillText(
      ((this.name) + ", value: " + (this.value.toFixed(3))),
      xa - 50, ya + r + 15
    )
  };
  return Slider;
}(Control));
Slider.HORIZONTAL = 'Horizontal'
Slider.VERTICAL = 'Vertical'

var Connection = function Connection () {
  this.state = Connection.DISCONNECTED
  this.enabled = false
  this.lastError = null
  this.pingTimeMs = null
  this.onstatechange = null
  this.onresponsedata = null
  this.responseData = null
  this.dataPacket = null
};
Connection.prototype.start = function start () {
  this.enabled = true
};
Connection.prototype.stop = function stop () {
  this.enabled = false
};
Connection.prototype.setState = function setState (newState) {
  if (newState === this.state) { return }
  var oldState = this.state;
  this.state = newState
  if (typeof this.onstatechange === 'function') {
    this.onstatechange(newState, oldState)
  }
};
Connection.prototype.setRobotData = function setRobotData (data) {
  this.dataPacket = (typeof data === 'string') ? data : JSON.stringify(data)
};
Connection.prototype.getResponseData = function getResponseData () {
  return this.responseData
};
Connection.prototype.setResponseData = function setResponseData (data) {
  this.responseData = data
  if (!data) {
    this.pingTimeMs = null
  }
  if (typeof this.onresponsedata === 'function') {
    this.onresponsedata(data)
  }
};
Connection.CONNECTED = 'Connected'
Connection.CONNECTING = 'Connecting'
Connection.DISCONNECTED = 'Disconnected'
Connection.ERROR = 'Error'

var AjaxConnection = (function (Connection$$1) {
  function AjaxConnection (timeoutMillis) {
    Connection$$1.call(this)
    this.timeoutMillis = timeoutMillis || 500
    this.timerId = null
  }
  if ( Connection$$1 ) AjaxConnection.__proto__ = Connection$$1;
  AjaxConnection.prototype = Object.create( Connection$$1 && Connection$$1.prototype );
  AjaxConnection.prototype.constructor = AjaxConnection;
  AjaxConnection.prototype.poll = function poll () {
    var this$1 = this;
    var pollStartMs = new Date().getTime();
    ajaxPut('/control?body=' + this.dataPacket, this.dataPacket, this.timeoutMillis, function (err, res) {
      this$1.lastError = err
      if (this$1.state === Connection$$1.DISCONNECTED) {
        this$1.setResponseData(null)
        return
      }
      if (!this$1.lastError) {
        if (this$1.state !== Connection$$1.CONNECTED) {
          this$1.setState(Connection$$1.CONNECTED)
        }
        this$1.pingTimeMs = new Date().getTime() - pollStartMs
        this$1.setResponseData(res.data)
      } else {
        this$1.setState(Connection$$1.ERROR)
        this$1.setResponseData(null)
      }
      var pollMs = (this$1.state === Connection$$1.ERROR) ? 1000 : 50;
      this$1.timerId = setTimeout(this$1.poll.bind(this$1), pollMs)
    })
  };
  AjaxConnection.prototype.start = function start () {
    this.setState(Connection$$1.CONNECTING)
    Connection$$1.prototype.start.call(this)
    this.poll()
  };
  AjaxConnection.prototype.stop = function stop () {
    if (this.timerId) { clearTimeout(this.timerId) }
    Connection$$1.prototype.stop.call(this)
    this.setState(Connection$$1.DISCONNECTED)
    this.setResponseData(null)
  };
  return AjaxConnection;
}(Connection));

var WebSocketConnection = (function (Connection$$1) {
  function WebSocketConnection (hostName) {
    Connection$$1.call(this)
    var ref = document.location;
    var hostname = ref.hostname;
    var port = ref.port;
    this.hostName = hostName || (port !== 80) ? (hostname + ":" + port) : hostname
    this.socket = null
    this.startTimeMs = null
  }
  if ( Connection$$1 ) WebSocketConnection.__proto__ = Connection$$1;
  WebSocketConnection.prototype = Object.create( Connection$$1 && Connection$$1.prototype );
  WebSocketConnection.prototype.constructor = WebSocketConnection;
  WebSocketConnection.prototype.start = function start () {
    var this$1 = this;
    this.setState(Connection$$1.CONNECTING)
    Connection$$1.prototype.start.call(this)
    this.startTimeMs = new Date().getTime()
    this.socket = new WebSocket(("ws://" + (this.hostName) + "/ws"), [ 'arduino' ])
    this.socket.onopen = function () {
      this$1.setState(Connection$$1.CONNECTED)
    }
    this.socket.onerror = function (err) {
      this$1.lastError = err
      this$1.setState(Connection$$1.ERROR)
      this$1.setResponseData(null)
    }
    this.socket.onmessage = function (event) {
      this$1.pingTimeMs = new Date().getTime() - this$1.startTimeMs
      this$1.setResponseData(event.data)
    }
    this.socket.onclose = function (event) {
      if (this$1.state !== Connection$$1.ERROR) {
        this$1.lastError = new Error('Connection lost')
        this$1.setState(Connection$$1.ERROR)
        this$1.setResponseData(null)
        this$1.socket = null
      }
    }
  };
  WebSocketConnection.prototype.stop = function stop () {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
      this.setResponseData(null)
      this.socket = null
    }
    Connection$$1.prototype.stop.call(this)
    this.setState(Connection$$1.DISCONNECTED)
  };
  WebSocketConnection.prototype.setRobotData = function setRobotData (data) {
    Connection$$1.prototype.setRobotData.call(this, data)
    if (this.socket && this.state === Connection$$1.CONNECTED) {
      if (this.socket.readyState !== WebSocket.OPEN) {
        this.lastError = new Error(("Invalid socket state: " + ((this.socket.readyState === WebSocket.CONNECTING) ? 'CONNECTING'
          : (this.socket.readyState === WebSocket.CLOSING) ? 'CLOSING'
          : (this.socket.readyState === WebSocket.CLOSED) ? 'CLOSED'
          : 'UNKNOWN')))
        this.setState(Connection$$1.ERROR)
        return
      }
      try {
        this.startTimeMs = new Date().getTime()
        this.socket.send(this.dataPacket)
      } catch (err) {
        this.lastError = err
        this.setState(Connection$$1.ERROR)
        this.setResponseData(null)
      }
    }
  };
  return WebSocketConnection;
}(Connection));

var heading = document.getElementById('heading');
var statusIcon = document.getElementById('status-box');
var statusText = document.getElementById('status-text');
var infoBox = document.getElementById('info-box');
var errorBox = document.getElementById('error-box');
var canvas = document.getElementById('touch-canvas');
var resizeCanvas = function () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight - heading.clientHeight - 1
  window.scrollTo(0, 0)
};
window.addEventListener('orientationchange', resizeCanvas)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
ControlManager.setCanvas(canvas)
function addError (ref) {
  var type = ref.type;
  var message = ref.message;
  var eline = document.createElement('li');
  eline.className = type
  var tspan = document.createElement('span');
  tspan.className = 'type'
  tspan.innerText = type
  eline.appendChild(tspan)
  var mspan = document.createElement('span');
  mspan.className = 'message'
  mspan.innerText = message
  eline.appendChild(mspan)
  errorBox.appendChild(eline)
}
function clearErrors (type) {
  var els = type
    ? errorBox.getElementsByClassName(type)
    : errorBox.getElementByTagName('ul');
  for (var i = 0; i < els.length; i++) {
    els[i].remove()
  }
}
function setConnectionState (state) {
  console.log('Connection state:', state)
  switch (state) {
    case Connection.DISCONNECTED:
    case Connection.CONNECTING:
      statusIcon.style.backgroundColor = 'yellow'
      break
    case Connection.CONNECTED:
      statusIcon.style.backgroundColor = 'green'
      break
    default:
      statusIcon.style.backgroundColor = 'red'
      break
  }
  statusText.innerText = state
}
function setConnectionInfo (conn) {
  infoBox.innerText = "Ping: " + ((conn.pingTimeMs !== null) ? ((conn.pingTimeMs) + " ms") : '----')
}
var getHardwareConfig = new Promise(function (resolve, reject) { return ajaxGet('./hardware.json', function (err, resp) {
    if (err) { return reject(err) }
    resolve(JSON.parse(resp.data))
  }); }
);
var waitForLoad = new Promise(function (resolve, reject) {
  window.addEventListener('load', function () {
    console.log('Page loaded')
    resolve()
  })
});
var WEBSOCKET = true;
var _runLoop = true;
var _connection = null;
Promise.all([ getHardwareConfig, waitForLoad ])
  .then(function (ref) {
    var config = ref[0];
    HardwareManager.config = config
    if (window.setup) {
      console.log('Running robot setup...')
      try {
        window.setup()
      } catch (error) {
        addError({ type: 'SETUP', message: error.message })
      }
    }
    var hwErrors = HardwareManager.validateConfig();
    if (hwErrors) {
      for (var i = 0; i < hwErrors.length; i++) {
        addError(hwErrors[i])
      }
    }
    _connection = WEBSOCKET ? new WebSocketConnection() : new AjaxConnection()
    _connection.onstatechange = function (newState, oldState) {
      setConnectionState(newState)
      if (newState === Connection.ERROR) {
        console.log(_connection.lastError)
        addError({ type: 'CONNECTION', message: _connection.lastError.message })
      } else if (oldState === Connection.ERROR) {
        clearErrors('CONNECTION')
      }
    }
    _connection.onresponsedata = function (data) {
      HardwareManager.setInputs(data)
      setConnectionInfo(_connection)
    }
    setConnectionState(_connection.state)
    _connection.setRobotData(getPacket(HardwareManager.getOutputs()))
    _connection.start()
    ControlManager.start()
    ControlManager.onupdate = function () {
      if (!_runLoop) { return }
      if (window.loop) {
        try {
          window.loop()
        } catch (error) {
          addError({ type: 'LOOP', message: error.message })
        }
      }
      var request = getPacket(HardwareManager.getOutputs());
      _connection.setRobotData(request)
    }
  })
  .catch(function (err) {
    addError({ type: 'SCRIPT', message: err.message })
  })
function getPacket (json) {
  return ((json.leftMotor) + ":" + (json.rightMotor) + ":" + (json.weaponMotor))
}
//# sourceMappingURL=bundle.js.map
