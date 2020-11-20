/**************************************************/
/* Author:  Dr. Volkmar Naumburger                */
/* Subauthor: Sebastian Pütz                      */   
/*                                                */
/* p5.js Template                                 */
/* Date: 10.10.2020                               */
/* Update: 12.11.2020                             */
/*                                                */
/**************************************************/


// Creating Canvas
var canvas; 
var canvasID = 'pTest';

let button;
var mouseTreshhold;
var buttonPressed = false;
var mouseClicked = false;


// cartesian and origin
var xi0, yi0;					// current origin in px
var xL, yL, xR, yR;				// current coordninates of balls
var xL0, yL0, xR0, yR0;			// Startpositions of the balls
var xOffset = 0.825;			// xOffset for starting position
var yOffset = 1.2;				// yOffset for starting position


// Scaling
var M, xM, yM;
var realX = 2; //m
var realY = 1; //m
var pictureX = 1000; //px
var pictureY = 500; //px


// Time
var ThrowTimeL = 0.00, ThrowTimeR = 0.00;	// time when throw starts
var ThrowingTimeL = 0.00, ThrowingTimeR = 0.00; // time of throw until touching ground
var rightCollsionTime = 0.00, leftCollisionTime = 0.00;
var rollingStartTime = 0.00;
var timeFactor = 0.25 // multiplacator for all times
var t = 0.00;	// time in s
var dt;	// deltatime by fps
var fps;


// Triagles
var triSide = 0.05;
var triHeight = (Math.sqrt(3)/2) * triSide;


// Line Position 
var lineLength = 0.25;
var lineHeight = 2*triHeight;
var lineWidth = Math.sqrt(lineLength*lineLength - lineHeight*lineHeight);


// Movement
var gF = 9.81; // gravitation force
var dF = 0.00; // downhill-slope force

var vxL = 0.0, vyL = 0.0;
var vxR = 0.0, vyR = 0.0;	// current velocity
var vxL0, vyL0, vxR0, vyR0;  // starting velocity	

var angVelocityLeft = 0.0;
var angVelocityRight = 0.0; 

var angleLeft; 
var angleRight;
var angleLoffset = 0.0;
var angleRoffset = 0.0;
var throwAngleLeft = 0.0;
var throwAngleRight = 0.0;

var leftCollider, rightCollder; // colliders of seesaws
var sL = 0.00, sR = 0.00;
var sL0 = 0.00, sR0 = 0.00; 
var vDL = 0.00, vDR = 0.00;


// Status
var draggingLeft;
var draggingRight;

var mouseWasPressed = false;
var mouseWasReleased = false;

var releasedLeft = true;
var releasedRight = true;

var rightIsCompressing = false;
var leftIsCompressing = false;

// ------

var leftIsFlying = false;
var rightIsFlying = false;

var groundedLeft = false;
var groundedRight = false;

var collidedLeft = false;
var collidedRight = false;

var rollingFromLeft = false;
var rollingFromRight = false;


// End of declaration ------------------------------------------------------------------------------------------------------


function setup()
{
	xR0 = +0.6 + lineWidth/2 * xOffset;
	yR0 = lineHeight * yOffset;
	xR = xR0;
	yR = yR0;
	
	leftCollider = [
		createVector(-0.6 + lineWidth/2, 0),
		createVector(-0.6 - lineWidth/2, lineHeight)
	];
	
	rightCollider = [
		createVector(+0.6 - lineWidth/2, 0),
		createVector(+0.6 + lineWidth/2, lineHeight)
	];

	canvas = createCanvas(pictureX, pictureY);
	canvas.parent(canvasID);
	textFont('arial');

	fps = 60;
	frameRate(fps);
	dt = 1.0 / fps;

	// Scalce Calculation
	xM = pictureX / realX;
	yM = pictureY / realY;
	M = (xM+yM) / 2;

	// Cartesian Coordinates
	xi0 = 0.5 * width;
	yi0 = height;
	ballradius = 0.016;

	button = createButton('Reset');
	button.size(60, 35);
	button.position(1.7*xM, 0.185*yM); //because sacling withh get implemented
	button.mousePressed(pressedButton);
}

function pressedButton() 
{
	window.location.href = window.location.pathname;
}

function draw()
{
	background('#424549');
	fill('#fafafa');

	
	// 1.1  Scale and Metrics
	push();
	translate(xi0, yi0);
	scale(1, -1);
	xOr = xi0 / xM;
	yOr = yi0 / yM;

	// Used for calculations
	angleMode(DEGREES);
	var hightligh = 30;
	var mouseTreshhold = 20;

	/*
	* I wanted to refactor some code for distance calculation of mouse position and drag point not using xM or yM
	* of scaling for multiplication. But somehow the transition of mouse form pixel into meters does not work. 
	* (watch l.164 & l.257)
	*/
	var mouseXk = mouseX - xi0;	// / xM	 <------- @Naumburger: Why does rescalingng does not work works with exactly this value?
	var mouseYk = -mouseY + yi0; // / xY  <------- @Naumburger: Why does rescalingng does not work works with exactly this value?

	// 1.2 Static objects
	fill('#1515ff');
	strokeWeight(0);
	triangle(-0.6 * xM, triHeight * yM, (-0.6 - triSide / 2) * xM, 0 * yM, (-0.6 + triSide / 2) * xM, 0);
	triangle(0.6 * xM, triHeight * yM, (0.6 - triSide / 2) * xM, 0 * yM, (0.6 + triSide / 2) * xM, 0);
	
	// 1.3 Play ball
	fill('#ff8800');
	stroke('#ff8800');
	strokeWeight(1);
	circle(0, 1.05*ballradius * yM, 2*ballradius*xM);

	// 1.4 Count area
	fill('#ff000050');
	strokeWeight(0);
	rect(-0.4*xM, 0, 0.05*xM, 1*yM);
	rect(+0.35*xM, 0, 0.05*xM, 1*yM);

	stroke('burlywood');


	// 2.1.1 Left player area -------------------------------------------------------------------------------------

	push();
	translate(-0.6 *xM, triHeight *yM); // translate left
	angleLoffset = atan2(triHeight, -(0.6 + lineWidth/2) - (-0.6)) - 180;
	var distanceLeft = pow((mouseXk - (-0.6*xM + (-lineWidth/2)*xM)),2) + pow(mouseYk - (lineHeight*yM), 2);
	if(!draggingRight && distanceLeft < pow(mouseTreshhold,2)/2 && !leftIsFlying|| draggingLeft) { //not same radius as drawn circle
		strokeWeight(0)
		fill('#ff000088');

		if(!draggingLeft) 
		{
			circle((-lineWidth/2)*xM, (triHeight*yM), hightligh);
		}
		
		if(mouseIsPressed) 
		{
			draggingLeft = true;
			releasedLeft = false;

			// anglemode() https://p5js.org/reference/#/p5/angleMode
			 //flip 180° right quadrants due to atan
			angleLeft = atan2(mouseYk - (triHeight * yM), mouseXk - (-0.6 * xM)) - 180; //flip 180° right quadrants due to atan
			angleLeft -= angleLoffset;
			angleLeft = clampLeft(angleLeft);
			rotate(angleLeft);
			circle((- (lineWidth/2)*xM), (triHeight*yM), hightligh);
		}

		else if (mouseWasReleased)
		{
			draggingLeft = false;
			releasedLeft = true;
			leftIsCompressing = true;
			throwAngleLeft = Math.abs(angleLeft);
		}
	}

	if (releasedLeft && angleLeft > 0 && leftIsCompressing) 
	{
		angVelocityLeft = throwAngleLeft * 0.1; //adjust the catapult here
		angleLeft -= angVelocityLeft;
		angleLeft = clampLeft(angleLeft);
		rotate(angleLeft);
	}

	if (releasedLeft && angleLeft == 0 && leftIsCompressing)
	{
		leftIsCompressing = false;
		leftIsFlying = true;

		vxL = -angVelocityLeft * Math.sin(angleLoffset) *0.5;
		vyL =  angVelocityLeft * Math.cos(angleLoffset) *6;
		ThrowTimeL = t;
	}

	fill('#ffffff');
	strokeWeight(2);
	line((-lineWidth / 2)*xM, triHeight*yM, lineWidth / 2 * xM, - triHeight*yM);


	// 2.1.2 Left Ball -----------------------------------------------------------------------------------------------
	translate(+0.6*xM, -triHeight*yM)	// move back to origing (xi0, yi0)
	xL0 = -0.6 - lineWidth/2 * xOffset;
	yL0 = lineHeight * yOffset;
	xL = xL0;
	yL = yL0;

	ThrowingTimeL = (t - ThrowTimeL) * timeFactor;

	if(leftIsFlying) {
		xL = (xL0 + vxL*ThrowingTimeL);
		yL = (-gF*ThrowingTimeL*ThrowingTimeL/2 + vyL*ThrowingTimeL + yL0);
	
		if (yL < (0 + ballradius))
		{	
			yL = 0 + ballradius;
			groundedLeft = true;
			//print("Ground trigger: " + yL.toFixed(1) + " <= " + yL0.toFixed(1));
		}
	}

	// Draw left ball
	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
 	circle(xL*xM, yL*yM, 2*ballradius*M);
	pop(); 


	// 2.1.3 Collision with left line ----------------------------------------------------


	// End of 2.1 - Left Player ------------------------------------------------------------------------------------


	// 2.2.1 Right player ------------------------------------------------------------------------------------------
	push();
	translate(+0.6 *xM, triHeight *yM);
	angleRoffset = atan2(triHeight, (0.6 + lineWidth/2) - (0.6));
	var distanceRight = pow((mouseXk - (0.6*xM + (lineWidth/2)*xM)),2) + pow(mouseYk - (lineHeight*yM), 2);
	if(!draggingLeft && distanceRight < pow(mouseTreshhold,2)/2 && !rightIsFlying|| draggingRight) { //not same radius as drawn circle
		strokeWeight(0)
		fill('#ff000088');

		if(!draggingRight) 
		{
			circle((lineWidth/2)*xM, (triHeight*yM), hightligh);
		}
		console.log("Right Pull area");

		if(mouseIsPressed) 
		{		
			draggingRight = true;
			releasedRight = false;

			// anglemode() https://p5js.org/reference/#/p5/angleMode
			angleRight = atan2(mouseYk - (triHeight * yM), mouseXk - (0.6 * xM));
			angleRight -= angleRoffset;
			angleRight = clampRight(angleRight);
			rotate(angleRight);
			circle((lineWidth/2)*xM, (triHeight*yM), hightligh);
		}

		else if (mouseWasReleased)
		{
			if(!draggingRight)
			{
				mouseWasReleased = false;
			}
			
			else
			{
				draggingRight = false;
				releasedRight = true;
				rightIsCompressing = true;
				throwAngleRight = Math.abs(angleRight);
				print("throw: " + throwAngleRight + "°");
			}
		}
	}

	if (releasedRight && angleRight < 0 && rightIsCompressing) 
	{
		angVelocityRight = throwAngleRight * 0.1; //adjust the catapult here
		angleRight += angVelocityRight;
		angleRight = clampRight(angleRight);
		rotate(angleRight);
	}
	
	if (releasedRight && angleRight == 0 && rightIsCompressing && (!rollingFromLeft || !rollingFromLeft))
	{
		rightIsCompressing = false;
		rightIsFlying = true;

		// @Naumburger... ?
		vxR = -angVelocityRight * Math.sin(angleRoffset) *0.5;
		vyR = angVelocityRight * Math.cos(angleRoffset) *6;
		ThrowTimeR = t;
	}

	// right catapult
	fill('#ffffff');
	strokeWeight(2);
	line(+(lineWidth / 2)*xM, triHeight*yM, -lineWidth / 2 * xM, - triHeight*yM);

	// 2.2.2 Right Ball ----------------------------------------------------------------
	translate(-0.6*xM, -triHeight*yM)	// move back to origin (xi0, yi0)
	ThrowingTimeR = (t - ThrowTimeR) * timeFactor;

	if(rightIsFlying && (!rollingFromLeft || !rollingFromLeft)) {
		xR = (xR0 + vxR*ThrowingTimeR);
		yR = (-gF*ThrowingTimeR*ThrowingTimeR/2 + vyR*ThrowingTimeR + yR0);
	
		if (yR < (0 + ballradius))
		{	
			yR = 0 + ballradius;
			groundedRight = true;
			//print("Ground trigger: " + yR.toFixed(1) + " <= " + yR0.toFixed(1));
		}
	}
	
	// 2.2.3 Right Ball Collision -------------------------------------------------------

	if (xR < 0 && groundedRight) { //COLLISION with left seesaw
		if(xR <= leftCollider[0].x && xR >= leftCollider[1].x && yR <= leftCollider[1].y && !rollingFromLeft) {
			if(!collidedLeft) r_leftCollisioning();
			print("COLLISION left");
			
			let tPlane = (t - leftCollisionTime) * timeFactor;
			translate((-0.6 + lineWidth/2)*xM, 0);
			rotate(angleLoffset);
			translate((+0.6 - lineWidth/2)*xM, 0); // hillPointRight
			yR = ballradius;

			// With position of xR (right ball) at left seesaw
			dF = gF * sin(-angleLoffset);
			sL = sL0 + vDL * tPlane + dF * (tPlane*tPlane)/2;
			//print("dF: " + dF + ", vDL: " + vDL + ", sL: " + sL);
			xR = sL;
		}

		if(xR >= leftCollider[0].x && collidedLeft) {
			print("COLLISION left over");
			rollingStartTime = t;
			collidedLeft = false;
			rollingFromLeft = true;
			rotate(-angleLoffset);	

			vxR = -vDL;
		}

		if(xR <= leftCollider[1].x && collidedLeft)
		{
			collidedLeft = false;
			rightIsFlying = true;
			rotate(-angleLoffset);
			ThrowTimeR = t;

			xR0 = xR + ballradius;
			yR0 = leftCollider[1].y + ballradius;

			vxR = -angVelocityRight * Math.sin(angleRoffset) *0.3;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}

	if (xR > 0 && groundedRight) { //COLLISION with right seesaw
		if(xR >= rightCollider[0].x && xR <= rightCollider[1].x && yR <= rightCollider[1].y && !rollingFromRight) {
			if(!collidedRight) r_rightCollisioning();
			print("COLLISION right");
								
			let tPlane = (t - rightCollisionTime) * timeFactor;
			translate((+0.6 - lineWidth/2)*xM, 0);
			rotate(angleRoffset);
			translate((-0.6 + lineWidth/2)*xM, 0); // hillPointRight
			yR = ballradius;

			// With position of xR (right ball) at left seesaw
			dF = gF * sin(-angleRoffset);
			sR = sR0 + vDR * tPlane + dF * (tPlane*tPlane)/2;
			//print("dF: " + dF + ", vDR: " + vDR + ", sR: " + sR);
			xR = sR;	
		}

		if(xR <= rightCollider[0].x && collidedRight) {
			print("COLLISION right over");
			rollingStartTime = t;
			collidedRight = false;
			rollingFromRight = true; 
			rotate(-angleRoffset);	
			vxR = -vDR;
		}

		if(xR >= rightCollider[1].x && collidedRight)
		{
			collidedRight = false;
			rightIsFlying = true;
			rotate(angleRoffset);
			ThrowTimeR = t;

			xR0 = xR + ballradius;
			yR0 = rightCollider[1].y + ballradius;

			vxR = -angVelocityRight * Math.sin(angleRoffset) *0.3;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}

	if(rollingFromLeft) xR = rolling(rollingStartTime, leftCollider[0].x, xR, vxR);
	if(rollingFromRight) xR = rolling(rollingStartTime, rightCollider[0].x, xR, vxR);


	// Draw right ball
	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
	circle(xR*xM, yR*yM, 2*ballradius*M);
	
	pop(); // End of right player area --------------------------------------------------
	
	// TODO ball interaction

	pop(); // End of l.0 - Scale and Metrics (l. 101)
	t = t + dt;

	// Administration
	fill('#fafafa');
	textSize(40);
	text("Treffer " + "0" + ":" + "0", 400, 100);
	
	textSize(15);
	text("Time: " + t.toFixed(2) + " s", 40, 75);
	text("Delta: " + dt.toFixed(3) + " s", 40, 95);
	text("Loffset: " + angleLoffset.toFixed(2) + "\nRoffset: " + angleRoffset.toFixed(2), 400, 150);
	text("Throwing Time: " + ThrowTimeL.toFixed(2) + "\nAgular-Left: " + angVelocityLeft.toFixed(2) + "\nvx: " + vxL.toFixed(2) + " / vy: " + vyL.toFixed(2), 40, 150);
	text("Throwing Time : " + ThrowTimeR.toFixed(2) +"\nAgular-Right: " + angVelocityRight.toFixed(2) + "\nvx: " + vxR.toFixed(2) + " / vy: " + vyR.toFixed(2), 40, 250);
}

function clampLeft(angle) 
{
	if(angle < -250) angle += 360;
	if(angle < 0)	angle = 0;
	if(angle > 40)	angle = 40;
    return  angle;
}

function clampRight(angle) 
{
    if(angle > 0) angle = 0;
    else if (angle < -40) angle = -40;
    return angle;
}

 function mouseReleased() {
	mouseWasReleased = true;
 }

 function mousePressed() {
	mouseWasPressed = true;
	mouseWasReleased = false;
 }

 function r_leftCollisioning() {
	rollingFromRight = false;
	rightIsFlying = false;
	collidedLeft = true;

	leftCollisionTime = t;
	sL0 = xR;
	vDL = vxR;
 }

 function r_rightCollisioning() {
	rollingFromLeft = false;
	rightIsFlying = false;
	collidedRight = true;

	rightCollisionTime = t;
	sR0 = xR;
	vDR = vxR;
 }

 function l_leftCollisioning() {
	rollingFromRight = false;
	leftIsFlying = false;
	collidedLeft = true;

	leftCollisionTime = t;
	sL0 = xL;
	vDL = vxL;
 }

 function l_rightCollisioning() {
	rollingFromLeft = false;
	leftIsFlying = false;
	collidedRight = true;

	rightCollisionTime = t;
	sL0 = xL;
	vDL = vxL;
 }

 function rolling(startTime, collider, x, v) {
	let rollingTime = (t - startTime) * timeFactor
	x = collider + v*rollingTime;
	return x;
}