/**
 * Default hardware configuration for the kit-bot based off the
 * NodeMCU (ESP8266) and dual H-Bridge motor breakout board.
 *
 * Assumes the following wiring configuration:
 *
 *  - rightMotor: motor channel A (as judged from behind the robot)
 *  - leftMotor: Motor channel B (as judged from behind the robot)
 *
 *  Motors should be wired so that a positive voltage on the A+/B+ terminal
 *  produces forward motion.
 *
 * The default firmware also supports the following optional hardware:
 *
 *  - weaponMotor: AfroESC Brushless DC controller on pin 6
 *  - servo1: first servo on pin 7
 *  - servo2: second servo on pin 8
 */

export default {
  rightMotor: {
    PWM_HBridge: { pwmPin: 1, dirPin: 3 }
  },
  leftMotor: {
    PWM_HBridge: { pwmPin: 2, dirPin: 4 }
  },
  weaponMotor: {
    PWM: { pwmPin: 6, minMicroseconds: 900, maxMicroseconds: 1800 }
  },
  servo1: {
    PWM: { pwmPin: 7 }
  },
  servo2: {
    PWM: { pwmPin: 8 }
  }
}
