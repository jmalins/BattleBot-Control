import Device from './Device'

/**
 * Digital Output
 *
 * A digital output device that turns a device connected to
 * a pin, such as an LED, on and off.
 */
export default class DigitalOutput extends Device {
  /**
   * Constructor
   *
   * @param {string} name - name of the digital output
   */
  constructor (name) {
    super(name)
    /**
     * Is the output pin inverted.
     *
     * Defaults to `false`.
     * @type {boolean}
     */
    this.inverted = false
    this.set(false)
  }

  /**
   * Set the value of the output. Any 'falsy' value (false, 0, null, etc.)
   * will translate to an output of LOW. Any other value will translate to
   * an output of HIGH.
   *
   * @param {number} [value=0] - the digital output value
   */
  set (value) {
    super.set(!!value ^ this.reversed ? 1 : 0)
  }

  /**
   * Returns the output. This will be either the string '1' or '0'.
   *
   * @override
   * @protected
   * @return {string} the output value
   */
  getOutput () {
    return this.get().toString()
  }

  /**
   * Does the output support a specified driver.
   *
   * Digital outputs currently support the following drivers:
   *
   *  - DIGITAL_OUT : an output pin
   *
   * @private
   * @param {string} driverName - name of the proposed driver
   * @return {boolean} true if the DigitalOutput supports the specified driver.
   */
  supportsDriver (driverName) {
    return [ 'DIGITAL_OUT' ].indexOf(driverName) !== -1
  }
}
