
var canvas, c, container;


setupCanvas();
TouchManager.setCanvas(canvas);
//TouchManager.debug = true;

// map touch starts to joystick IDs //
TouchManager.ontouchstart = function(touch, tracker) {

  if(touch.clientX < (window.innerWidth / 2 - 100)) {
    tracker.addJoystick('left', 60, 'cyan', { x: touch.clientX, y: window.innerHeight / 2 });
  } else if(touch.clientX > (window.innerWidth / 2 + 100)) {
    tracker.addJoystick('right', 60, 'magenta', { x: touch.clientX, y: window.innerHeight / 2 });
  } else {
    tracker.addButton('trigger', 'red');
  }
}

// start robot communication and draw loops //
setInterval(draw, 1000/35); 
RobotControl.start();

function resetCanvas(e) {  
  // resize the canvas - but remember - this clears the canvas too. 
  canvas.width  = window.innerWidth; 
  canvas.height = window.innerHeight;
  
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
  var left = (leftStick)? -leftStick.y: 0;
  var rightStick = TouchManager.getItem('right');
  var right = (rightStick)? -rightStick.y: 0;
  RobotControl.setPower(left * 1023, right * 1023);

  c.fillStyle = 'white';
  var powers = RobotControl.getPower();
  c.fillText('left: ' + powers.left, 30, window.innerHeight - 20); 
  c.fillText('right: ' + powers.right, window.innerWidth / 2 + 30, window.innerHeight - 20); 
  c.fillText('rate: ' + RobotControl.getUpdateRate() + ' Hz', 10, 15);

  var state = RobotControl.getState();
  c.fillStyle = (state === RobotControl.ERROR)? 'red': 'green';
  c.fillText('state: ' 
    + state.toUpperCase() 
    + ((state === RobotControl.ERROR)? ' (' + RobotControl.getLastError() + ')': ''), 
    80, 15);
}

function setupCanvas() {  
  canvas = document.createElement('canvas');
  c = canvas.getContext( '2d' );

  container = document.createElement('div');
  container.className = 'container';
  canvas.width  = window.innerWidth; 
  canvas.height = window.innerHeight; 

  document.body.appendChild(container);
  container.appendChild(canvas);  
  
  c.strokeStyle = '#ffffff';
  c.lineWidth   = 2;  
}
