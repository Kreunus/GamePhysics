/**************************************************/
/* Author: Sebastian Pütz                    	  */
/*                                                */
/* p5.js Template                                 */
/* Date: 20.11.2020                               */
/*                                                */
/**************************************************/


// Creating Canvas
var canvas;
var canvasID = 'pTest';


var leftPoints = 0;
var rightPoints = 0;

let button;
var mouseTreshhold;
var buttonPressed = false;
var mouseClicked = false;

// cartesian and origin
var xi0, yi0;									// current origin in px
var xL, yL, xR, yR, xC, yC, xM, yM;				// current coordninates of balls
var xL0, yL0, xR0, yR0, xC0, yC0, xM0, yM0;		// Startpositions of the balls
var xOffset = 0.825;							// xOffset for starting position
var yOffset = 1.2;								// yOffset for starting position

// Scaling
var scaling, xScaling, yScaling;
var realX = 2; //m
var realY = 1; //m
var pictureX = 1000; //px
var pictureY = 500; //px

// Triagles
var triSide = 0.05;
var triHeight = (Math.sqrt(3) / 2) * triSide;

// Line Position 
var lineLength = 0.25;
var lineHeight = 2 * triHeight;
var lineWidth = Math.sqrt(lineLength * lineLength - lineHeight * lineHeight);

// Time
var t = 0.00;			// time in s
var dt, t_, t_1, t_2; 	// deltatime by fps
var fps;

// time when throw starts
var l_ThrowTime = 0.00;
var r_ThrowTime = 0.00;

// time of collision with a seesaw
var l_rightCollisionTime = 0.00, l_leftCollisionTime = 0.00;
var r_rightCollisionTime = 0.00, r_leftCollisionTime = 0.00;

// time when rolling started on a seesaw
var l_rollingStartTime = 0.00;
var r_rollingStartTime = 0.00;

// Movement
var gF = 9.81; // gravitation force
var dF = 0.00; // downhill-slope force

var vxL = 0.0, vyL = 0.0;
var vxR = 0.0, vyR = 0.0;
var vxC = 0.0, vyC = 0.0;
var vxM = 0.0, vyM = 0.0; // current velocity
var vxL0, vyL0, vxR0, vyR0, vxC0, vyC0, vxM0, vyM0;  // starting velocity	

var angVelocityLeft = 0.0;
var angVelocityRight = 0.0;

var angleLeft;
var angleRight;
var angleLoffset = 0.0;
var angleRoffset = 0.0;
var throwAngleLeft = 0.0;
var throwAngleRight = 0.0;

var tau;
var rho = 1.3;         // Luftdichte in kg/m³
var cw = 0.45;          // cw-Wert Vollkugel bei v > 5 m/s
var radius = 0.016;
var d = 0.032;           // Balldurchmesser
var mBall = 2.5 / 1000;      // Ballmasse in kg

var lama = 0.6;
var windspeedms;
var windspeedkmh;
var windspeedScale = 6;

var velocityVector;
var leftCollider, rightCollider; // colliders of seesaws
var sL = 0.00, sR = 0.00, sC = 0.00;
var sL0 = 0.00, sR0 = 0.00;
var vDL = 0.00, vDR = 0.00;

// Drag
var myR = 0.08;
var myM = 0.19;

// Status
var paused = false;

var pulsed = false;
var moveable = false;
var customBall = false;
var customBallLive = false;
var c_physics = false;

var draggingLeft = false;
var draggingRight = false;

var mouseWasPressed = false;
var mouseWasReleased = false;

var releasedLeft = true;
var releasedRight = true;

var rightIsCompressing = false;
var leftIsCompressing = false;

var l_flying = false;
var r_flying = false;
var c_flying = false;
var m_flying = false;

var l_grounded = false;
var r_grounded = false;
var c_grounded = false;
var m_grounded = true;

var l_collidedLeft = false;
var l_collidedRight = false;
var r_collidedLeft = false;
var r_collidedRight = false;

var l_rollingFromLeft = false;
var l_rollingFromRight = false;
var r_rollingFromLeft = false;
var r_rollingFromRight = false;

var customColliding = false;
var leftColliding = false;
var rightColliding = false;

var leftBallFinished = false;
var rightBallFinished = false;

// End of declaration ------------------------------------------------------------------------------------------------------


function setup()
{
	leftPoints, rightPoints = 0;
	nextRound();

	tau = mBall / (rho * cw * PI * sq(d / 2));
	velocityVector = createVector(0, 0);

	leftCollider = [
		createVector(-0.6 + lineWidth / 2, 0),
		createVector(-0.6 - lineWidth / 2, lineHeight)
	];

	rightCollider = [
		createVector(+0.6 - lineWidth / 2, 0),
		createVector(+0.6 + lineWidth / 2, lineHeight)
	];

	canvas = createCanvas(pictureX, pictureY);
	canvas.parent(canvasID);
	textFont('arial');

	fps = 60;
	frameRate(fps);
	dt = 0.5 / fps;

	// Scalce Calculation
	xScaling = pictureX / realX;
	yScaling = pictureY / realY;
	scaling = (xScaling + yScaling) / 2;

	// Cartesian Coordinates
	xi0 = 0.5 * width;
	yi0 = height;

	button = createButton('Restart App');
	button.size(120, 35);
	button.position(830, 50); //because sacling withh get implemented
	button.mousePressed(pressedButton);

	testbutton = createButton('Testmode');
	testbutton.size(120, 35);
	testbutton.position(830, 90); //because sacling withh get implemented
	testbutton.mousePressed(pressedTestButton);

	changewindbutton = createButton('Change Windspeed');
	changewindbutton.size(120, 35);
	changewindbutton.position(60, 355);
	changewindbutton.mousePressed(changeWindSpeed);
}

function nextRound()
{
	pulsed = false;
	moveable = false;
	customBall = false;
	customBallLive = false;
	c_physics = false;
	
	draggingLeft = false;
	draggingRight = false;

	mouseWasPressed = false;
	mouseWasReleased = false;
	
	releasedLeft = true;
	releasedRight = true;
	
	rightIsCompressing = false;
	leftIsCompressing = false;
	
	l_flying = false;
	r_flying = false;
	c_flying = false;
	m_flying = false;
	
	l_grounded = false;
	r_grounded = false;
	c_grounded = false;
	m_grounded = true;
	
	l_collidedLeft = false;
	l_collidedRight = false;
	r_collidedLeft = false;
	r_collidedRight = false;
	
	l_rollingFromLeft = false;
	l_rollingFromRight = false;
	r_rollingFromLeft = false;
	r_rollingFromRight = false;
	
	customColliding = false;
	leftColliding = false;
	rightColliding = false;

	leftBallFinished = false;
	rightBallFinished = false;

	angVelocityLeft = 0.0;
	angVelocityRight = 0.0;

	xR0 = +0.6 + lineWidth / 2 * xOffset;
	yR0 = lineHeight * yOffset;
	xR = xR0;
	yR = yR0;
	vxR = 0.0;
	vyR = 0.0;

	xL0 = -0.6 - lineWidth / 2 * xOffset;
	yL0 = lineHeight * yOffset;
	xL = xL0;
	yL = yL0;
	vxL = 0.0;
	vyL = 0.0

	xM0 = 0.0;
	yM0 = 0.0 + radius;
	xM = xM0;
	yM = yM0;
	vxM = 0.0;
	vyM = 0.0;

	xC0 = 0.0;
	yC0 = 0.4;
	xC = xC0;
	yC = yC0;

	
	windspeedkmh = randomizeWindSpeed(windspeedScale); //maybe connect with button or generate for eacht throwlater
	windspeedms = windspeedkmh / 3.6;
}

function resetRound()
{
	pulsed = false;
	moveable = false;
	customBall = false;
	customBallLive = false;
	c_physics = false;
	
	draggingLeft = false;
	draggingRight = false;

	mouseWasPressed = false;
	mouseWasReleased = false;
	
	releasedLeft = true;
	releasedRight = true;
	
	rightIsCompressing = false;
	leftIsCompressing = false;
	
	l_flying = false;
	r_flying = false;
	c_flying = false;
	m_flying = false;
	
	l_grounded = false;
	r_grounded = false;
	c_grounded = false;
	m_grounded = true;
	
	l_collidedLeft = false;
	l_collidedRight = false;
	r_collidedLeft = false;
	r_collidedRight = false;
	
	l_rollingFromLeft = false;
	l_rollingFromRight = false;
	r_rollingFromLeft = false;
	r_rollingFromRight = false;
	
	customColliding = false;
	leftColliding = false;
	rightColliding = false;

	leftBallFinished = false;
	rightBallFinished = false;

	angVelocityLeft = 0.0;
	angVelocityRight = 0.0;

	xR0 = +0.6 + lineWidth / 2 * xOffset;
	yR0 = lineHeight * yOffset;
	xR = xR0;
	yR = yR0;
	vxR = 0.0;
	vyR = 0.0;

	xL0 = -0.6 - lineWidth / 2 * xOffset;
	yL0 = lineHeight * yOffset;
	xL = xL0;
	yL = yL0;
	vxL = 0.0;
	vyL = 0.0

	windspeedkmh = randomizeWindSpeed(windspeedScale); //maybe connect with button or generate for eacht throwlater
	windspeedms = windspeedkmh / 3.6;
}

function changeWindSpeed() 
{
	windspeedkmh = randomizeWindSpeed(windspeedScale); //maybe connect with button or generate for eacht throwlater
	windspeedms = windspeedkmh / 3.6;
}

function wait(waitsecs) {
    setTimeout(donothing(), 'waitsecs');
}

function donothing() {
    //
}


function pressedButton() {
	window.location.href = window.location.pathname;
}

function pressedTestButton() {
	if (!customBall) {
		customBall = true;
		return;
	}

	if (customBall) {
		customBall = false;
		return;
	}
}

function draw() {
	fill('#424549');
	strokeWeight(0);
	rect(0, 0, 1000, 500);
	fill('#fafafa');


	// 1.1  Scale and Metrics
	push();
	translate(xi0, yi0);
	scale(1, -1);
	xOr = xi0 / xScaling;
	yOr = yi0 / yScaling;

	// Used for calculations
	angleMode(DEGREES);
	var hightligh = 30;
	var mouseTreshhold = 20;

	/*
	* I wanted to refactor some code for distance calculation of mouse position and drag point not using xM or yM
	* of scaling for multiplication. But somehow the transition of mouse from pixel into meters does not work. 
	* (watch l.164 & l.257)
	*/
	var mouseXk = mouseX - xi0;	// / xM	 <------- @Naumburger: Why does rescalingng not work works with exactly this value?
	var mouseYk = -mouseY + yi0; // / xY  <------- @Naumburger: Why does rescalingng not work works with exactly this value?

	// 1.2 Static objects
	fill('#1515ff');
	strokeWeight(0);
	triangle(-0.6 * xScaling, triHeight * yScaling, (-0.6 - triSide / 2) * xScaling, 0 * yScaling, (-0.6 + triSide / 2) * xScaling, 0);
	triangle(0.6 * xScaling, triHeight * yScaling, (0.6 - triSide / 2) * xScaling, 0 * yScaling, (0.6 + triSide / 2) * xScaling, 0);

	// 1.4 Count area
	fill('#ff000050');
	strokeWeight(0);
	rect(-0.45 * xScaling, 0, 0.05 * xScaling, 1 * yScaling);
	rect(+0.40 * xScaling, 0, 0.05 * xScaling, 1 * yScaling);

	stroke('burlywood');


	// 2.1.1 Left player area -------------------------------------------------------------------------------------
	push();
	translate(-0.6 * xScaling, triHeight * yScaling); // translate left
	angleLoffset = atan2(triHeight, -(0.6 + lineWidth / 2) - (-0.6)) - 180;
	var distanceLeft = pow((mouseXk - (-0.6 * xScaling + (-lineWidth / 2) * xScaling)), 2) + pow(mouseYk - (lineHeight * yScaling), 2);
	if (!draggingRight && distanceLeft < pow(mouseTreshhold, 2) / 2 && !l_flying || draggingLeft) { //not same radius as drawn circle
		strokeWeight(0)
		fill('#ff000088');

		if (!draggingLeft) {
			circle((-lineWidth / 2) * xScaling, (triHeight * yScaling), hightligh);
		}

		if (mouseIsPressed) {
			draggingLeft = true;
			releasedLeft = false;

			// anglemode() https://p5js.org/reference/#/p5/angleMode
			//flip 180° right quadrants due to atan
			angleLeft = atan2(mouseYk - (triHeight * yScaling), mouseXk - (-0.6 * xScaling)) - 180; //flip 180° right quadrants due to atan
			angleLeft -= angleLoffset;
			angleLeft = clampLeft(angleLeft);
			rotate(angleLeft);
			circle((- (lineWidth / 2) * xScaling), (triHeight * yScaling), hightligh);
		}

		else if (mouseWasReleased) {
			if (!draggingLeft) mouseWasReleased = false;

			else {
				draggingLeft = false;
				releasedLeft = true;
				leftIsCompressing = true;
				throwAngleLeft = Math.abs(angleLeft);
				print("throw: " + throwAngleLeft + "°");
			}
		}
	}

	if (releasedLeft && angleLeft > 0 && leftIsCompressing) {
		angVelocityLeft = throwAngleLeft * 0.1; //adjust the catapult here
		angleLeft -= angVelocityLeft;
		angleLeft = clampLeft(angleLeft);
		rotate(angleLeft);
	}

	if (releasedLeft && angleLeft == 0 && leftIsCompressing && (!l_rollingFromLeft || !l_rollingFromRight)) {
		leftIsCompressing = false;
		l_flying = true;

		vxL = -angVelocityLeft * Math.sin(angleLoffset) * 0.5;
		vyL = angVelocityLeft * Math.cos(angleLoffset) * 6;
		l_ThrowTime = t;
	}

	// left catapult
	fill('#ffffff');
	strokeWeight(2);
	line((-lineWidth / 2) * xScaling, triHeight * yScaling, lineWidth / 2 * xScaling, - triHeight * yScaling);


	// 2.1.2 Left Ball -----------------------------------------------------------------------------------------------
	translate(+0.6 * xScaling, -triHeight * yScaling)	// move back to origing (xi0, yi0)


	if (l_flying && (!l_rollingFromLeft || !l_rollingFromRight)) {
		var vxT = vxL;
		vxL = vxL - ((vxL - windspeedms) * sqrt(sq(vxL - windspeedms) + sq(vyL)) / (2 * tau)) * dt;      // I. Integration
		vyL = vyL - (vyL * sqrt(sq(vxT - windspeedms) + sq(vyL)) / (2 * tau) + gF) * dt;
		xL = xL + vxL * dt;                                        // II. Integration
		yL = yL + vyL * dt;

		if (yL < (0 + radius)) {
			yL = radius;

			var vyT = vyL * (-1) * lama;
			if (Math.abs(vyT) < 0.2) {
				l_flying = false;
				l_grounded = true;
			}

			else vyL = vyT;
		}
	}

	// 2.1.3 Left Ball Collision -------------------------------------------------------
	if (xL < 0) { //COLLISION with left seesaw
		if (xL <= leftCollider[0].x && xL >= leftCollider[1].x && yL <= leftCollider[1].y && !l_rollingFromLeft) {
			if (!l_collidedLeft) l_leftCollisioning();
			print("COLLISION left");

			translate((-0.6 + lineWidth / 2) * xScaling, 0);
			rotate(angleLoffset);
			translate((+0.6 - lineWidth / 2) * xScaling, 0);
			yL = radius;

			dF = gF * sin(-angleLoffset);
			vxL = vxL + (gF * cos(-angleLoffset) * myR + dF) * dt; // friction
			sL = sL + vxL * dt;
			xL = sL;
		}

		if (xL >= leftCollider[0].x && l_collidedLeft) {
			print("COLLISION left over");
			l_collidedLeft = false;
			l_rollingFromLeft = true;
			rotate(-angleLoffset);

			xL = leftCollider[0].x;
		}

		if (xL <= leftCollider[1].x && l_collidedLeft) {
			l_collidedLeft = false;
			l_flying = true;
			l_grounded = false;

			rotate(-angleLoffset);

			xL = xL + radius;
			yL = leftCollider[1].y + radius;

			vxL = -angVelocityLeft * Math.sin(angleLoffset) * 0.25;
			vyL = angVelocityLeft * Math.cos(angleLoffset);
		}
	}

	if (xL > 0) { //COLLISION with right seesaw
		if (xL >= rightCollider[0].x && xL <= rightCollider[1].x && yL <= rightCollider[1].y && !l_rollingFromRight) {
			if (!l_collidedRight) l_rightColliding();
			print("COLLISION right");

			translate((+0.6 - lineWidth / 2) * xScaling, 0);
			rotate(angleRoffset);
			translate((-0.6 + lineWidth / 2) * xScaling, 0);
			yL = radius;

			dF = gF * sin(-angleRoffset);
			vxL = vxL + (gF * cos(-angleRoffset) * myR + dF) * dt;
			sL = sL + vxL * dt;
			xL = sL;
		}

		if (xL <= rightCollider[0].x && l_collidedRight) {
			print("COLLISION right over");
			l_collidedRight = false;
			l_rollingFromRight = true;
			rotate(-angleRoffset);

			xL = rightCollider[0].x;
		}

		if (xL >= rightCollider[1].x && l_collidedRight) {
			l_flying = true;
			l_grounded = false;
			l_collidedRight = false;

			rotate(-angleRoffset);

			xL = xL - radius;
			yL = rightCollider[1].y + radius;

			vxL = angVelocityLeft * Math.sin(-angleLoffset) * 0.25;
			vyL = angVelocityLeft * Math.cos(angleLoffset);
		}
	}

	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
	if (l_grounded || l_rollingFromLeft || l_rollingFromRight) leftRolling();
	if (leftBallFinished) xL = 1000;
	circle(xL * xScaling, yL * yScaling, 2 * radius * scaling);

	pop()
	// End of 2.1 - Left Player ------------------------------------------------------------------------------------


	// 2.2.1 Right player ------------------------------------------------------------------------------------------
	push();
	translate(+0.6 * xScaling, triHeight * yScaling);
	angleRoffset = atan2(triHeight, (0.6 + lineWidth / 2) - (0.6));
	var distanceRight = pow((mouseXk - (0.6 * xScaling + (lineWidth / 2) * xScaling)), 2) + pow(mouseYk - (lineHeight * yScaling), 2);
	if (!draggingLeft && distanceRight < pow(mouseTreshhold, 2) / 2 && !r_flying || draggingRight) { //not same radius as drawn circle
		strokeWeight(0)
		fill('#ff000088');

		if (!draggingRight) {
			circle((lineWidth / 2) * xScaling, (triHeight * yScaling), hightligh);
		}
		console.log("Right Pull area");

		if (mouseIsPressed) {
			draggingRight = true;
			releasedRight = false;

			// anglemode() https://p5js.org/reference/#/p5/angleMode
			angleRight = atan2(mouseYk - (triHeight * yScaling), mouseXk - (0.6 * xScaling));
			angleRight -= angleRoffset;
			angleRight = clampRight(angleRight);
			rotate(angleRight);
			circle((lineWidth / 2) * xScaling, (triHeight * yScaling), hightligh);
		}

		else if (mouseWasReleased) {
			if (!draggingRight) mouseWasReleased = false;

			else {
				draggingRight = false;
				releasedRight = true;
				rightIsCompressing = true;
				throwAngleRight = Math.abs(angleRight);
				print("throw: " + throwAngleRight + "°");
			}
		}
	}

	if (releasedRight && angleRight < 0 && rightIsCompressing) {
		angVelocityRight = throwAngleRight * 0.1; //adjust the catapult here
		angleRight += angVelocityRight;
		angleRight = clampRight(angleRight);
		rotate(angleRight);
	}

	if (releasedRight && angleRight == 0 && rightIsCompressing && (!r_rollingFromLeft || !r_rollingFromRight)) {
		rightIsCompressing = false;
		r_flying = true;

		vxR = -angVelocityRight * Math.sin(angleRoffset) * 0.5;
		vyR = angVelocityRight * Math.cos(angleRoffset) * 6;
		r_ThrowTime = t;
	}

	// right catapult
	fill('#ffffff');
	strokeWeight(2);
	line(+(lineWidth / 2) * xScaling, triHeight * yScaling, -lineWidth / 2 * xScaling, - triHeight * yScaling);

	// 2.2.2 Right Ball ----------------------------------------------------------------
	translate(-0.6 * xScaling, -triHeight * yScaling)	// move back to origin (xi0, yi0)


	if (r_flying && (!r_rollingFromLeft || !r_rollingFromRight)) {
		var vx_ = vxR;
		vxR = vxR - ((vxR - windspeedms) * sqrt(sq(vxR - windspeedms) + sq(vyR)) / (2 * tau)) * dt;         // I. Integration
		vyR = vyR - (vyR * sqrt(sq(vx_ - windspeedms) + sq(vyR)) / (2 * tau) + gF) * dt;
		xR = xR + vxR * dt;                                        // II. Integration
		yR = yR + vyR * dt;

		if (yR < (0 + radius)) {
			yR = radius;

			var vyT = vyR * (-1) * lama;
			if (Math.abs(vyT) < 0.05) {
				r_flying = false;
				r_grounded = true;
			}
			else vyR = vyT;
		}
	}

	// 2.2.3 Right Ball Collision -------------------------------------------------------
	if (xR < 0) { //COLLISION with left seesaw
		if (xR <= leftCollider[0].x && xR >= leftCollider[1].x && yR <= leftCollider[1].y && !r_rollingFromLeft) {
			if (!r_collidedLeft) r_leftColliding();
			print("COLLISION left");

			translate((-0.6 + lineWidth / 2) * xScaling, 0);
			rotate(angleLoffset);
			translate((+0.6 - lineWidth / 2) * xScaling, 0); // hillPointRight
			yR = radius;

			dF = gF * sin(-angleLoffset);
			vxR = vxR + (gF * cos(-angleLoffset) * myR + dF) * dt;
			sR = sR + vxR * dt;
			xR = sR;
		}

		if (xR >= leftCollider[0].x && r_collidedLeft) {
			print("COLLISION left over");
			r_rollingStartTime = t;
			r_collidedLeft = false;
			r_rollingFromLeft = true;
			rotate(-angleLoffset);

			xR = leftCollider[0].x;
		}

		if (xR <= leftCollider[1].x && r_collidedLeft) {
			r_flying = true;
			r_grounded = false;
			r_collidedLeft = false;

			rotate(-angleLoffset);

			xR = xR + radius;
			yR = leftCollider[1].y + radius;

			vxR = -angVelocityRight * Math.sin(angleRoffset) * 0.25;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}

	if (xR > 0) { //COLLISION with right seesaw
		if (xR >= rightCollider[0].x && xR <= rightCollider[1].x && yR <= rightCollider[1].y && !r_rollingFromRight) {
			if (!r_collidedRight) r_rightColliding();
			print("COLLISION right");

			translate((+0.6 - lineWidth / 2) * xScaling, 0);
			rotate(angleRoffset);
			translate((-0.6 + lineWidth / 2) * xScaling, 0); // hillPointRight
			yR = radius;

			dF = gF * sin(-angleRoffset);
			vxR = vxR + (gF * cos(-angleRoffset) * myR + dF) * dt;
			sR = sR + vxR * dt;
			xR = sR;
		}

		if (xR <= rightCollider[0].x && r_collidedRight) {
			print("COLLISION right over");
			r_rollingStartTime = t;
			r_collidedRight = false;
			r_rollingFromRight = true;
			rotate(-angleRoffset);

			xR = rightCollider[0].x;
		}

		if (xR >= rightCollider[1].x && r_collidedRight) {
			r_flying = true;
			r_grounded = false;
			r_collidedRight = false;

			rotate(-angleRoffset);

			xR = xR - radius;
			yR = rightCollider[1].y + radius;

			vxR = angVelocityRigth * Math.sin(-angleRoffset) * 0.25;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}

	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
	if (r_grounded || r_rollingFromLeft || r_rollingFromRight) rightRolling();
	if (rightBallFinished) xR = 1000;
	circle(xR * xScaling, yR * yScaling, 2 * radius * scaling);
	pop();


	//3.1 Custom Ball -------------------------------------------------------------
	window.addEventListener("keydown", startCustomBall, false);


	if (customBall) {
		window.addEventListener("keydown", moveCustomBall, false);

		push();
		fill('#008888');
		strokeWeight(0);

		customRolling();
		circle(xC * xScaling, yC * yScaling, 2 * radius * scaling);

		velocityVector = createVector(mouseXk - xC * xScaling, mouseYk - yC * yScaling);
		if (!pulsed) drawArrow(createVector(xC * xScaling, yC * yScaling), velocityVector, '#fafafa')

		if (customBallLive) customBallPhysics(); // 3.2
		pop();
	}

	customCollision();
	ballCollision();
	middleRolling();

	// 1.3 Play ball
	fill('#ff8800');
	stroke('#ff8800');
	strokeWeight(1);

	
	if (yM < (0 + radius)) {
		yM = radius;

		m_flying = false;
		m_grounded = true;
		
	}
	circle(xM * xScaling, yM * yScaling, 2 * radius * xScaling);

	if (Math.abs(xR) > 1) 
	{
		vxR = 0;
		wait(2);
		rightBallFinished = true;
	}

	if (Math.abs(xL) > 1) 
	{
		vxL = 0;
		wait(2);
		leftBallFinished = true;
	}

	pop(); // End of l.0 - Scale and Metrics (l. 183)
	t = t + dt;


	// Administration

	if (leftBallFinished && rightBallFinished) resetRound();

	if (xM <= -0.40) 
	{
		rightPoints ++;
		nextRound();
	}

	if (xM >= +0.40) 
	{
		leftPoints ++;
		nextRound();
	}

	fill('#fafafa');
	textSize(40);
	if (!customBall) text(leftPoints + " : " + rightPoints, 460, 100);

	textSize(15);
	text("Time: " + t.toFixed(2) + " s", 40, 75);
	text("Delta: " + dt.toFixed(3) + " s", 40, 95);

	text("Throwing Time: " + l_ThrowTime.toFixed(2) + "\nAgular-Left: " + angVelocityLeft.toFixed(2) + "\nvx: " + vxL.toFixed(2) + " / vy: " + vyL.toFixed(2), 40, 140);
	text("Throwing Time: " + r_ThrowTime.toFixed(2) + "\nAgular-Right: " + angVelocityRight.toFixed(2) + "\nvx: " + vxR.toFixed(2) + " / vy: " + vyR.toFixed(2), 40, 225);
	text("Windspeed: " + windspeedkmh.toFixed(2), 40, 325);

	text("xL: " + xL.toFixed(2) + " -- yL: " + yL.toFixed(2) + "\nxR: " + xR.toFixed(2) + " -- yR: " + yR.toFixed(2), 800, 150);
	text("xC0: " + xC0.toFixed(2) + " -- yC0: " + yC0.toFixed(2) + "\nxC: " + xC.toFixed(2) + " -- yC: " + yC.toFixed(2), 800, 225);
	text("xM0: " + xM0.toFixed(2) + " -- yM0: " + yM0.toFixed(2) + "\nxM: " + xM.toFixed(2) + " -- yM: " + yM.toFixed(2), 800, 300);

	text("Gibt noch kleine Bugs? Woran könnte es liegen? \n\nAngular Velocity plötzlich 'not defined'" 
	+ "\n\nRechter Ball: Seltsamer Rückroll Effekt \nTritt nur bei höhren Windgeschwindigkeiten auf!", 340, 210);
	
	textSize(20);
	if (customBall) text("P: Pause the Game \nR:  Reset Test Ball \nWASD:  Move Test Ball \nSpace:  Shoot Test Ball", 400, 100);
}

function ballCollision() 
{	
	var dx1 = xR - xM;
	var dy1 = yR - yM;

	var dvx1 = vxR - vxM;
	var dvy1 = vyR - vyM;

	t_1 = abs((-sqrt((sq(dvx1) + sq(dvy1)) * sq(radius + radius) - sq(dx1 * dvy1 - dy1 * dvx1)) - (dx1 * dvx1 + dy1 * dvy1)) / (sq(dvx1) + sq(dvy1)));    


	var dx2 = xL - xM;
	var dy2 = yL - yM;

	var dvx2 = vxL - vxM;
	var dvy2 = vyL - vyM;
	t_2 = abs((-sqrt((sq(dvx2) + sq(dvy2)) * sq(radius + radius) - sq(dx2 * dvy2 - dy2 * dvx2)) - (dx2 * dvx2 + dy2 * dvy2)) / (sq(dvx2) + sq(dvy2)));   

	if (t_1 <= dt && !rightColliding) {
		console.log("Touching right ball")
		dt = t_1;
		rightColliding = true;
	}

	else {
		dt = 1 / fps;
		rightColliding = false;
	}

	if (t_2 <= dt && !leftColliding) {
		console.log("Touchung left ball")
		dt = t_2;
		leftColliding = true;
	}

	else {
		dt = 1 / fps;
		leftColliding = false;
	}

	if (rightColliding) {  // Collision
		console.log("Impact right");
		var beta = atan2(yR - yM, xR - xM);
		var phi = beta - 90; //HALF_PI

		// Impact
		var v1T = vxM * cos(phi) + vyM * sin(phi);
		var v1Z = -vxM * sin(phi) + vyM * cos(phi);

		var v2T = vxR * cos(phi) + vyR * sin(phi);
		var v2Z = -vxR * sin(phi) + vyR * cos(phi);

		// Energy Flow
		var v1Z_ = v2Z;							// Radialgeschwindigkeiten ((m1-m2)*v1Z+2*m2*v2Z)/(m1+m2);
		var v1T_ = v1T;							// Tangentialgeschwindigkeiten
		//var v1_ = sqrt(sq(v1Z_)+sq(v1T_));   

		var v2Z_= v1Z;       					// Radialgeschwindigkeiten ((m1-m2)*v1Z+2*m2*v2Z)/(m1+m2);
		var v2T_ = v2T;       					// Tangentialgeschwindigkeiten
		//var v2_ = sqrt(sq(v2Z_)+sq(v2T_)); 

		var v1x_ = v1T_ * cos(-phi) + v1Z_ * sin(-phi);
		var v1y_ = -v1T_ * sin(-phi) + v1Z_ * cos(-phi);
		var v2x_ = v2T_ * cos(-phi) + v2Z_ * sin(-phi);
		var v2y_ = -v2T_ * sin(-phi) + v2Z_ * cos(-phi);

		vxM = v1x_;
		vyM = v1y_;
		vxR = v2x_;
		vyR = v2y_;

		if(m_grounded) 
		{
			vyR = Math.abs(vyR) + Math.abs(vyM); // Backforce
		}
	}

	if (leftColliding) {  // Collision
		console.log("Impact left");
		var beta = atan2(yL - yM, xL - xM);
		var phi = beta - 90; //HALF_PI

		// Impact
		var v1T = vxM * cos(phi) + vyM * sin(phi);
		var v1Z = -vxM * sin(phi) + vyM * cos(phi);

		var v2T = vxL * cos(phi) + vyL * sin(phi);
		var v2Z = -vxL * sin(phi) + vyL * cos(phi);

		// Energy Flow
		var v1Z_ = v2Z;							// Radialgeschwindigkeiten ((m1-m2)*v1Z+2*m2*v2Z)/(m1+m2);
		var v1T_ = v1T;							// Tangentialgeschwindigkeiten
		//var v1_ = sqrt(sq(v1Z_)+sq(v1T_));   

		var v2Z_= v1Z;       					// Radialgeschwindigkeiten ((m1-m2)*v1Z+2*m2*v2Z)/(m1+m2);
		var v2T_ = v2T;       					// Tangentialgeschwindigkeiten
		//var v2_ = sqrt(sq(v2Z_)+sq(v2T_)); 

		var v1x_ = v1T_ * cos(-phi) + v1Z_ * sin(-phi);
		var v1y_ = -v1T_ * sin(-phi) + v1Z_ * cos(-phi);
		var v2x_ = v2T_ * cos(-phi) + v2Z_ * sin(-phi);
		var v2y_ = -v2T_ * sin(-phi) + v2Z_ * cos(-phi);

		vxM = v1x_;
		vyM = v1y_;
		vxL = v2x_;
		vyL = v2y_;

		if(m_grounded) 
		{
			vyL = Math.abs(vyL) + Math.abs(vyM); // Backforce
		}
	}
}

function customCollision() 
{
	//var dx = x2 - x1;
	var dx = xC - xM;
	var dy = yC - yM;

	var dvx = vxC - vxM;
	var dvy = vyC - vyM;

	t_ = abs((-sqrt((sq(dvx) + sq(dvy)) * sq(radius + radius) - sq(dx * dvy - dy * dvx)) - (dx * dvx + dy * dvy)) / (sq(dvx) + sq(dvy)));       // Prognose


	if (t_ <= dt && !customColliding) {
		console.log("Hello... touching")
		dt = t_;
		customColliding = true;
	}

	else {
		dt = 1 / fps;
		customColliding = false;
	}

	if (customColliding) {  // Collision
		console.log("Hello... impact")
		var beta = atan2(yC - yM, xC - xM);
		var phi = beta - 90; //HALF_PI

		// Impact
		var v1T = 0; //vxM * cos(phi) + vyM * sin(phi);
		var v1Z = 0; //-vxM * sin(phi) + vyM * cos(phi);

		var v2T = vxC * cos(phi) + vyC * sin(phi);
		var v2Z = -vxC * sin(phi) + vyC * cos(phi);

		// Energy Flow
		var v1Z_ = v2Z;							// Radialgeschwindigkeiten ((m1-m2)*v1Z+2*m2*v2Z)/(m1+m2);
		var v1T_ = v1T;							// Tangentialgeschwindigkeiten
		//var v1_ = sqrt(sq(v1Z_)+sq(v1T_));   

		var v2Z_= v1Z;       					// Radialgeschwindigkeiten ((m1-m2)*v1Z+2*m2*v2Z)/(m1+m2);
		var v2T_ = v2T;       					// Tangentialgeschwindigkeiten
		//var v2_ = sqrt(sq(v2Z_)+sq(v2T_)); 

		var v1x_ = v1T_ * cos(-phi) + v1Z_ * sin(-phi);
		var v1y_ = -v1T_ * sin(-phi) + v1Z_ * cos(-phi);
		var v2x_ = v2T_ * cos(-phi) + v2Z_ * sin(-phi);
		var v2y_ = -v2T_ * sin(-phi) + v2Z_ * cos(-phi);

		vxM = v1x_;
		vyM = v1y_;
		vxC = v2x_;
		vyC = v2y_;

		if(m_grounded) 
		{
			vyC = Math.abs(vyC) + Math.abs(vyM); // Backforce
		}
	}
}

//3.2 Custom Ball Physics
function customBallPhysics() {
	//3.2.1 Custom Ball

	if (!c_physics) {
		c_physics = true;
	}

	if (!pulsed) {
		vxC = 2 * velocityVector.x / xScaling;
		vyC = 2 * velocityVector.y / yScaling;
		pulsed = true;
	}

	// console.log("vxC: " + vxC);
	// console.log("vyC: " + vyC);
}

function keyPressed() {
	if (!paused && keyCode == 80) {
		noLoop();
		paused = true;
	}

	else if (paused && keyCode == 80) {
		loop();
		paused = false;
	}
}

function startCustomBall(key) {
	if (key.keyCode == "13")  // Enter
	{
		console.log("Enter");

		if (!customBall) customBall = true;
		else customBall = false;
	}
}

function moveCustomBall(key) {
	if (!customBall) return;

	if (key.keyCode == "82") // R
	{
		xC = xC0;
		yC = yC0;

		vxC = 0;
		vyC = 0;

		pulsed = false;
		customBallLive = false;
	}

	if (key.keyCode == "87") // W
	{
		console.log("W");
		yC = yC + 0.01;
		if (yC > 1) yC = 1;
	}

	if (key.keyCode == "65") // A
	{
		console.log("A");
		xC = xC - 0.01;
		if (xC < -1.0) xC = -1.0;
	}

	if (key.keyCode == "83") // S
	{
		console.log("S");
		yC = yC - 0.01;
		if (yC < 0) yC = 0;
	}

	if (key.keyCode == "68") // D
	{
		console.log("D");
		xC = xC + 0.01;
		if (xC > 1) xC = 1.0;
	}

	if (key.keyCode == "32") // Space
	{
		console.log("Space");
		xC0 = xC;
		yC0 = yC;
		customBallLive = true;
	}
}

function clampLeft(angle) {
	if (angle < -250) angle += 360;
	if (angle < 0) angle = 0;
	if (angle > 40) angle = 40;
	return angle;
}

function clampRight(angle) {
	if (angle > 0) angle = 0;
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

function l_leftCollisioning() {
	l_rollingFromRight = false;
	l_flying = false;
	l_collidedLeft = true;
	sL = xL;
}

function l_rightColliding() {
	l_rollingFromLeft = false;
	l_flying = false;
	l_collidedRight = true;
	sL = xL;
}

function r_leftColliding() {
	r_rollingFromRight = false;
	r_flying = false;
	r_collidedLeft = true;
	sR = xR;
}

function r_rightColliding() {
	r_rollingFromLeft = false;
	r_flying = false;
	r_collidedRight = true;
	sR = xR;
}

function c_leftColliding() {
	c_rollingFromRight = false;
	c_flying = false;
	c_collidedLeft = true;
	sC = xC;
}

function c_rightColliding() {
	c_rollingFromLeft = false;
	c_flying = false;
	c_collidedRight = true;
	sC = xC;
}

function leftRolling() {
	if (vxL > 0) vxL = vxL - myR * gF * dt;
	else if (vxL < 0) vxL = vxL + myR * gF * dt;

	if (Math.abs(vxL) < 0.05)
	{
		vxL = 0;
		leftBallFinished = true;
	} 

	xL += vxL * dt;
}

function rightRolling() {
	if (vxR > 0) vxR = vxR - myR * gF * dt;
	else if (vxR < 0) vxR = vxR + myR * gF * dt;

	if (Math.abs(vxR) < 0.05)
	{
		vxR = 0;
		rightBallFinished = true;
	} 

	xR += vxR * dt;
}

function middleRolling() {
	if (vxM > 0) vxM = vxM - myM * gF * dt;
	else if (vxM < 0) vxM = vxM + myM * gF * dt;

	if (Math.abs(vxM) < 0.05) vxM = 0;
	xM += vxM * dt;
}

function customRolling() {
	xC += vxC * dt;
	yC += vyC * dt;
}

function randomizeWindSpeed(number) {
	return Math.random() * (number + number) - number;
}

function drawArrow(base, vec, myColor) {
	push();
	stroke(myColor);
	strokeWeight(3);
	fill(myColor);
	translate(base.x, base.y);
	line(0, 0, vec.x, vec.y);
	rotate(vec.heading());
	let arrowSize = 7;
	translate(vec.mag() - arrowSize, 0);
	triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
	pop();
}