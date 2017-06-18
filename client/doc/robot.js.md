# robot.js specification #
The `robot.js` file is used to provide a simple, Ardiuno-like environment for defining your robot's user interface and control logic. The design focus of the eesibot framework is to make customization as easy as possible, even for inexperienced programmers. To that end, the structure of the `robot.js` file is very simple.

Below is an example of one of the simplest possible `robot.js` files. It creates a control joystick in the center of the screen that controls the robot with via "arcade" style drive:

```javascript
var myJoystick;
var arcadeDrive;
function setup () {
  arcadeDrive = new ArcadeDrive();
  
  myJoystick = new Joystick();
  myJoystick.position.x = '50%';
  myJoystick.position.y = '50%';
  myJoystick.radius = '40%';
}

function loop () {
  var speed = myJoystick.y;
  var rotation = myJoystick.x;
  arcadeDrive.setSpeedAndRotation(speed, rotation);
}
```

In `robot.js`, the user must implement two JavaScript functions `setup()` and `loop()`. The behavior of these functions are as follows:

## setup() ##
The setup function is run once when the robot is started. In this function you create hardware (drives, motors, servos, etc.) and user interface controls (joysticks, buttons, sliders, etc.) that will be used to control the robot. In general, these objects should be assigned to variables so they can be used later in the `loop()` function.

For a complete reference of the available objects, see the [API Documentation](https://raw.githack.com/jmalins/BattleBot-Control/new-ui/client/doc/esdoc/index.html).

## loop() ##
The loop function is run repeatly when the robot is operating. In this function you read the user interface controls (or sensors) you created previously and use their values to set the outputs of motors and other hardware.
