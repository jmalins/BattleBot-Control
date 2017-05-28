/**
 * @module hardware
 */
import { constrain, map } from './utils'
import { Errors, SETUP, DATA } from './error'

/***************************************************************
 * Hardware Configuration                                      *
 ***************************************************************/

const _devices = { }
const _configs = { }

/**
 * All supported drivers and their allowed options. Options are marked
 * as true if required and false if optional.
 */
export const DriverOptions = {
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
}

/**
 *  Hardware manager
 */
export const Hardware = {
  configure (config) {
    // process all device names in the setup //
    for (const deviceName in config) {
      const device = config[deviceName]
      // must have only one driver under the device //
      const keys = Object.keys(device)
      if (keys.length !== 1) {
        Errors.add(SETUP, `Driver not defined for device: ${deviceName}`)
        continue
      }
      const driverName = keys[0]
      const options = device[driverName]
      // validate driver options //
      const driverOpts = DriverOptions[driverName]
      if (!driverOpts) {
        Errors.add(SETUP, `Unknown driver name: ${driverName}`)
        continue
      }
      // check require options //
      let errors = false
      for (const optName in driverOpts) {
        if (!options[optName] && driverOpts[optName]) {
          Errors.add(SETUP, `Driver for '${driverName}' requires option: ${optName}`)
          errors = true
        }
      }
      // make sure no extra options declared and format is an integer //
      for (const optName in options) {
        if (!driverOpts[optName]) {
          Errors.add(SETUP, `Driver for '${driverName}' has unsupported option: ${optName}`)
          errors = true
          continue
        }
        const value = options[optName]
        if (!Number.isInteger(value)) {
          Errors.add(SETUP, `Driver for '${driverName}' has invalid option '${optName}': ${value}`)
          errors = true
        }
      }
      if (errors) return

      _configs[deviceName] = {
        driver: driverName,
        options
      }
    }
  },

  getConfigurationJSON () {
    // validate all devices are configured //
    for (const deviceName in _devices) {
      const config = _configs[deviceName]
      if (!config) {
        Errors.add(SETUP, `Device is not configured: ${deviceName}`)
      }
    }
    return JSON.stringify(_configs)
  },

  getRequestJSON () {
    const packet = { }
    // get device outputs //
    for (const deviceName in _devices) {
      const device = _devices[deviceName]
      if (device.getOutput) {
        packet[deviceName] = device.getOutput()
      }
    }
    return JSON.stringify(packet)
  },

  setResponseJSON (json) {
    try {
      const data = JSON.parse(json)
      // write inputs to devices //
      for (const deviceName in data) {
        const device = _devices[deviceName]
        if (device && device.setInput) {
          device.setInput(data[deviceName])
        }
      }
    } catch (err) {
      Errors.add(DATA, `Invalid response JSON: '${json}'`)
    }
  }
}

function _addDevice (name, device) {
  if (_devices[name]) {
    Errors.add(SETUP, `Device already exists: ${name}`)
    return
  }
  _devices[name] = device
}

/***************************************************************
 * Device Types                                                *
 ***************************************************************/

/**
 * Generic device base class.
 */
export class Device {
  constructor (name) {
    this.name = name
    _addDevice(name, this)
    this.value = 0
  }

  set (value) {
    this.value = value
  }

  get () {
    return this.value
  }
}

/**
 * Motor
 *
 * Controls a motor, which is presumed to support both forward
 * reverse movement with values of -1.0 to 1.0.
 */
export class Motor extends Device {
  constructor (name) {
    super(name)
    this.reversed = false
    this.set(0)
  }

  set (value) {
    super.set(constrain(this.reversed ? -value : value, -1.0, 1.0))
  }

  getOutput () {
    return Math.round(this.get() * 1023).toString()
  }
}

/**
 * Servo
 *
 * Controls a servo via a PWM output. Input values are 0.0 to 1.0,
 * representing the minimum and maximum position.
 */
export class Servo extends Device {
  constructor (name) {
    super(name)
    this.minOutput = 0.0
    this.maxOutput = 1.0
    this.reversed = false
    this.set(0.5)
  }

  set (value) {
    if (this.reversed) {
      super.set(map(value, 0.0, 1.0, this.minOutput, this.maxOutput))
    } else {
      super.set(map(value, 0.0, 1.0, this.maxOutput, this.minOutput))
    }
  }

  getOutput () {
    return Math.round(this.get() * 1023).toString()
  }
}

/**
 * Digital Output
 *
 * A digital output device that turns a device connected to
 * a pin, such as an LED, on and off.
 */
export class DigitalOutput extends Device {
  constructor (name) {
    super(name)
    this.reversed = false
    this.set(false)
  }

  set (value) {
    super.set(!!value ^ this.reversed ? 1 : 0)
  }

  getOutput () {
    return this.get().toString()
  }
}

/**
 * Digital Input
 *
 * A digital input pin.
 */
export class DigitalInput extends Device {
  constructor (name) {
    super(name)
    this.value = false
  }

  get () {
    return this.value
  }

  setInput (value) {
    this.value = !!value
  }
}
