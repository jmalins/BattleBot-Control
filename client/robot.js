/* eslint-disable */

// define devices and controls //
var arcadeDrive, motorMotor;
var driveStick, weaponButton;

// this is run once //
function setup () {
  // setup hardware interface //
  arcadeDrive = new ArcadeDrive()
  arcadeDrive.leftMotor.reversed = true
  
  weaponMotor = new Motor('weaponMotor')

  // create the drive joystick //
  driveStick = new Joystick('drive')
  driveStick.position.x = 25  // positions + sizes in % of screen size //
  driveStick.position.y = 50
  driveStick.radius = 20

  // create the weapon button //
  weaponButton = new Button('weapon')
  weaponButton.position.x = 80
  weaponButton.position.y = 50
  weaponButton.radius = 10
  weaponButton.mode = Button.TOGGLE
}

// this is run at update rate //
function loop () {
  // handle driving //
  var speed = driveStick.y
  var rotation = driveStick.x
  arcadeDrive.setSpeedAndRotation(speed, rotation)
  
  // handle weapon control //
  if (weaponButton.pressed) {
    motorMotor.set(1.0)
  } else {
    motorMotor.set(0)
  }
}

