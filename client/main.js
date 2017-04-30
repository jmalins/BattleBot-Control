
var canvas, c, container;


setupCanvas();
TouchManager.setCanvas(canvas);
TouchManager.debug = true;

// map touch starts to joystick IDs //
TouchManager.ontouchstart = function(touch, tracker) {
  console.log(canvas.height)
  var maxTouchRange = 100; //djl 60 //60= radius of origin circle
  if(touch.clientX < (window.innerWidth / 2 - 100)) {
    tracker.addJoystick('left', maxTouchRange, 'cyan', { x: touch.clientX, y: canvas.height / 2 });
  } else if(touch.clientX > (window.innerWidth / 2 + 100)) {
    tracker.addJoystick('right', maxTouchRange, 'magenta', { x: touch.clientX, y: window.innerHeight / 2 });
  } else {
    tracker.addButton('weaponPower', 'red');
  }
}

// start robot communication and draw loops //
setInterval(draw, 1000/35); 
//RobotControl.start();

function resetCanvas(e) {  
  container = document.getElementById('container')
  const header = document.getElementById('heading')
  console.log(container.offsetWidth, container.offsetHeight, window.innerHeight)
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight - header.offsetHeight;

  
  // make sure we scroll to the top left. 
  window.scrollTo(0, 0); 
}

// reset canvas on resize //
window.onorientationchange = resetCanvas;  
window.onresize = resetCanvas

function draw() {  
  c.clearRect(0, 0, canvas.width, canvas.height); 
  
  TouchManager.draw(c);

  // get powers //
  var leftStick = TouchManager.getItem('left');
  /*var left = (leftStick)? -leftStick.y: 0;
  var rightStick = TouchManager.getItem('right');
  var right = (rightStick)? -rightStick.y: 0;
  RobotControl.setPower(left * 1023, right * 1023);*/
  if(leftStick) {
    RobotControl.arcadeDrive(-leftStick.y, -leftStick.x, false);
  } else {
    RobotControl.setPower(0, 0);
  }

  var weapon = TouchManager.getItem('weaponPower');
  if(weapon) {
    var weaponPower = ((window.innerHeight - weapon.currentPos.y) / window.innerHeight);
    if(weaponPower < 0.1) weaponPower = 0;
    //RobotControl.setWeaponPower(weaponPower);
  }

  c.fillStyle = 'white';
  var powers = RobotControl.getPower();
  /*c.fillText('left: ' + powers.left, 30, window.innerHeight - 20); 
  c.fillText('right: ' + powers.right, window.innerWidth / 2 + 30, window.innerHeight - 20); 
  c.fillText('rate: ' + RobotControl.getUpdateRate() + ' Hz', 10, 15);
  c.fillText('weapon: ' + RobotControl.getWeaponPower().toFixed(3), 200, 15);

  var state = RobotControl.getState();
  c.fillStyle = (state === RobotControl.ERROR)? 'red': 'green';
  c.fillText('state: ' 
    + state.toUpperCase() 
    + ((state === RobotControl.ERROR)? ' (' + RobotControl.getLastError() + ')': ''), 
    80, 15);*/
}

function setupCanvas() {  
  //canvas = document.createElement('canvas');
  canvas = document.getElementById('touch-canvas')
  c = canvas.getContext( '2d' );

  container = document.getElementById('container')
  const header = document.getElementById('heading')
  console.log(container.offsetWidth, container.offsetHeight, window.innerHeight)
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight - header.offsetHeight;
  /*container = document.createElement('div');
  container.className = 'container';
  canvas.width  = window.innerWidth; 
  canvas.height = window.innerHeight; 

  //document.body.appendChild(container);
  container.appendChild(canvas);*/
  
  c.strokeStyle = '#ffffff';
  c.lineWidth   = 2;  
}
