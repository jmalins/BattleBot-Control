import TwoWheelDrive from './TwoWheelDrive'
import { constrain } from '../utils'

/**
 *  'Arcade' drive with separate control of speed and rotation. This class
 *  uses the classic FIRST Robotics control mixing scheme.
 *
 *  This style is easier to learn for novice drivers, but can offer less nuanced
 *  control, especially when attempting to make radiused turns.
 */
export default class ArcadeDrive extends TwoWheelDrive {
  /**
   * Set speed and rotation.
   * FIXME: put notes about directionality
   *
   * @param {number} speed forward/reverse speed [-1.0, 1.0]
   * @param {number} rotation left/right turning speed [-1.0, 1.0]
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
