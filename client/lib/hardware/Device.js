import HardwareManager from './HardwareManager'

/**
 * Abstract base class for virtual devices.
 *
 * Extend this class to implement your own virtual devices.
 * In most code, this will not be needed.
 */
export default class Device {
  /**
   * Constructor
   * @param {string} name - name of the device
   */
  constructor (name) {
    /**
     * @type {string}
     */
    this.name = name
    /**
     * @private
     * @type {number}
     */
    this.value = 0
    HardwareManager.registerDevice(this)
  }

  /**
   *  Sets the value of this Device. Only used for output Devices.
   *  Calling this on input devices does nothing.
   *
   *  @param {number} value - the value to set.
   */
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
   * Gets the processed value of this Device in a form suitable
   * for sending to the robot firmware. This will generally not be as
   * a floating point number like in the framework.
   *
   * @abstract
   * @protected
   * @return {string} the translated value of the Device
   */
  getOutput () {
    return null
  }

  /**
   * Tests whether a device supports the specified driver.
   *
   * @protected
   * @param {string} driverName - name of the proposed driver for this device
   * @return {boolean} true if the Device supports this driver
   */
  supportsDriver (driverName) {
    return false
  }
}
