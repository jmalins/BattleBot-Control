# hardware.json Specification #

*note:* This functionality is still being implemented. The current robot is hard-coded to three devices 'leftMotor', 'rightMotor' and 'weaponMotor'.

The `hardware.json` configuration file is installed on the robot to apply settings such as pin numbers, input/output direction, etc. to device drivers on the robot.

If your robot is part of a kit, this file will be installed with a default configuration, so no customization is needed unless additional hardware is installed.

A simple `hardware.json` file is as follows:
```javascript
{
  "network": {
    "apSsid": "BattleBot-",
    "mDnsName": "battlebot.local"
  },
  "devices": {
    "leftMotor": {
      "driver": "PWM_HBRIDGE",
      "params": {
        "pwmPin": 2,
        "dirPin": 4
      }
    },
    "rightMotor": {
      "driver": "PWM_HBRIDGE",
      "params": {
        "pwmPin": 1,
        "dirPin": 3
      }
    },
    "weaponMotor": {
      "driver": "PWM",
      "params": {
        "pwmPin": 6,
        "minMicroseconds": 900,
        "maxMicroseconds": 1800
      }
    },
    "servo": {
      "driver": "PWM",
      "params": {
        "pwmPin": 7
      }
    }
  }
}
```
