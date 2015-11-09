var cWidth = 800;
var cHeight = 500;

var calcRate = 128;
var ppM = 1000;

var scale = 1;

var sizeScale = 0.0001;

var gConst = 6.67408*Math.pow(10,-11);

var mass = 2;

var c = document.getElementById("canvas");
ctx = c.getContext("2d");

c.width = cWidth;
c.height = cHeight

var cursorX;
var cursorY;
var cursorDownTime;
var massInterval;

var animateCircle = false;
var drag = false;
var mouseIsCurrentlyDown = false;
var toX;
var toY;
var newVelX = 0;
var newVelY = 0;
var dispToVel = 0.00001;

var resetButton = document.getElementById("resetButton");
var clearButton = document.getElementById("clearButton");

var objects = [
//	[posX,posY,velX,velY,accX,accY,mass]
	{
		posX: 400,
		posY: 250,

		velX: 0,
		velY: 0,

		accX: 0,
		accY: 0,

		mass: 500000
	},
	
	{
		posX: 400,
		posY: 150,

		velX: -0.0005,
		velY: 0,

		accX: 0,
		accY: 0,

		mass: 10000
	}
]

function sign(x) {
	return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}

function reset(){
	objects = [
		{
			posX: 400,
			posY: 250,

			velX: 0,
			velY: 0,

			accX: 0,
			accY: 0,

			mass: 500000
		},
		
		{
			posX: 400,
			posY: 150,

			velX: -0.0005,
			velY: 0,

			accX: 0,
			accY: 0,

			mass: 10000
		}
	]
}

function clear(){
	objects = [];
}

function addObject(x,y,m){
	var obj = {};

	// Position
	obj.posX = x;
	obj.posY = y;
	
	// Velocity
	obj.velX = 0;
	obj.velY = 0;

	// If a velocity has been dragged
	if(newVelX != 0){
		obj.velX = newVelX;
		newVelX = 0;
	}

	if(newVelY != 0){
		obj.velY = newVelY;
		newVelY = 0;
	}

	// Acceleration
	obj.accX = 0;
	obj.accY = 0;

	// Mass
	obj.mass = m;

	// And go!
	objects.push(obj);

	// Reset mass again just in case
	mass = 2;
	mouseIsCurrentlyDown = false;
	clearInterval(massInterval);
}

function drawObjects(){
	for (var i = 0; i < objects.length; i++) {
		ctx.fillStyle = "#eeeeee";
		ctx.beginPath();
		ctx.arc(objects[i].posX,objects[i].posY,scale*Math.log(objects[i].mass),0,2*Math.PI);
		ctx.fill();
	};
}

function calcForce(){
	for (var i = 0; i < objects.length; i++) {
		objects[i].accX = 0;
		objects[i].accY = 0;
		for (var j = 0; j < objects.length; j++) {
			if(i == j) continue; // Don't calculate with itself

			// Define objects
			var obj1 = objects[i];
			var obj2 = objects[j];
			
			// Calculate displacement
 			var dispX = obj2.posX - obj1.posX;
			var dispY = obj2.posY - obj1.posY;
			var disp = Math.sqrt((dispX * dispX) + (dispY * dispY));
			var angleX = Math.atan(dispY/dispX);

			// Calculate position ratio
			var ratioX = Math.atan(dispY/dispX);
			var ratioY = Math.atan(dispX/dispY);

			// Calculate gravitational acceleration
			var acc = gConst * obj2.mass / (disp * disp);

			// Apply ratio to acceleration
			var accX = acc * Math.cos(angleX);
			var accY = acc * Math.sin(angleX);

			// Remove any pesky signs
			accX = Math.abs(accX);
			accY = Math.abs(accY);

			// Add the correct signs, that correspond with the displacement
			var signX = sign(dispX);
			var signY = sign(dispY);

			accX = signX * accX;
			accY = signY * accY;

			// Write acceleration
			obj1.accX += accX;
			obj1.accY += accY;

			/*console.log(dispX);
			console.log(dispY);
			console.log(ratioX);
			console.log(i + ": accX = " + accX + ". accY = " + accY);*/
			//console.log(angleX);
		};
	};
}

function calcSpeed(){
	for (var i = 0; i < objects.length; i++) {
		var obj = objects[i];
		// Velocity
		obj.velX += obj.accX * ppM;
		obj.velY += obj.accY * ppM;

		// Position
		obj.posX += obj.velX * ppM;
		obj.posY += obj.velY * ppM;
	};
}

function calc(){
	calcForce();
	calcSpeed();
}

function background(){
	ctx.fillStyle = "#111111";
	ctx.fillRect(0,0,cWidth,cHeight);
}

function circleAnimation(){
	if(!animateCircle) return;

	ctx.fillStyle = "#ee8888";
	ctx.beginPath();
	ctx.arc(cursorX,cursorY,scale*Math.log(mass),0,2*Math.PI);
	ctx.fill();
}

function drawLine(){
	if(!drag) return;
	ctx.beginPath();
	ctx.strokeStyle = "#ff5555";
	ctx.moveTo(cursorX,cursorY);
	ctx.lineTo(toX,toY);
	ctx.stroke();
}

// Calculation tick
window.setInterval(function(){
	calc();
},1000/calcRate);

function draw(){
	requestAnimationFrame(draw);

	background();
	drawObjects();
	circleAnimation();
	drawLine();
}

window.onload = function(){
	draw();
}

resetButton.onclick = reset;
clearButton.onclick = clear;

canvas.addEventListener("mousedown", mouseIsDown, false);
canvas.addEventListener("mouseup", mouseIsUp, false);
canvas.addEventListener("mousemove", checkDrag, false);

function mouseIsDown(event){
	mass = 2;
	clearInterval(massInterval);
	console.log("mouse down, setting mass to 2");
	var x = event.x;
	var y = event.y;

	x -= c.offsetLeft;
	y -= c.offsetTop;

	cursorX = x;
	cursorY = y;
	mouseIsCurrentlyDown = true;
	var z = 0;

	animateCircle = true;
	massInterval = window.setInterval(function(){
		console.log("Increment mass");
		z++;
		mass = 100 * z * z;
	},1000/calcRate)
}

function mouseIsUp(event){
	addObject(cursorX,cursorY,mass);
	clearInterval(massInterval);
	mass = 2;
	drag = false;
	mouseIsCurrentlyDown = false;
	animateCircle = false;
}

function checkDrag(event){
	if(!mouseIsCurrentlyDown) return;
	if(mouseIsCurrentlyDown) drag = true;
	var x = event.x;
	var y = event.y;

	x -= c.offsetLeft;
	y -= c.offsetTop;

	toX = x;
	toY = y;

	var dispX = toX - cursorX;
	var dispY = toY - cursorY;
	console.log("dispX: " + dispX + ", dispY: " + dispY);

	newVelX = dispX * dispToVel;
	newVelY = dispY * dispToVel;
}