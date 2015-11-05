var cWidth = 800;
var cHeight = 600;

var calcRate = 128;
var ppM = 1000;

var scale = 1;

var sizeScale = 0.0001;

var gConst = 6.67*Math.pow(10,-11);

var c = document.getElementById("canvas");
ctx = c.getContext("2d");

c.width = cWidth;
c.height = cHeight

var cursorX;
var cursorY;
var cursorDownTime;
var massInterval;

var animateCircle = false;

var objects = [
//	[posX,posY,velX,velY,accX,accY,mass]
	{
		posX: 400,
		posY: 300,

		velX: 0,
		velY: 0,

		accX: 0,
		accY: 0,

		mass: 500000
	},
	
	{
		posX: 400,
		posY: 200,

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

function addObject(x,y,m){
	var obj = {};

	obj.posX = x;
	obj.posY = y;
	
	obj.velX = 0;
	obj.velY = 0;
	
	obj.accX = 0;
	obj.accY = 0;

	obj.mass = m;

	objects.push(obj);
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
	ctx.fillStyle = "#222222";
	ctx.fillRect(0,0,cWidth,cHeight);
}

function circleAnimation(){
	if(!animateCircle) return;

	ctx.fillStyle = "#ee8888";
	ctx.beginPath();
	ctx.arc(cursorX,cursorY,scale*Math.log(mass),0,2*Math.PI);
	ctx.fill();
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
}

window.onload = function(){
	draw();
}

canvas.addEventListener("mousedown", mouseIsDown, false);
canvas.addEventListener("mouseup", mouseIsUp, false);

var mass = 2;
function mouseIsDown(event){
	var x = event.x;
	var y = event.y;

	x -= c.offsetLeft;
	y -= c.offsetTop;

	cursorX = x;
	cursorY = y;
	var z = 0;

	animateCircle = true;
	massInterval = window.setInterval(function(){
		z++;
		mass = z * Math.pow(1.1,z) + 1;
		console.log(mass);
	},1000/calcRate)
}

function mouseIsUp(event){
	addObject(cursorX,cursorY,mass);
	clearInterval(massInterval);
	mass = 2;
	animateCircle = false;
}