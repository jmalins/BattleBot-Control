// state variables //
const _devices = { }
let _config = null

/**
 * Manages the virtual hardware layer, allowing uses to send commands to
 * the robot or receive sensor values from the robot by manipulating hardware
 * interface objects.
 *
 * The class is part of the core framework infrastructure and should not be
 * needed in your code under most circumstances.
 *
 * @protected
 */
export default class HardwareManager {
  /**
   * Set the hardware config. This is stored as 'hardware.json' on the
   * robot file-system.
   *
   * @protected
   * @param {object} value - the hardware.json object
   */
  static set config (value) {
    _config = value
  }

  /**
   * Validate the hardware configuration. Returns an array of any errors.
   * This method makes sure the robot only defines logical devices that are
   * configured in the hardware.
   *
   * @protected
   * @return {array} - any errors in configuration, or null if no errors
   */
  static validateConfig () {
    // error collection //
    const errors = [ ]
    const addError = (message) => errors.push({ type: 'HARDWARE', message })

    // configuration must be set //
    if (!_config) {
      addError('Hardware configuration not set')
    } else if (!_config.devices) {
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
  }

  /**
   * Get the outputs of all hardware devices by device name. This
   * method is called by the framework to build the data packet to
   * be sent to the robot.
   *
   * @protected
   * @return {Map<string,number>} - values for all output devices by device name
   */
  static getOutputs () {
    const packet = { }
    // get device outputs //
    for (const deviceName in _devices) {
      const device = _devices[deviceName]
      if (device.getOutput) {
        packet[deviceName] = device.getOutput()
      }
    }
    return packet
  }

  /**
   * Set the values of named input devices. This method is called
   * by the framework with raw values received from the robot.
   *
   * @protected
   * @param {object} values - values of all input devices
   */
  static setInputs (values) {
    // write inputs to devices //
    for (const deviceName in values) {
      const device = _devices[deviceName]
      if (device && device.setInput) {
        device.setInput(values[deviceName])
      }
    }
  }

  /**
   * Called by the Device class constructor to register a device
   * with the HardwareManager.
   *
   * @private
   * @param {string} device - device name
   * @throws {Error} device with that name already exists
   */
  static registerDevice (device) {
    const name = device.name
    if (_devices[name]) {
      throw new Error(`Device already exists: ${name}`)
    }
    _devices[name] = device
  }
}
