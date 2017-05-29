/**
 * Main module for driving robots. Contains implementations of the
 * common robot control schemes, such as Tank and Arcade drive.
 *
 * @module drive
 */
import { constrain } from './utils'
import { Motor } from './hardware'

/**
 * Base class for a two wheel robot.
 *
 * Motors named 'leftMotor' and 'rightMotor' must be configured
 * in the hardware setup.
 */
export class TwoWheelDrive {
  /**
   * Constructor
   */
  constructor (leftMotor, rightMotor) {
    this.motors = [
      leftMotor || new Motor('leftMotor'),
      rightMotor || new Motor('rightMotor')
    ]
    this.swapMotors = false
  }

  get leftMotor () {
    return this.motors[this.swapMotors ? 1 : 0]
  }
  get rightMotor () {
    return this.motors[this.swapMotors ? 0 : 1]
  }

  set reverseLeftMotor (value) {
    this.leftMotor.reversed = value
  }
  set reverseRightMotor (value) {
    this.rightMotor.reversed = value
  }

  setMotorPowers (left, right) {
    this.leftMotor.set(constrain(left, -1.0, 1.0))
    this.rightMotor.set(constrain(right, -1.0, 1.0))
  }

  stop () {
    this.leftMotor.set(0)
    this.rightMotor.set(0)
  }
}

/**
 *  Differential 'tank' style drive where left and right wheels
 *  are controlled independently.
 *
 *  This style is harder to learn, but can offer superior control,
 *  since it is easier to steer in curves without slowing down.
 */
export class TankDrive extends TwoWheelDrive {
  /**
   *  Set left and right wheel speeds independently.
   *
   *  @param {number} left wheel speed [-1.0, 1.0]
   *  @param {number} right wheel speed [-1.0, 1.0]
   */
  setLeftAndRightSpeed (left, right) {
    this.setMotorPowers(left, right)
  }
}

/**
 *  'Arcade' drive with separate control of speed and rotation.
 *
 *  This style is easier to learn for novice drivers.
 */
export class ArcadeDrive extends TwoWheelDrive {
  /**
   * Set speed and rotation
   *
   * @param {number} linear forward/reverse speed [-1.0, 1.0]
   * @param {number} rotational left/right turning speed [-1.0, 1.0]
   */
  setSpeedAndRotation (speed, rotation) {
    // clamp the inputs //
    speed = constrain(speed, -1.0, 1.0)
    if (this.speedScalar) {
      speed = this.speedScalar.scale(speed)
    }
    rotation = constrain(rotation, -1.0, 1.0)
    if (this.rotationScalar) {
      rotation = this.rotationScalar.scale(rotation)
    }

    // mix speed and rotation signals //
    let leftPower, rightPower
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
  }
}
