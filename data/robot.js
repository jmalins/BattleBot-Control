/* eslint-disable */

// define devices and controls //
var leftMotor, rightMotor, weaponMotor;
var driveStick, weaponSlider, forwardButton, reverseButton;

// this is run once //
function setup () {
  // setup hardware interface //
  leftMotor = new Motor('leftMotor')
  // leftMotor.reversed = true
  rightMotor = new Motor('rightMotor')
  // rightMotor.reversed = true
  weaponMotor = new Motor('weaponMotor')

  // create the drive joystick //
  driveStick = new Joystick('drive')
  driveStick.position.x = 20  // positions + sizes in % of screen size //
  driveStick.position.y = 50
  driveStick.radius = 15

  // weapon power //
  weaponSlider = new Slider('weapon')
  weaponSlider.position.x = 85
  weaponSlider.position.y = 20
  weaponSlider.radius = 5
  weaponSlider.length = 30
  weaponSlider.type = Slider.VERTICAL
  weaponSlider.sticky = true
  weaponSlider.style = 'red'

  // drive direction buttons //
  reverseButton = new Button('reverse')
  reverseButton.position.x = 60
  reverseButton.position.y = 30
  reverseButton.radius = 5
  reverseButton.sticky = true
  reverseButton.style = 'blue'
  reverseButton.groupName = 'weaponGroup'

  forwardButton = new Button('forward')
  forwardButton.position.x = 60
  forwardButton.position.y = 70
  forwardButton.radius = 5
  forwardButton.sticky = true
  forwardButton.style = 'blue'
  forwardButton.groupName = 'weaponGroup'
  forwardButton.pressed = true
}

// this is run at update rate //
function loop () {
  // handle driving //
  leftMotor.set(driveStick.y)
  rightMotor.set(driveStick.x)
  
  // handle weapon control //
  weaponMotor.set(weaponSlider.value)

  // handle driving reverse //
  if (reverseButton.pressed) {
    arcadeDrive.leftMotor.reversed = true
    arcadeDrive.rightMotor.reversed = true
    arcadeDrive.swapMotors = true
  } else {
    arcadeDrive.leftMotor.reversed = false
    arcadeDrive.rightMotor.reversed = false
    arcadeDrive.swapMotors = false
  }
}

