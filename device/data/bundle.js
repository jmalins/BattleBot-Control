/** machine generated, do not edit **/

/* eslint-disable */
'use strict';

function constrain (value, min, max) {
  if (value < min) { return min }
  if (value > max) { return max }
  return value
}
function map (value, inputMin, inputMax, outputMin, outputMax) {
  return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin
}

var SETUP = 'SETUP';
var DATA = 'DATA';
var Errors = {
  add: function add (type, message) {
    console.error(type, message)
  }
};

var _configs = { };
var DriverOptions = {
  DigitalInput: {
    pin: true
  },
  DigitalOutput: {
    pin: true
  },
  PWM_HBridge: {
    pwmPin: true,
    dirPin: true,
    reverse: false
  },
  PWM: {
    pwmPin: true,
    minMicroseconds: false,
    maxMicroseconds: false
  }
};
var Hardware = {
  devices: { },
  configure: function configure (config) {
    for (var deviceName in config) {
      var device = config[deviceName];
      var keys = Object.keys(device);
      if (keys.length !== 1) {
        Errors.add(SETUP, ("Driver not defined for device: " + deviceName))
        continue
      }
      var driverName = keys[0];
      var options = device[driverName];
      var driverOpts = DriverOptions[driverName];
      if (!driverOpts) {
        Errors.add(SETUP, ("Unknown driver name: " + driverName))
        continue
      }
      var errors = false;
      for (var optName in driverOpts) {
        if (!options[optName] && driverOpts[optName]) {
          Errors.add(SETUP, ("Driver '" + deviceName + "." + driverName + "' requires option: " + optName))
          errors = true
        }
      }
      for (var optName$1 in options) {
        if (typeof driverOpts[optName$1] === 'undefined') {
          Errors.add(SETUP, ("Driver '" + deviceName + "." + driverName + "' has unsupported option: " + optName$1))
          errors = true
          continue
        }
        var value = options[optName$1];
        if (!Number.isInteger(value)) {
          Errors.add(SETUP, ("Driver option '" + deviceName + "." + driverName + "." + optName$1 + "' has invalid value: " + value))
          errors = true
        }
      }
      if (errors) { return }
      _configs[deviceName] = {
        driver: driverName,
        options: options
      }
    }
  },
  getConfigurationJSON: function getConfigurationJSON () {
    for (var deviceName in Hardware.devices) {
      var config = _configs[deviceName];
      if (!config) {
        Errors.add(SETUP, ("Device is not configured: " + deviceName))
      }
    }
    return JSON.stringify(_configs)
  },
  getRequestJSON: function getRequestJSON () {
    var packet = { };
    for (var deviceName in Hardware.devices) {
      var device = Hardware.devices[deviceName];
      if (device.getOutput) {
        packet[deviceName] = device.getOutput()
      }
    }
    return JSON.stringify(packet)
  },
  setResponseJSON: function setResponseJSON (json) {
    try {
      var data = JSON.parse(json);
      for (var deviceName in data) {
        var device = Hardware.devices[deviceName];
        if (device && device.setInput) {
          device.setInput(data[deviceName])
        }
      }
    } catch (err) {
      Errors.add(DATA, ("Invalid response JSON: '" + json + "'"))
    }
  }
};
function addDevice (name, device) {
  if (Hardware.devices[name]) {
    Errors.add(SETUP, ("Device already exists: " + name))
    return
  }
  Hardware.devices[name] = device
}
var Device = function Device (name) {
  this.name = name
  this.value = 0
  addDevice(name, this)
};
Device.prototype.set = function set (value) {
  this.value = value
};
Device.prototype.get = function get () {
  return this.value
};
var Motor = (function (Device) {
  function Motor (name) {
    Device.call(this, name)
    this.reversed = false
    this.set(0)
  }
  if ( Device ) Motor.__proto__ = Device;
  Motor.prototype = Object.create( Device && Device.prototype );
  Motor.prototype.constructor = Motor;
  Motor.prototype.set = function set (value) {
    Device.prototype.set.call(this, constrain(this.reversed ? -value : value, -1.0, 1.0))
  };
  Motor.prototype.getOutput = function getOutput () {
    return Math.round(this.get() * 1023).toString()
  };
  return Motor;
}(Device));
var Servo = (function (Device) {
  function Servo (name) {
    Device.call(this, name)
    this.minOutput = 0.0
    this.maxOutput = 1.0
    this.reversed = false
    this.set(0.5)
  }
  if ( Device ) Servo.__proto__ = Device;
  Servo.prototype = Object.create( Device && Device.prototype );
  Servo.prototype.constructor = Servo;
  Servo.prototype.set = function set (value) {
    if (this.reversed) {
      Device.prototype.set.call(this, map(value, 0.0, 1.0, this.minOutput, this.maxOutput))
    } else {
      Device.prototype.set.call(this, map(value, 0.0, 1.0, this.maxOutput, this.minOutput))
    }
  };
  Servo.prototype.getOutput = function getOutput () {
    return Math.round(this.get() * 1023).toString()
  };
  return Servo;
}(Device));
var DigitalOutput = (function (Device) {
  function DigitalOutput (name) {
    Device.call(this, name)
    this.reversed = false
    this.set(false)
  }
  if ( Device ) DigitalOutput.__proto__ = Device;
  DigitalOutput.prototype = Object.create( Device && Device.prototype );
  DigitalOutput.prototype.constructor = DigitalOutput;
  DigitalOutput.prototype.set = function set (value) {
    Device.prototype.set.call(this, !!value ^ this.reversed ? 1 : 0)
  };
  DigitalOutput.prototype.getOutput = function getOutput () {
    return this.get().toString()
  };
  return DigitalOutput;
}(Device));
var DigitalInput = (function (Device) {
  function DigitalInput (name) {
    Device.call(this, name)
    this.value = false
  }
  if ( Device ) DigitalInput.__proto__ = Device;
  DigitalInput.prototype = Object.create( Device && Device.prototype );
  DigitalInput.prototype.constructor = DigitalInput;
  DigitalInput.prototype.get = function get () {
    return this.value
  };
  DigitalInput.prototype.setInput = function setInput (value) {
    this.value = !!value
  };
  return DigitalInput;
}(Device));

var TwoWheelDrive = function TwoWheelDrive () {
  this.motors = [
    new Motor('leftMotor'),
    new Motor('rightMotor')
  ]
  this.swapMotors = false
};
var prototypeAccessors = { leftMotor: {},rightMotor: {},reverseLeftMotor: {},reverseRightMotor: {} };
prototypeAccessors.leftMotor.get = function () {
  return this.motors[this.swapMotors ? 1 : 0]
};
prototypeAccessors.rightMotor.get = function () {
  return this.motors[this.swapMotors ? 1 : 0]
};
prototypeAccessors.reverseLeftMotor.set = function (value) {
  this.leftMotor.reversed = value
};
prototypeAccessors.reverseRightMotor.set = function (value) {
  this.rightMotor.reversed = value
};
TwoWheelDrive.prototype.setMotorPowers = function setMotorPowers (left, right) {
  this.leftMotor.set(constrain(left, -1.0, 1.0))
  this.rightMotor.set(constrain(right, -1.0, 1.0))
};
TwoWheelDrive.prototype.stop = function stop () {
  this.leftMotor.set(0)
  this.rightMotor.set(0)
};
Object.defineProperties( TwoWheelDrive.prototype, prototypeAccessors );
var TankDrive = (function (TwoWheelDrive) {
  function TankDrive () {
    TwoWheelDrive.apply(this, arguments);
  }
  if ( TwoWheelDrive ) TankDrive.__proto__ = TwoWheelDrive;
  TankDrive.prototype = Object.create( TwoWheelDrive && TwoWheelDrive.prototype );
  TankDrive.prototype.constructor = TankDrive;
  TankDrive.prototype.setLeftAndRightSpeed = function setLeftAndRightSpeed (left, right) {
    this.setMotorPowers(left, right)
  };
  return TankDrive;
}(TwoWheelDrive));
var ArcadeDrive = (function (TwoWheelDrive) {
  function ArcadeDrive () {
    TwoWheelDrive.apply(this, arguments);
  }
  if ( TwoWheelDrive ) ArcadeDrive.__proto__ = TwoWheelDrive;
  ArcadeDrive.prototype = Object.create( TwoWheelDrive && TwoWheelDrive.prototype );
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

var _touchOwners = { };
function convertTouch (touch) {
  return {
    identifier: touch.identifier,
    clientX: Math.round(touch.clientX - TouchManager.canvas.offsetLeft),
    clientY: Math.round(touch.clientY - TouchManager.canvas.offsetTop),
    force: touch.force
  }
}
function doAdd (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  for (var controlName in TouchManager.controls) {
    var control = TouchManager.controls[controlName];
    if (control.matchesTouch(touch)) {
      _touchOwners[touch.identifier] = control
      control.touch = convertTouch(touch)
      break
    }
  }
  console.log('touchStart', touch, touch.identifier)
}
function doUpdate (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  var control = _touchOwners[touch.identifier];
  if (!control) { return }
  control.touch = convertTouch(touch)
  console.log('touchMove', touch, touch.identifier)
}
function doRemove (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  var control = _touchOwners[touch.identifier];
  if (!control) { return }
  control.touch = null
  delete _touchOwners[touch.identifier]
  console.log('touchEnd', touch, touch.identifier)
}
var FRAME_RATE = 35;
var _oldWidth;
var _oldHeight;
var TouchManager = {
  canvas: null,
  ctx: null,
  intervalID: null,
  controls: { },
  setCanvas: function setCanvas (canvas) {
    function handleTouches (e, handler) {
      if (handler === doUpdate) {
        e.preventDefault()
      }
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
    TouchManager.canvas = canvas
    TouchManager.ctx = canvas.getContext('2d')
  },
  start: function start () {
    TouchManager.intervalID = setInterval(
      function () { return TouchManager.update(); },
      1000 / FRAME_RATE
    )
  },
  stop: function stop () {
    if (TouchManager.intervalID) {
      clearInterval(TouchManager.intervalID)
    }
  },
  update: function update () {
    var canvas = TouchManager.canvas;
    var ctx = TouchManager.ctx;
    var controls = TouchManager.controls;
    var resized = (canvas.width !== _oldWidth || canvas.height !== _oldHeight);
    if (resized) {
      _oldWidth = canvas.width
      _oldHeight = canvas.height
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (var controlName in controls) {
      var control = controls[controlName];
      if (resized) { control.pixelCache = null }
      control.draw(ctx)
    }
  }
};
function addControl (name, control) {
  if (TouchManager.controls[name]) {
    Errors.add(SETUP, ("Control already exists: " + name))
    return
  }
  TouchManager.controls[name] = control
}
function convertToPixels (dim, value) {
  var reference;
  switch (dim) {
    case 'y':
    case 'height':
      reference = TouchManager.canvas.height
      break
    default:
      reference = TouchManager.canvas.width
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
}
var Control = function Control (name) {
  this.name = name || ("control" + (++Control.count))
  this.touch = null
  this.pixelCache = null
  addControl(name, this)
};
Control.prototype.matchesTouch = function matchesTouch (touch) {
  return false
};
Control.prototype.getPixelDimensions = function getPixelDimensions () {
  if (this.pixelCache) { return this.pixelCache }
  var dimensions = this.getDimensions();
  var pixels = {};
  for (var dimName in dimensions) {
    pixels[dimName] = convertToPixels(dimName, dimensions[dimName])
  }
  console.log(this.name, pixels)
  return (this.pixelCache = pixels)
};
Control.count = 0
var Joystick = (function (Control) {
  function Joystick (name) {
    Control.call(this, name)
    this.position = { x: 0, y: 0 }
    this.radius = 10
    this.sticky = false
    this.style = 'white'
  }
  if ( Control ) Joystick.__proto__ = Control;
  Joystick.prototype = Object.create( Control && Control.prototype );
  Joystick.prototype.constructor = Joystick;
  var prototypeAccessors = { x: {},y: {} };
  prototypeAccessors.x.get = function () {
    if (!this.touch) { return 0.0 }
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var r = ref.r;
    return (this.touch.clientX - x) / r
  };
  prototypeAccessors.y.get = function () {
    if (!this.touch) { return 0.0 }
    var ref = this.getPixelDimensions();
    var y = ref.y;
    var r = ref.r;
    return (y - this.touch.clientY) / r
  };
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
  Joystick.prototype.draw = function draw (ctx) {
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 6
    ctx.arc(x, y, 40, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 2
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    ctx.stroke()
    if (this.touch) {
      var ref$1 = this.touch;
      var clientX = ref$1.clientX;
      var clientY = ref$1.clientY;
      ctx.beginPath()
      ctx.strokeStyle = this.style
      ctx.arc(clientX, clientY, 40, 0, Math.PI * 2, true)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.fillText(
      ("joystick: " + (this.name) + ", x: " + (this.x.toFixed(3)) + ", y: " + (this.y.toFixed(3))),
      x - 50, y + 75
    )
  };
  Object.defineProperties( Joystick.prototype, prototypeAccessors );
  return Joystick;
}(Control));
var Button = (function (Control) {
  function Button (name) {
    Control.call(this, name)
    this.position = { x: 0, y: 0 }
    this.radius = 10
    this.sticky = false
    this.style = 'white'
  }
  if ( Control ) Button.__proto__ = Control;
  Button.prototype = Object.create( Control && Control.prototype );
  Button.prototype.constructor = Button;
  var prototypeAccessors$1 = { pressed: {} };
  prototypeAccessors$1.pressed.get = function () {
    return !!this.touch
  };
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
  };
  Object.defineProperties( Button.prototype, prototypeAccessors$1 );
  return Button;
}(Control));
var Slider = (function (Control) {
  function Slider (name) {
    Control.call(this, name)
    this.position = { x: 0, y: 0 }
    this.radius = 10
    this.length = 30
    this.type = Slider.VERTICAL
    this.sticky = true
    this.style = 'white'
  }
  if ( Control ) Slider.__proto__ = Control;
  Slider.prototype = Object.create( Control && Control.prototype );
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
        x1: x,
        x2: x + l,
        xa: x + l,
        y1: y - r,
        y2: y + r,
        ya: y
      }
    } else {
      return {
        x1: x - r,
        x2: x + r,
        xa: x,
        y1: y,
        y2: y + l,
        ya: y + l
      }
    }
  };
  Slider.prototype.matchesTouch = function matchesTouch (touch) {
    var clientX = touch.clientX;
    var clientY = touch.clientY;
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var ref$1 = this.getHelperDimensions();
    var x1 = ref$1.x1;
    var y1 = ref$1.y1;
    var x2 = ref$1.x2;
    var y2 = ref$1.y2;
    var xa = ref$1.xa;
    var ya = ref$1.ya;
    var dx = (x - clientX);
    var dy = (y - clientY);
    if (Math.sqrt(dx * dx + dy * dy) <= r) { return true }
    var dxa = (xa - clientX);
    var dya = (ya - clientY);
    if (Math.sqrt(dxa * dxa + dya * dya) <= r) { return true }
    console.log(clientX, xa, dxa, clientY, ya, dya)
    return (clientX >= x1) && (clientX <= x2) && (clientY >= y1) && (clientY <= y2)
  };
  Slider.prototype.draw = function draw (ctx) {
    var ref = this.getPixelDimensions();
    var x = ref.x;
    var y = ref.y;
    var r = ref.r;
    var ref$1 = this.getHelperDimensions();
    var x1 = ref$1.x1;
    var y1 = ref$1.y1;
    var x2 = ref$1.x2;
    var y2 = ref$1.y2;
    var xa = ref$1.xa;
    var ya = ref$1.ya;
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
    if (this.touch) {
      var ref$2 = this.touch;
      var clientX = ref$2.clientX;
      var clientY = ref$2.clientY;
      ctx.beginPath()
      if (this.type === Slider.HORIZONTAL) {
        ctx.arc(constrain(clientX, x, xa), y, r - 4, 0, Math.PI * 2, true)
      } else {
        ctx.arc(x, constrain(clientY, y, ya), r - 4, 0, Math.PI * 2, true)
      }
      ctx.strokeStyle = this.style
      ctx.stroke()
    }
  };
  return Slider;
}(Control));
Slider.HORIZONTAL = 'HORIZONTAL'
Slider.VERTICAL = 'VERTICAL'

var defaultConfig = {
  rightMotor: {
    PWM_HBridge: { pwmPin: 1, dirPin: 3 }
  },
  leftMotor: {
    PWM_HBridge: { pwmPin: 2, dirPin: 4 }
  },
  weaponMotor: {
    PWM: { pwmPin: 6, minMicroseconds: 900, maxMicroseconds: 1800 }
  },
  servo1: {
    PWM: { pwmPin: 7 }
  },
  servo2: {
    PWM: { pwmPin: 8 }
  }
}

Hardware.configure(defaultConfig)
var heading = document.getElementById('heading');
var canvas = document.getElementById('touch-canvas');
function resizeCanvas () {
  canvas.width = window.outerWidth
  canvas.height = window.outerHeight - heading.clientHeight - 1
  window.scrollTo(0, 0)
}
window.addEventListener('orientationchange', resizeCanvas)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
TouchManager.setCanvas(canvas)
window.addEventListener('load', function (e) {
  console.log('Loaded')
  if (window.setup) {
    console.log('Running setup...')
    window.setup()
  }
  console.log(JSON.parse(Hardware.getConfigurationJSON()), Hardware.devices)
  TouchManager.start()
})
//# sourceMappingURL=bundle.js.map
