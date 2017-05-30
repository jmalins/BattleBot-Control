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
function ajaxGet (url, timeout, callback) {
  return ajax('GET', url, null, timeout, callback)
}
function ajaxPut (url, data, timeout, callback) {
  return ajax('PUT', url, data, timeout, callback)
}

var HardwareManager = {
  devices: { },
  config: null,
  validateConfig: function validateConfig () {
    var errors = [ ];
    var addError = function (message) { return errors.push({ type: 'HARDWARE', message: message }); };
    if (!HardwareManager.config) {
      addError('Hardware configuration not set')
    } else if (!HardwareManager.config.devices) {
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
  },
  getOutputs: function getOutputs () {
    var packet = { };
    for (var deviceName in HardwareManager.devices) {
      var device = HardwareManager.devices[deviceName];
      if (device.getOutput) {
        packet[deviceName] = device.getOutput()
      }
    }
    return packet
  },
  setInputs: function setInputs (values) {
    for (var deviceName in values) {
      var device = HardwareManager.devices[deviceName];
      if (device && device.setInput) {
        device.setInput(values[deviceName])
      }
    }
  }
};
function addDevice (name, device) {
  if (HardwareManager.devices[name]) {
    throw new Error(("Device already exists: " + name))
  }
  HardwareManager.devices[name] = device
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
Device.prototype.supportsDriver = function supportsDriver (driverName) {
  return false
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
  Motor.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'PWM_HBRIDGE', 'PWM' ].indexOf(driverName) !== -1
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
  Servo.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'PWM' ].indexOf(driverName) !== -1
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
  DigitalOutput.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'DIGITAL_OUT' ].indexOf(driverName) !== -1
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
  DigitalInput.prototype.supportsDriver = function supportsDriver (driverName) {
    return [ 'DIGITAL_IN' ].indexOf(driverName) !== -1
  };
  return DigitalInput;
}(Device));

var TwoWheelDrive = function TwoWheelDrive (leftMotor, rightMotor) {
  this.motors = [
    leftMotor || new Motor('leftMotor'),
    rightMotor || new Motor('rightMotor')
  ]
  this.swapMotors = false
};
var prototypeAccessors = { leftMotor: {},rightMotor: {},reverseLeftMotor: {},reverseRightMotor: {} };
prototypeAccessors.leftMotor.get = function () {
  return this.motors[this.swapMotors ? 1 : 0]
};
prototypeAccessors.rightMotor.get = function () {
  return this.motors[this.swapMotors ? 0 : 1]
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
    clientX: Math.round(touch.clientX - ControlManager.canvas.offsetLeft),
    clientY: Math.round(touch.clientY - ControlManager.canvas.offsetTop),
    force: touch.force
  }
}
function doAdd (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  for (var controlName in ControlManager.controls) {
    var control = ControlManager.controls[controlName];
    if (control.matchesTouch(touch)) {
      _touchOwners[touch.identifier] = control
      control.touch = convertTouch(touch)
      ControlManager.update()
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
  ControlManager.update()
}
function doRemove (touch) {
  if (typeof touch.identifier === 'undefined') { touch.identifier = 'mouse' }
  var control = _touchOwners[touch.identifier];
  if (!control) { return }
  control.touch = null
  delete _touchOwners[touch.identifier]
  console.log('touchEnd', touch, touch.identifier)
  ControlManager.update()
}
var FRAME_RATE = 35;
var _oldWidth;
var _oldHeight;
var ControlManager = {
  canvas: null,
  ctx: null,
  intervalID: null,
  controls: { },
  onupdate: null,
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
    ControlManager.canvas = canvas
    ControlManager.ctx = canvas.getContext('2d')
  },
  start: function start () {
    ControlManager.intervalID = setInterval(
      function () { return ControlManager.draw(); },
      1000 / FRAME_RATE
    )
  },
  stop: function stop () {
    if (ControlManager.intervalID) {
      clearInterval(ControlManager.intervalID)
    }
  },
  update: function update () {
    var onupdate = ControlManager.onupdate;
    if (typeof onupdate === 'function') {
      onupdate()
    }
  },
  draw: function draw () {
    var canvas = ControlManager.canvas;
    var ctx = ControlManager.ctx;
    var controls = ControlManager.controls;
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
  if (ControlManager.controls[name]) {
    throw new Error(("Control already exists: " + name))
  }
  ControlManager.controls[name] = control
}
function convertToPixels (dim, value) {
  var reference;
  switch (dim) {
    case 'y':
    case 'height':
      reference = ControlManager.canvas.height
      break
    default:
      reference = ControlManager.canvas.width
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
    return (x - this.touch.clientX) / r
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

var Connection = function Connection () {
  this.state = Connection.DISCONNECTED
  this.enabled = false
  this.lastError = null
  this.responseData = null
  this.onstatechange = null
  this.onresponsedata = null
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
  if (typeof this.onresponsedata === 'function') {
    this.onresponsedata(data)
  }
};
Connection.CONNECTED = 'Connected'
Connection.CONNECTING = 'Connecting'
Connection.DISCONNECTED = 'Disconnected'
Connection.ERROR = 'Error'
var AjaxConnection = (function (Connection) {
  function AjaxConnection (timeoutMillis) {
    Connection.call(this)
    this.timeoutMillis = timeoutMillis || 500
    this.timerId = null
  }
  if ( Connection ) AjaxConnection.__proto__ = Connection;
  AjaxConnection.prototype = Object.create( Connection && Connection.prototype );
  AjaxConnection.prototype.constructor = AjaxConnection;
  AjaxConnection.prototype.poll = function poll () {
    var this$1 = this;
    var pollStart = new Date();
    ajaxPut('/control?body=' + this.dataPacket, this.dataPacket, this.timeoutMillis, function (err, res) {
      this$1.lastError = err
      if (this$1.state === Connection.DISCONNECTED) {
        this$1.updateRate = 0
        return
      }
      if (!this$1.lastError) {
        if (this$1.state !== Connection.CONNECTED) {
          this$1.setState(Connection.CONNECTED)
        }
        this$1.setResponseData(res.data)
      } else {
        this$1.setState(Connection.ERROR)
      }
      var pollMs = (this$1.state === Connection.ERROR) ? 1000 : 50;
      this$1.timerId = setTimeout(this$1.poll.bind(this$1), pollMs)
      var delayMs = new Date().getTime() - pollStart.getTime();
      if (delayMs > 0) {
        this$1.updateRate = Math.floor(1000 / delayMs)
      }
    })
  };
  AjaxConnection.prototype.start = function start () {
    this.setState(Connection.CONNECTING)
    Connection.prototype.start.call(this)
    this.poll()
  };
  AjaxConnection.prototype.stop = function stop () {
    if (this.timerId) { clearTimeout(this.timerId) }
    Connection.prototype.stop.call(this)
    this.setState(Connection.DISCONNECTED)
  };
  return AjaxConnection;
}(Connection));
var WebSocketConnection = (function (Connection) {
  function WebSocketConnection (hostName) {
    Connection.call(this)
    var ref = document.location;
    var hostname = ref.hostname;
    var port = ref.port;
    this.hostName = hostName || (port !== 80) ? (hostname + ":" + port) : hostname
    this.socket = null
  }
  if ( Connection ) WebSocketConnection.__proto__ = Connection;
  WebSocketConnection.prototype = Object.create( Connection && Connection.prototype );
  WebSocketConnection.prototype.constructor = WebSocketConnection;
  WebSocketConnection.prototype.start = function start () {
    var this$1 = this;
    this.setState(Connection.CONNECTING)
    Connection.prototype.start.call(this)
    this.socket = new WebSocket(("ws://" + (this.hostName) + "/ws"), [ 'arduino' ])
    this.socket.onopen = function () {
      this$1.setState(Connection.CONNECTED)
    }
    this.socket.onerror = function (err) {
      this$1.lastError = err
      this$1.setState(Connection.ERROR)
    }
    this.socket.onmessage = function (event) {
      this$1.setResponseData(event.data)
    }
    this.socket.onclose = function (event) {
      if (this$1.state !== Connection.ERROR) {
        this$1.lastError = new Error('Connection lost')
        this$1.setState(Connection.ERROR)
        this$1.socket = null
      }
    }
  };
  WebSocketConnection.prototype.stop = function stop () {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
      this.socket = null
    }
    Connection.prototype.stop.call(this)
    this.setState(Connection.DISCONNECTED)
  };
  WebSocketConnection.prototype.setRobotData = function setRobotData (data) {
    Connection.prototype.setRobotData.call(this, data)
    if (this.socket && this.state === Connection.CONNECTED) {
      if (this.socket.readyState !== WebSocket.OPEN) {
        this.lastError = new Error(("Invalid socket state: " + ((this.socket.readyState === WebSocket.CONNECTING) ? 'CONNECTING'
          : (this.socket.readyState === WebSocket.CLOSING) ? 'CLOSING'
          : (this.socket.readyState === WebSocket.CLOSED) ? 'CLOSED'
          : 'UNKNOWN')))
        this.setState(Connection.ERROR)
        return
      }
      try {
        this.socket.send(this.dataPacket)
      } catch (err) {
        this.lastError = err
        this.setState(Connection.ERROR)
      }
    }
  };
  return WebSocketConnection;
}(Connection));

var heading = document.getElementById('heading');
var statusIcon = document.getElementById('status-box');
var statusText = document.getElementById('status-text');
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
  .catch(function (err) { return console.error('Error loading', err); })
function getPacket (json) {
  return ((json.leftMotor) + ":" + (json.rightMotor) + ":" + (json.weaponMotor))
}
//# sourceMappingURL=bundle.js.map
