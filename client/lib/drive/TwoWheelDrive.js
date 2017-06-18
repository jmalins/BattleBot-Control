import { constrain } from '../utils'
import { Motor } from '../hardware'

/**
 * Base class for a two wheel robot.
 *
 * Motors named 'leftMotor' and 'rightMotor' are automatically created if no
 * motors are specified. These devices must be configured in the hardware setup.
 */
export default class TwoWheelDrive {
  /**
   * Constructor.
   *
   * @param {string|Motor} [leftMotor = 'leftMotor'] the left motor or device name
   * @param {string|Motor} [rightMotor = 'rightMotor'] the right motor or device name
   */
  constructor (leftMotor, rightMotor) {
    const getMotor = (motor) =>
      typeof motor === 'string' ? new Motor(motor) : motor
    /**
     * @private
     * @type {Array<Motor>}
     */
    this.motors = [
      getMotor(leftMotor) || new Motor('leftMotor'),
      getMotor(rightMotor) || new Motor('rightMotor')
    ]
    /**
     * Swap the left and right motors.
     * @type {boolean}
     */
    this.swapMotors = false
  }

  /**
   * Get the logical left motor, i.e. after swapMotors is applied.
   * @type {Motor}
   */
  get leftMotor () {
    return this.motors[this.swapMotors ? 1 : 0]
  }
  /**
   * Get the logical left motor, i.e. after swapMotors is applied.
   * @type {Motor}
   */
  get rightMotor () {
    return this.motors[this.swapMotors ? 0 : 1]
  }

  /**
   * Set the left and right motor powers. Values are constrained
   * to between -1.0 (full reverse) and 1.0 (full forward). A value of 0
   * is stopped. See {@link Motor#set}
   *
   * @param {number} left - the left motor power
   * @param {number} right - the right motor power
   */
  setMotorPowers (left, right) {
    this.leftMotor.set(constrain(left || 0, -1.0, 1.0))
    this.rightMotor.set(constrain(right || 0, -1.0, 1.0))
  }

  /**
   * Stop both motors, this is equivalent to calling:
   * ```javascript
   * myMotor.setMotorPowers(0, 0);
   * ```
   */
  stop () {
    this.leftMotor.set(0)
    this.rightMotor.set(0)
  }
}
