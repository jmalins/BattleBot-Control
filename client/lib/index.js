/* eslint-disable no-unused-vars */
import { Hardware, Motor, Servo, DigitalOutput, DigitalInput } from './hardware'
import { TankDrive, ArcadeDrive } from './drive'
import { Joystick, Button } from './controls'

// set the default hardware configuration    //
// you can call Hardware.configure() in your //
// robot code to override this.              //
import defaultConfig from './default-config'
Hardware.configure(defaultConfig)
