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

// Triagles
var triSide = 0.05;
var triHeight = (Math.sqrt(3)/2) * triSide;

// Line Position 
var lineLength = 0.25;
var lineHeight = 2*triHeight;
var lineWidth = Math.sqrt(lineLength*lineLength - lineHeight*lineHeight);

// Time
var timeFactor = 0.25 // multiplacator for all times
var t = 0.00;	// time in s
var dt;	// deltatime by fps
var fps;

// time when throw starts
var l_ThrowTimeL = 0.00, l_ThrowTimeR = 0.00;
var r_ThrowTimeL = 0.00, r_ThrowTimeR = 0.00;

// time of throw until touching ground
var l_ThrowingTimeL = 0.00, l_ThrowingTimeR = 0.00; 
var r_ThrowingTimeL = 0.00, r_ThrowingTimeR = 0.00; 

// time of collision with a seesaw
var l_rightCollsionTime = 0.00, l_leftCollisionTime = 0.00;
var r_rightCollsionTime = 0.00, r_leftCollisionTime = 0.00;

// time when rolling started on a seesaw
var l_rollingStartTime = 0.00;
var r_rollingStartTime = 0.00;

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

var leftIsFlying = false;
var rightIsFlying = false;

var l_groundedLeft = false;
var l_groundedRight = false;
var r_groundedLeft = false;
var r_groundedRight = false;

var l_collidedLeft = false;
var l_collidedRight = false;
var r_collidedLeft = false;
var r_collidedRight = false;

var l_rollingFromLeft = false;
var l_rollingFromRight = false;
var r_rollingFromLeft = false;
var r_rollingFromRight = false;


// End of declaration ------------------------------------------------------------------------------------------------------


function setup()
{
	xR0 = +0.6 + lineWidth/2 * xOffset;
	yR0 = lineHeight * yOffset;
	xR = xR0;
	yR = yR0;

	xL0 = -0.6 - lineWidth/2 * xOffset;
	yL0 = lineHeight * yOffset;
	xL = xL0;
	yL = yL0;
	
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
		r_ThrowTimeL = t;
	}

	fill('#ffffff');
	strokeWeight(2);
	line((-lineWidth / 2)*xM, triHeight*yM, lineWidth / 2 * xM, - triHeight*yM);


	// 2.1.2 Left Ball -----------------------------------------------------------------------------------------------
	translate(+0.6*xM, -triHeight*yM)	// move back to origing (xi0, yi0)
	r_ThrowingTimeL = (t - r_ThrowTimeL) * timeFactor;

	if(leftIsFlying) {
		xL = (xL0 + vxL*r_ThrowingTimeL);
		yL = (-gF*r_ThrowingTimeL*r_ThrowingTimeL/2 + vyL*r_ThrowingTimeL + yL0);
	
		if (yL < (0 + ballradius))
		{	
			yL = 0 + ballradius;
			r_groundedLeft = true;
			//print("Ground trigger: " + yL.toFixed(1) + " <= " + yL0.toFixed(1));
		}
	}
	 
	pop(); 


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
	
	if (releasedRight && angleRight == 0 && rightIsCompressing && (!r_rollingFromLeft || !r_rollingFromLeft))
	{
		rightIsCompressing = false;
		rightIsFlying = true;

		vxR = -angVelocityRight * Math.sin(angleRoffset) *0.5;
		vyR = angVelocityRight * Math.cos(angleRoffset) *6;
		r_ThrowTimeR = t;
	}

	// right catapult
	fill('#ffffff');
	strokeWeight(2);
	line(+(lineWidth / 2)*xM, triHeight*yM, -lineWidth / 2 * xM, - triHeight*yM);

	// 2.2.2 Right Ball ----------------------------------------------------------------
	translate(-0.6*xM, -triHeight*yM)	// move back to origin (xi0, yi0)
	r_ThrowingTimeR = (t - r_ThrowTimeR) * timeFactor;

	if(rightIsFlying && (!r_rollingFromLeft || !r_rollingFromLeft)) {
		xR = (xR0 + vxR*r_ThrowingTimeR);
		yR = (-gF*r_ThrowingTimeR*r_ThrowingTimeR/2 + vyR*r_ThrowingTimeR + yR0);
	
		if (yR < (0 + ballradius))
		{	
			yR = 0 + ballradius;
			r_groundedRight = true;
			//print("Ground trigger: " + yR.toFixed(1) + " <= " + yR0.toFixed(1));
		}
	}
	pop(); 
	
	// End of right player area --------------------------------------------------
	
	// TODO ball interaction

	// 2.1.3 Left Ball Collision -------------------------------------------------------

	if (xL < 0 && l_groundedLeft) { //COLLISION with left seesaw
		translate(0, 0);
		if(xL <= leftCollider[0].x && xL >= leftCollider[1].x && yL <= leftCollider[1].y && !l_rollingFromLeft) {
			if(!l_collidedLeft) l_leftCollisioning();
			print("COLLISION left");
			
			let tPlane = (t - l_leftCollisionTime) * timeFactor;
			translate((-0.6 + lineWidth/2)*xM, 0);
			rotate(angleLoffset);
			translate((+0.6 - lineWidth/2)*xM, 0); // hillPointRight
			yL = ballradius;
	
			// With position of xR (right ball) at left seesaw
			dF = gF * sin(-angleLoffset);
			sL = sL0 + vDL * tPlane + dF * (tPlane*tPlane)/2;
			//print("dF: " + dF + ", vDL: " + vDL + ", sL: " + sL);
			xL = sL;
		}
	
		if(xL >= leftCollider[0].x && l_collidedLeft) {
			print("COLLISION left over");
			l_rollingStartTime = t;
			l_collidedLeft = false;
			l_rollingFromLeft = true;
			rotate(-angleLoffset);	
	
			vxL = -vDL;
		}
	
		if(xL <= leftCollider[1].x && l_collidedLeft)
		{
			l_collidedLeft = false;
			leftIsFlying = true;
			rotate(-angleLoffset);
			l_ThrowTimeL = t;
	
			xL0 = xL + ballradius;
			yL0 = leftCollider[1].y + ballradius;
	
			vxL = -angVelocityRight * Math.sin(angleLoffset) *0.3;
			vyL = angVelocityRight * Math.cos(angleLoffset);
		}
	}
		
	
	if (xL > 0 && l_groundedLeft) { //COLLISION with right seesaw
		if(xL >= rightCollider[0].x && xL <= rightCollider[1].x && yL <= rightCollider[1].y && !l_rollingFromRight) {
			if(!l_collidedRight) l_rightCollisioning();
			print("COLLISION right");
									
			let tPlane = (t - lightCollisionTime) * timeFactor;
			translate((+0.6 - lineWidth/2)*xM, 0);
			rotate(angleRoffset);
			translate((-0.6 + lineWidth/2)*xM, 0); // hillPointRight
			yL = ballradius;
	
			// With position of xL (right ball) at left seesaw
			dF = gF * sin(-angleRoffset);
			sL = sL0 + vDL * tPlane + dF * (tPlane*tPlane)/2;
			//print("dF: " + dF + ", vDL: " + vDL + ", sL: " + sL);
			xL = sL;	
		}
	
		if(xL <= rightCollider[0].x && l_collidedRight) {
			print("COLLISION right over");
			l_rollingStartTime = t;
			l_collidedRight = false;
			l_rollingFromRight = true; 
			rotate(-angleRoffset);	
			vxL = -vDL;
		}
	
		if(xL >= rightCollider[1].x && l_collidedRight)
		{
			l_collidedRight = false;
			lefttIsFlying = true;
			rotate(angleRoffset);
			l_ThrowTimeL = t;
	
			xL0 = xL + ballradius;
			yL0 = rightCollider[1].y + ballradius;
				vxL = -angVelocityLeft * Math.sin(angleLoffset) *0.3;
			vyL = angVelocityLeft * Math.cos(angleLoffset);
			}
		}
	
	if(l_rollingFromLeft) xL = rolling(l_rollingStartTime, leftCollider[0].x, xL, vxL);
	if(l_rollingFromRight) xL = rolling(l_rollingStartTime, rightCollider[0].x, xL, vxL);
	

	// Draw left ball
	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
	circle(xL*xM, yL*yM, 2*ballradius*M);


	// 2.2.3 Right Ball Collision -------------------------------------------------------

	if (xR < 0 && r_groundedRight) { //COLLISION with left seesaw
		if(xR <= leftCollider[0].x && xR >= leftCollider[1].x && yR <= leftCollider[1].y && !r_rollingFromLeft) {
			if(!r_collidedLeft) r_leftCollisioning();
			print("COLLISION left");
				
			let tPlane = (t - r_leftCollisionTime) * timeFactor;
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
	
		if(xR >= leftCollider[0].x && r_collidedLeft) {
			print("COLLISION left over");
			r_rollingStartTime = t;
			r_collidedLeft = false;
			r_rollingFromLeft = true;
			rotate(-angleLoffset);	
	
			vxR = -vDL;
		}
	
		if(xR <= leftCollider[1].x && r_collidedLeft)
		{
			r_collidedLeft = false;
			rightIsFlying = true;
			rotate(-angleLoffset);
			r_ThrowTimeR = t;
	
			xR0 = xR + ballradius;
			yR0 = leftCollider[1].y + ballradius;
	
			vxR = -angVelocityRight * Math.sin(angleRoffset) *0.3;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}
	
	if (xR > 0 && r_groundedRight) { //COLLISION with right seesaw
		translate(0, 0);
		if(xR >= rightCollider[0].x && xR <= rightCollider[1].x && yR <= rightCollider[1].y && !r_rollingFromRight) {
			if(!r_collidedRight) r_rightCollisioning();
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
	
		if(xR <= rightCollider[0].x && r_collidedRight) {
			print("COLLISION right over");
			r_rollingStartTime = t;
			r_collidedRight = false;
			r_rollingFromRight = true; 
			rotate(-angleRoffset);	
			vxR = -vDR;
		}

			if(xR >= rightCollider[1].x && r_collidedRight)
		{
			r_collidedRight = false;
			rightIsFlying = true;
			rotate(angleRoffset);
			r_ThrowTimeR = t;
	
			xR0 = xR + ballradius;
			yR0 = rightCollider[1].y + ballradius;
	
			vxR = -angVelocityRight * Math.sin(angleRoffset) *0.3;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}
	
	if(r_rollingFromLeft) xR = rolling(r_rollingStartTime, leftCollider[0].x, xR, vxR);
	if(r_rollingFromRight) xR = rolling(r_rollingStartTime, rightCollider[0].x, xR, vxR);
	
	// Draw right ball
	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
	circle(xR*xM, yR*yM, 2*ballradius*M);

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
	text("Throwing Time: " + r_ThrowTimeL.toFixed(2) + "\nAgular-Left: " + angVelocityLeft.toFixed(2) + "\nvx: " + vxL.toFixed(2) + " / vy: " + vyL.toFixed(2), 40, 150);
	text("Throwing Time : " + r_ThrowTimeR.toFixed(2) +"\nAgular-Right: " + angVelocityRight.toFixed(2) + "\nvx: " + vxR.toFixed(2) + " / vy: " + vyR.toFixed(2), 40, 250);
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
	r_rollingFromRight = false;
	rightIsFlying = false;
	r_collidedLeft = true;

	r_leftCollisionTime = t;
	sL0 = xR;
	vDL = vxR;
 }

 function r_rightCollisioning() {
	r_rollingFromLeft = false;
	rightIsFlying = false;
	r_collidedRight = true;

	rightCollisionTime = t;
	sR0 = xR;
	vDR = vxR;
 }

 function l_leftCollisioning() {
	l_rollingFromRight = false;
	leftIsFlying = false;
	l_collidedLeft = true;

	r_leftCollisionTime = t;
	sL0 = xL;
	vDL = vxL;
 }

 function l_rightCollisioning() {
	lr_rollingFromLeft = false;
	leftIsFlying = false;
	l_collidedRight = true;

	rightCollisionTime = t;
	sL0 = xL;
	vDL = vxL;
 }

 function rolling(startTime, collider, x, v) {
	let rollingTime = (t - startTime) * timeFactor
	x = collider + v*rollingTime;
	return x;
}