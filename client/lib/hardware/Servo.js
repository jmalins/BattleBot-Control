import Device from './Device'
import { map } from '../utils'

/**
 * Controls a servo via a PWM output. Input values are 0.0 to 1.0,
 * representing the minimum and maximum rotational positions.
 */
export default class Servo extends Device {
  /**
   * Constructor.
   *
   * @param {string} name - name of the Servo
   */
  constructor (name) {
    super(name)
    /**
     * The minimum value of the servo output, on a normalized scale of [0, 1.0].
     *
     * To limit the Servo minimum position to a value of 25% of full scale, set
     * minOutput to 0.25.
     *
     * @type {number}
     */
    this.minOutput = 0.0
    /**
     * The maximum value of the servo output, on a normalized scale of [0, 1.0].
     *
     * To limit the Servo maximum position to a value of 75% of full scale, set
     * minOutput to 0.75.
     *
     * @type {number}
     */
    this.maxOutput = 1.0
    /**
     * Should the servo direction be swapped.
     *
     * If true, an input of 0 will correspond to 100% full scale, while an input of
     * 1.0 will correspond to 0% of full scale.
     *
     * @type {boolean}
     */
    this.reversed = false
    this.set(0.5)
  }

  /**
   * Set the value of the Servo on the configured scale between minOutput and
   * maxOutput. Value of 0 corresponds to minOutput and 1.0 corresponds to maxOutput.
   * If `reversed` is set, the values with be swapped.
   *
   * @param {number} [value=0] - the servo position [0, 1.0]
   */
  set (value = 0) {
    if (this.reversed) {
      super.set(map(value, 0.0, 1.0, this.minOutput, this.maxOutput))
    } else {
      super.set(map(value, 0.0, 1.0, this.maxOutput, this.minOutput))
    }
  }

  /**
   * Returns the Servo output. This will be an integer between 0 and 1023,
   * converted to a string.
   *
   * @override
   * @protected
   * @return {string} the motor value [0, 1023]
   */
  getOutput () {
    return Math.round(this.get() * 1023).toString()
  }

  /**
   * Does the Servo support a specified driver.
   *
   * Servos currently support the following drivers:
   *
   *  - PWM : standard driver
   *
   * @private
   * @param {string} driverName - name of the proposed driver
   * @return {boolean} true if the Servo supports the specified driver.
   **/
  supportsDriver (driverName) {
    return [ 'PWM' ].indexOf(driverName) !== -1
  }
}
