/* eslint-disable */

// define devices and controls //
var arcadeDrive, motorMotor;
var driveStick, weaponButton, weaponButton2;

// this is run once //
function setup () {
  // setup hardware interface //
  arcadeDrive = new ArcadeDrive()
  
  weaponMotor = new Motor('weaponMotor')

  // create the drive joystick //
  driveStick = new Joystick('drive')
  driveStick.position.x = 20  // positions + sizes in % of screen size //
  driveStick.position.y = 50
  driveStick.radius = 15

  // create the weapon button //
  weaponButton = new Button('weapon1')
  weaponButton.position.x = 60
  weaponButton.position.y = 30
  weaponButton.radius = 5
  weaponButton.sticky = true
  weaponButton.style = 'blue'
  weaponButton.groupName = 'weaponGroup'

  weaponButton2 = new Button('weapon2')
  weaponButton2.position.x = 60
  weaponButton2.position.y = 70
  weaponButton2.radius = 5
  weaponButton2.sticky = true
  weaponButton2.style = 'blue'
  weaponButton2.groupName = 'weaponGroup'
  weaponButton2.pressed = true

  var slider = new Slider('slider')
  slider.position.x = 85
  slider.position.y = 20
  slider.radius = 5
  slider.length = 30
  slider.type = Slider.VERTICAL
  slider.sticky = true
  slider.style = 'red'
}

// this is run at update rate //
function loop () {
  // handle driving //
  var speed = driveStick.y
  var rotation = driveStick.x
  arcadeDrive.setSpeedAndRotation(speed, rotation)
  
  // handle weapon control //
  if (weaponButton.pressed) {
    weaponMotor.set(1.0)
  } else {
    weaponMotor.set(0)
  }
}

