import TwoWheelDrive from './TwoWheelDrive'

/**
 *  Differential 'tank' style drive where left and right wheels
 *  are controlled independently.
 *
 *  This style is harder to learn, but can offer superior control,
 *  since it is easier to steer in curves without slowing down.
 */
export default class TankDrive extends TwoWheelDrive {
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
