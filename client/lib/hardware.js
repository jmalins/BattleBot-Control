/**
 * Hardware interface layer used by end-user code. Allows for creation of
 * logical devices, such as motors and servos, separate from their physical
 * config. This lets the same code be used across different robots and frees
 * novices of having to deal with hardware configuration for "kit" robots.
 *
 * @module hardware
 */
import { constrain, map } from './utils'

/**************************************************************
 * HardwareManager Implementation                             *
 **************************************************************/

/**
 *  Hardware manager
 */
export const HardwareManager = {
  devices: { },
  config: null,

  /**
   * Validate the hardware configuration. Returns an array of any errors.
   * This method makes sure the robot only defines logical devices that are
   * configured in the hardware.
   *
   * @return {array} - any errors in configuration, or null if no errors
   */
  validateConfig () {
    // error collection //
    const errors = [ ]
    const addError = (message) => errors.push({ type: 'HARDWARE', message })

    // configuration must be set //
    if (!HardwareManager.config) {
      addError('Hardware configuration not set')
    } else if (!HardwareManager.config.devices) {
      addError('Hardware configuration is missing devices')
    }
    if (errors.length) return errors

    // validate all logical devices are configured //
    for (const deviceName in HardwareManager.devices) {
      const device = HardwareManager.devices[deviceName]
      const config = HardwareManager.config.devices[deviceName]
      if (config) {
        // make sure the driver is known //
        const driverName = config.driver
        if (!device.supportsDriver(driverName)) {
          errors.push(`Device ${deviceName} has invalid driver: ${driverName}`)
        }
      } else {
        // logical device name has no configuration onboard robot //
        addError(`Device has no configuration: ${deviceName}`)
      }
    }

    return (errors.length) ? errors : null
  },

  /**
   *
   * @return {object} - values for all output devices
   */
  getOutputs () {
    const packet = { }
    // get device outputs //
    for (const deviceName in HardwareManager.devices) {
      const device = HardwareManager.devices[deviceName]
      if (device.getOutput) {
        packet[deviceName] = device.getOutput()
      }
    }
    return packet
  },

  /**
   * Set the values of named input devices. This method is called
   * with raw values received from the robot.
   *
   * @param {object} values - values of all input devices
   */
  setInputs (values) {
    // write inputs to devices //
    for (const deviceName in values) {
      const device = HardwareManager.devices[deviceName]
      if (device && device.setInput) {
        device.setInput(values[deviceName])
      }
    }
  }
}

function addDevice (name, device) {
  if (HardwareManager.devices[name]) {
    throw new Error(`Device already exists: ${name}`)
  }
  HardwareManager.devices[name] = device
}

/***************************************************************
 * Device Types                                                *
 ***************************************************************/

/**
 * Generic device base class.
 *
 */
export class Device {
  /**
   * Constructor
   * @param {string} name - name of the device
   */
  constructor (name) {
    this.name = name
    this.value = 0
    addDevice(name, this)
  }

  set (value) {
    this.value = value
  }

  /**
   * Get the value of the device.
   *
   * For output devices, this reads back the last call to 'set()', for
   * input devices, it returns the last value read from the controller.
   *
   * @return {number} current value of the device
   */
  get () {
    return this.value
  }

  /**
   * Tests whether a device supports the specified driver.
   */
  supportsDriver (driverName) {
    return false
  }
}

/**
 * @class Motor
 *
 * Controls a motor, which is presumed to support both forward
 * reverse movement with values of -1.0 to 1.0.
 */
export class Motor extends Device {
  /**
   * Constructor
   * @constructor
   * @param {string} name - name of the motor
   */
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

  supportsDriver (driverName) {
    return [ 'PWM_HBRIDGE', 'PWM' ].indexOf(driverName) !== -1
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

  supportsDriver (driverName) {
    return [ 'PWM' ].indexOf(driverName) !== -1
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

  supportsDriver (driverName) {
    return [ 'DIGITAL_OUT' ].indexOf(driverName) !== -1
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

  supportsDriver (driverName) {
    return [ 'DIGITAL_IN' ].indexOf(driverName) !== -1
  }
}
