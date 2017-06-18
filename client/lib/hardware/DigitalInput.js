import Device from './Device'

/**
 * Digital Input
 *
 * A digital input device, such as an input pin. This can be connected
 * to a switch, bump sensor, line follower or other digital device.
 */
export default class DigitalInput extends Device {
  /**
   * Constructor
   *
   * @param {string} name - name of the digital input
   */
  constructor (name) {
    super(name)
    /**
     * The value of the input.
     * @private
     * @type {boolean}
     */
    this.value = false
  }

  /**
   * Get the value of the input as a boolean (true or false).
   *
   * @return {boolean} the value of the input
   */
  get () {
    return this.value
  }

  /**
   * Called by the framework to set the value of this input after
   * it is received from the robot.
   *
   * @override
   * @protected
   * @param {number} value - the value to set
   */
  setInput (value) {
    this.value = !!value
  }

  /**
   * Does the input support a specified driver.
   *
   * Digital inputs currently support the following drivers:
   *
   *  - DIGITAL_IN : an input pin
   *
   * @private
   * @param {string} driverName - name of the proposed driver
   * @return {boolean} true if the DigitalInput supports the specified driver.
   */
  supportsDriver (driverName) {
    return [ 'DIGITAL_IN' ].indexOf(driverName) !== -1
  }
}
