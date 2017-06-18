import Device from './Device'
import { constrain } from '../utils'

/**
 * Controls a motor, which is presumed to support both forward
 * reverse movement with values of -1.0 to 1.0.
 */
export default class Motor extends Device {
  /**
   * Constructor
   *
   * @param {string} name - name of the motor
   */
  constructor (name) {
    super(name)
    /**
     * Is the motor direction reversed.
     *
     * Defaults to `false`.
     * @type {boolean}
     */
    this.reversed = false
    this.set(0)
  }

  /**
   * Set the value of the motor. This is constrained betweem -1.0 (full reverse)
   * and 1.0 (full forward). A value of 0 is stopped.
   *
   * @param {number} [value=0] - the motor power value [-1.0, 1.0]
   */
  set (value = 0) {
    super.set(constrain(this.reversed ? -value : value, -1.0, 1.0))
  }

  /**
   * Returns the motor output. This will be an integer between -1023 and
   * 1023, converted to a string.
   *
   * @override
   * @protected
   * @return {string} the motor value [-1023, 1023]
   */
  getOutput () {
    return Math.round(this.get() * 1023).toString()
  }

  /**
   * Does the Motor support a specified driver.
   *
   * Motors currently support the following drivers for motor-like devices:
   *
   *  - PWM_HBRIDGE : reversible power driver (speed and direction outputs)
   *  - PWM : brushless ESC
   *  - PWM : single direction power driver
   *  - PWM : continuous rotation servo
   *
   * @private
   * @param {string} driverName - name of the proposed driver
   * @return {boolean} true if the Motor supports the specified driver.
   **/
  supportsDriver (driverName) {
    return [ 'PWM_HBRIDGE', 'PWM' ].indexOf(driverName) !== -1
  }
}
