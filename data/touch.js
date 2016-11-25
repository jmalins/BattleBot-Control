
var canvas, c, container;
var powerL = 0, powerR = 0, updateRate = 0;

setupCanvas();

var mouseX, mouseY;
var touchable = ('createTouch' in document);
var touches   = []; // array of touch vectors

setInterval(draw, 1000/35); 
sendUpdate();

if(touchable) {
	canvas.addEventListener('touchstart', onTouchStart, false);
	canvas.addEventListener('touchmove',  onTouchMove,  false);
	canvas.addEventListener('touchend',   onTouchEnd,   false);
	window.onorientationchange = resetCanvas;  
	window.onresize = resetCanvas;  
} else {
	canvas.addEventListener('mousemove', onMouseMove, false);
}

function resetCanvas(e) {  
 	// resize the canvas - but remember - this clears the canvas too. 
  canvas.width  = window.innerWidth; 
	canvas.height = window.innerHeight;
	
	//make sure we scroll to the top left. 
	window.scrollTo(0, 0); 
}

function draw() {  
	c.clearRect(0, 0, canvas.width, canvas.height); 

	if(true || touchable) {	
    var leftSet = false, rightSet = false;

		for(var i = 0; i < touches.length; i++) {
			var touch = touches[i]; 

      var left = (touch.clientX < window.innerWidth / 2);
			c.beginPath(); 
			c.fillStyle = 'white';
			/*c.fillText('touch id : ' + touch.identifier 
        + ' x:' + touch.clientX
        + ' y:' + touch.clientY, 
        touch.clientX + 30, touch.clientY - 30
      );*/ 
			c.beginPath(); 
			c.strokeStyle = left? 'cyan': 'magenta';
			c.lineWidth = '6';
			c.arc(touch.clientX, touch.clientY, 40, 0, Math.PI * 2, true); 
			c.stroke();

      if(left) {
        powerL = ((window.innerHeight / 2) - touch.clientY) / (window.innerHeight / 2);
        leftSet = true;
      } else {
        powerR = ((window.innerHeight / 2) - touch.clientY) / (window.innerHeight / 2);
        rightSet = true;
      }
		}
    if(!leftSet) {
      powerL = 0;
    }
    if(!rightSet) {
      powerR = 0;
    }

		c.fillStyle = 'white';
		c.fillText('left: ' + powerL, 30, window.innerHeight - 20); 
		c.fillText('right: ' + powerR, window.innerWidth / 2 + 30, window.innerHeight - 20); 
	  c.fillText('rate: ' + updateRate + ' Hz', 10, 15);

	} else {		
		c.fillStyle	 = 'white'; 
		c.fillText('mouse : ' + mouseX + ', ' + mouseY, mouseX, mouseY); 
	}	
}

/*	
 *	Touch event (e) properties : 
 *	e.touches: 			Array of touch objects for every finger currently touching the screen
 *	e.targetTouches: 	Array of touch objects for every finger touching the screen that
 *						originally touched down on the DOM object the transmitted the event.
 *	e.changedTouches	Array of touch objects for touches that are changed for this event. 					
 *						I'm not sure if this would ever be a list of more than one, but would 
 *						be bad to assume. 
 *
 *	Touch objects : 
 *
 *	identifier: An identifying number, unique to each touch event
 *	target: DOM object that broadcast the event
 *	clientX: X coordinate of touch relative to the viewport (excludes scroll offset)
 *	clientY: Y coordinate of touch relative to the viewport (excludes scroll offset)
 *	screenX: Relative to the screen
 *	screenY: Relative to the screen
 *	pageX: Relative to the full page (includes scrolling)
 *	pageY: Relative to the full page (includes scrolling)
 */	
function onTouchStart(e) { 
	touches = e.touches; 
}
 
function onTouchMove(e) {
	// Prevent the browser from doing its default thing (scroll, zoom)
	e.preventDefault();
	touches = e.touches; 
} 
 
function onTouchEnd(e) { 
  touches = e.touches; 
}

function onMouseMove(event) {
	mouseX = event.offsetX;
	mouseY = event.offsetY;
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

var lastTime = new Date();

function sendUpdate() {
  var xhr = new XMLHttpRequest();
  
  xhr.open('PUT', '/foo', true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      //console.log(xhr.responseText);
      setTimeout(sendUpdate, 1);
      
      var delayMs = new Date().getTime() - lastTime.getTime();
      if(delayMs > 0) {
        updateRate = Math.floor(1000 * 100 / delayMs) / 100;
      } 
    }
  };
  
  var sensitivity = 2;
  var left  = Math.floor(powerL * 1023 * sensitivity);
  if(left > 1023) left = 1023;
  if(left < -1023) left = -1023;

  var right = Math.floor(powerR * 1023 * sensitivity);
  if(right > 1023) right = 1023;
  if(right < -1023) right = -1023;

  //console.log('sending: ', left, right);
  xhr.send(left + ':' + right);
  lastTime = new Date();
}
