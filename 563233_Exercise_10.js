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

let button;
var mouseTreshhold;
var buttonPressed = false;
var mouseClicked = false;

// cartesian and origin
var xi0, yi0;							// current origin in px
var xL, yL, xR, yR, xC, yC;				// current coordninates of balls
var xL0, yL0, xR0, yR0, xC0, yC0;		// Startpositions of the balls
var xOffset = 0.825;					// xOffset for starting position
var yOffset = 1.2;						// yOffset for starting position

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
var t = 0.00;	// time in s
var dt;	// deltatime by fps
var fps;

// time when throw starts
var l_ThrowTime = 0.00;
var r_ThrowTime = 0.00;

// time of collision with a seesaw
var l_rightCollsionTime = 0.00, l_leftCollisionTime = 0.00;
var r_rightCollsionTime = 0.00, r_leftCollisionTime = 0.00;

// time when rolling started on a seesaw
var l_rollingStartTime = 0.00;
var r_rollingStartTime = 0.00;

// Movement
var gF = 9.81; // gravitation force
var dF = 0.00; // downhill-slope force

var vxC = 0.0, vyC = 0.0;
var vxL = 0.0, vyL = 0.0;
var vxR = 0.0, vyR = 0.0 ;	// current velocity
var vxL0, vyL0, vxR0, vyR0, vxC0, vyC0;  // starting velocity	

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
var ballradius = 0.016;
var d = 0.032;           // Balldurchmesser
var mBall = 2.5/1000;      // Ballmasse in kg

var lama = 0.4;
var windspeedms;
var windspeedkmh;
var windspeedScale = 15;

var velocityVector;
var leftCollider, rightCollider; // colliders of seesaws
var sL = 0.00, sR = 0.00, sC = 0.00;
var sL0 = 0.00, sR0 = 0.00; 
var vDL = 0.00, vDR = 0.00;

// Drag
var myR = 0.03;

// Status
var pulsed = false;
var moveable = false;
var customBall = false;
var customBallLive = false;
var c_physics = false;

var draggingLeft;
var draggingRight;

var mouseWasPressed = false;
var mouseWasReleased = false;

var releasedLeft = true;
var releasedRight = true;

var rightIsCompressing = false;
var leftIsCompressing = false;

var l_flying = false;
var r_flying = false;

var l_grounded = false;
var r_grounded = false;

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

	xC0 = 0.00;
	yC0 = 0.50;
	xC = xC0;
	yC = yC0;


	tau = mBall/(rho*cw*PI*sq(d/2));
	
	velocityVector = createVector(0,0);

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
	dt = 0.5 / fps;

	// Scalce Calculation
	xM = pictureX / realX;
	yM = pictureY / realY;
	M = (xM+yM) / 2;

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

	windspeedkmh = randomizeWindSpeed(windspeedScale); //maybe connect with button or generate for eacht throwlater
	windspeedms = windspeedkmh / 3.6;
}

function pressedButton() 
{
	window.location.href = window.location.pathname;
}

function pressedTestButton()
{
	if(!customBall) 
	{
		customBall = true;
		return;
	}

	if(customBall)
	{
		customBall = false;
		return;
	}
}

function draw()
{
	fill('#424549');
	strokeWeight(0);
	rect(0, 0, 1000, 500);
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
	* of scaling for multiplication. But somehow the transition of mouse from pixel into meters does not work. 
	* (watch l.164 & l.257)
	*/
	var mouseXk = mouseX - xi0;	// / xM	 <------- @Naumburger: Why does rescalingng not work works with exactly this value?
	var mouseYk = -mouseY + yi0; // / xY  <------- @Naumburger: Why does rescalingng not work works with exactly this value?

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
	if(!draggingRight && distanceLeft < pow(mouseTreshhold,2)/2 && !l_flying|| draggingLeft)
	{ //not same radius as drawn circle
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
			if (!draggingLeft) mouseWasReleased = false;

			else
			{
				draggingLeft = false;
				releasedLeft = true;
				leftIsCompressing = true;
				throwAngleLeft = Math.abs(angleLeft);
				print("throw: " + throwAngleLeft + "°");
			}
			
		}
	}

	if (releasedLeft && angleLeft > 0 && leftIsCompressing) 
	{
		angVelocityLeft = throwAngleLeft * 0.1; //adjust the catapult here
		angleLeft -= angVelocityLeft;
		angleLeft = clampLeft(angleLeft);
		rotate(angleLeft);
	}

	if (releasedLeft && angleLeft == 0 && leftIsCompressing && (!l_rollingFromLeft || !l_rollingFromRight))
	{
		leftIsCompressing = false;
		l_flying = true;

		vxL = -angVelocityLeft * Math.sin(angleLoffset) *0.5;
		vyL =  angVelocityLeft * Math.cos(angleLoffset) *6;
		l_ThrowTime = t;
	}

	// left catapult
	fill('#ffffff');
	strokeWeight(2);
	line((-lineWidth / 2)*xM, triHeight*yM, lineWidth / 2 * xM, - triHeight*yM);


	// 2.1.2 Left Ball -----------------------------------------------------------------------------------------------
	translate(+0.6*xM, -triHeight*yM)	// move back to origing (xi0, yi0)


	if (l_flying && (!l_rollingFromLeft || !l_rollingFromRight)) {		
		var vxT = vxL;
		vxL = vxL - ((vxL-windspeedms)*sqrt(sq(vxL-windspeedms)+sq(vyL))/(2*tau))*dt;      // I. Integration
		vyL = vyL - (vyL*sqrt(sq(vxT-windspeedms)+sq(vyL))/(2*tau) + gF)*dt;
		xL = xL + vxL*dt;                                        // II. Integration
		yL = yL + vyL*dt;
	
		if (yL < (0 + ballradius))
		{	
			yL = ballradius;

			var vyT = vyL * (-1) * lama;
			if(Math.abs(vyT) < 0.2)
			{
				l_flying = false;
				l_grounded = true;
			} 
			
			else vyL = vyT;
		}
	}

	// 2.1.3 Left Ball Collision -------------------------------------------------------
	if (xL < 0) 
	{ //COLLISION with left seesaw
		if (xL <= leftCollider[0].x && xL >= leftCollider[1].x && yL <= leftCollider[1].y && !l_rollingFromLeft) {
			if(!l_collidedLeft) l_leftCollisioning();
			print("COLLISION left");	

			translate((-0.6 + lineWidth/2)*xM, 0);
			rotate(angleLoffset);
			translate((+0.6 - lineWidth/2)*xM, 0);
			yL = ballradius;
		
			dF = gF * sin(-angleLoffset);
			vxL = vxL + (gF * cos(-angleLoffset) * myR + dF) * dt; // friction
			sL = sL + vxL * dt;
			xL = sL;
		}
		
		if(xL >= leftCollider[0].x && l_collidedLeft) {
			print("COLLISION left over");
			l_collidedLeft = false;
			l_rollingFromLeft = true;
			rotate(-angleLoffset);	
		
			xL = leftCollider[0].x;
		}
	
		if(xL <= leftCollider[1].x && l_collidedLeft)
		{
			l_collidedLeft = false;
			l_flying = true;
			l_grounded = false;

			rotate(-angleLoffset);
	
			xL = xL + ballradius;
			yL = leftCollider[1].y + ballradius;
		
			vxL = -angVelocityLeft * Math.sin(angleLoffset) *0.25;
			vyL = angVelocityLeft * Math.cos(angleLoffset);
		}
	}
		
	if (xL > 0) 
	{ //COLLISION with right seesaw
		if (xL >= rightCollider[0].x && xL <= rightCollider[1].x && yL <= rightCollider[1].y && !l_rollingFromRight) 
		{
			if(!l_collidedRight) l_rightCollisioning();
			print("COLLISION right");
										
			translate((+0.6 - lineWidth/2)*xM, 0);
			rotate(angleRoffset);
			translate((-0.6 + lineWidth/2)*xM, 0);
			yL = ballradius;
			
			dF = gF * sin(-angleRoffset);
			vxL = vxL + (gF * cos(-angleRoffset) * myR + dF) * dt;
			sL = sL + vxL * dt;
			xL = sL;
		}
		
		if(xL <= rightCollider[0].x && l_collidedRight) {
			print("COLLISION right over");
			l_collidedRight = false;
			l_rollingFromRight = true; 
			rotate(-angleRoffset);
			
			xL = rightCollider[0].x;
		}
	
		if(xL >= rightCollider[1].x && l_collidedRight)
		{
			l_flying = true;
			l_grounded = false;
			l_collidedRight = false;

			rotate(-angleRoffset);
		
			xL = xL - ballradius;
			yL = rightCollider[1].y + ballradius;

			vxL = angVelocityLeft * Math.sin(-angleLoffset) *0.25;
			vyL = angVelocityLeft * Math.cos(angleLoffset);
		}
	}
	if (l_grounded || l_rollingFromLeft) leftRolling();
	if (l_grounded || l_rollingFromRight) leftRolling();
		
	
	// Draw left ball
	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
	circle(xL*xM, yL*yM, 2*ballradius*M);
	pop()
	// End of 2.1 - Left Player ------------------------------------------------------------------------------------


	// 2.2.1 Right player ------------------------------------------------------------------------------------------
	push();
	translate(+0.6 *xM, triHeight *yM);
	angleRoffset = atan2(triHeight, (0.6 + lineWidth/2) - (0.6));
	var distanceRight = pow((mouseXk - (0.6*xM + (lineWidth/2)*xM)),2) + pow(mouseYk - (lineHeight*yM), 2);
	if (!draggingLeft && distanceRight < pow(mouseTreshhold,2)/2 && !r_flying|| draggingRight) 
	{ //not same radius as drawn circle
		strokeWeight(0)
		fill('#ff000088');

		if (!draggingRight) 
		{
			circle((lineWidth/2)*xM, (triHeight*yM), hightligh);
		}
		console.log("Right Pull area");

		if (mouseIsPressed) 
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
			if (!draggingRight) mouseWasReleased = false;

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
	
	if (releasedRight && angleRight == 0 && rightIsCompressing && (!r_rollingFromLeft || !r_rollingFromRight))
	{
		rightIsCompressing = false;
		r_flying = true;

		vxR = -angVelocityRight * Math.sin(angleRoffset) *0.5;
		vyR = angVelocityRight * Math.cos(angleRoffset) *6;
		r_ThrowTime = t;
	}

	// right catapult
	fill('#ffffff');
	strokeWeight(2);
	line(+(lineWidth / 2)*xM, triHeight*yM, -lineWidth / 2 * xM, - triHeight*yM);

	// 2.2.2 Right Ball ----------------------------------------------------------------
	translate(-0.6*xM, -triHeight*yM)	// move back to origin (xi0, yi0)
	

	if(r_flying && (!r_rollingFromLeft || !r_rollingFromRight)) {
		var vx_ = vxR;
		vxR = vxR - ((vxR-windspeedms)*sqrt(sq(vxR-windspeedms)+sq(vyR))/(2*tau))*dt;         // I. Integration
		vyR = vyR - (vyR*sqrt(sq(vx_-windspeedms)+sq(vyR))/(2*tau) + gF)*dt;
		xR = xR + vxR*dt;                                        // II. Integration
		yR = yR + vyR*dt;
	
		if (yR < (0 + ballradius))
		{	
			yR = ballradius;

			var vyT = vyR * (-1) * lama;
			if(Math.abs(vyT) < 0.05)
			{
				r_flying = false;
				r_grounded = true;
			} 
			
			else vyR = vyT;
		}
	}

	// 2.2.3 Right Ball Collision -------------------------------------------------------
	if (xR < 0) 
	{ //COLLISION with left seesaw
		if(xR <= leftCollider[0].x && xR >= leftCollider[1].x && yR <= leftCollider[1].y && !r_rollingFromLeft) {
			if(!r_collidedLeft) r_leftCollisioning();
			print("COLLISION left");
				
			translate((-0.6 + lineWidth/2)*xM, 0);
			rotate(angleLoffset);
			translate((+0.6 - lineWidth/2)*xM, 0); // hillPointRight
			yR = ballradius;
	
			dF = gF * sin(-angleLoffset);
			vxR = vxR + (gF * cos(-angleLoffset) * myR + dF) * dt;
			sR = sR + vxR * dt;
			xR = sR;
		}
	
		if(xR >= leftCollider[0].x && r_collidedLeft) {
			print("COLLISION left over");
			r_rollingStartTime = t;
			r_collidedLeft = false;
			r_rollingFromLeft = true;
			rotate(-angleLoffset);	
	
			xR = leftCollider[0].x;
		}
	
		if(xR <= leftCollider[1].x && r_collidedLeft)
		{
			r_flying = true;
			r_grounded = false;
			r_collidedLeft = false;

			rotate(-angleLoffset);
	
			xR = xR + ballradius;
			yR = leftCollider[1].y + ballradius;
		
			vxR = -angVelocityRight * Math.sin(angleRoffset) *0.25;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}
	
	if (xR > 0) 
	{ //COLLISION with right seesaw
		if(xR >= rightCollider[0].x && xR <= rightCollider[1].x && yR <= rightCollider[1].y && !r_rollingFromRight) 
		{
			if(!r_collidedRight) r_rightCollisioning();
			print("COLLISION right");
									
			translate((+0.6 - lineWidth/2)*xM, 0);
			rotate(angleRoffset);
			translate((-0.6 + lineWidth/2)*xM, 0); // hillPointRight
			yR = ballradius;
	
			dF = gF * sin(-angleRoffset);
			vxR = vxR + (gF * cos(-angleRoffset) * myR + dF)* dt;
			sR = sR + vxR * dt;
			xR = sR;
		}
	
		if(xR <= rightCollider[0].x && r_collidedRight) {
			print("COLLISION right over");
			r_rollingStartTime = t;
			r_collidedRight = false;
			r_rollingFromRight = true; 
			rotate(-angleRoffset);	

			xR = rightCollider[0].x;
		}

		if(xR >= rightCollider[1].x && r_collidedRight)
		{
			r_flying = true;
			r_grounded = false;
			r_collidedRight = false;

			rotate(-angleRoffset);
		
			xR = xR - ballradius;
			yR = rightCollider[1].y + ballradius;

			vxR = angVelocityRigth * Math.sin(-angleRoffset) *0.25;
			vyR = angVelocityRight * Math.cos(angleRoffset);
		}
	}
	if(r_grounded || r_rollingFromLeft) rightRolling();	
	if(r_grounded || r_rollingFromRight) rightRolling();

	
	// Draw right ball
	fill('#008800');
	stroke('#008800');
	strokeWeight(1);
	circle(xR*xM, yR*yM, 2*ballradius*M);
	pop();


	//3.1 Custom Ball -------------------------------------------------------------
	//HIER!

	window.addEventListener("keydown", startCustomBall, false);

	if(customBall) 
	{
		window.addEventListener("keydown", moveCustomBall, false);
		
		push();

		fill('#008888');
		strokeWeight(0);
		
		circle(xC*xM, yC*yM, 2*ballradius*M);

		velocityVector = createVector(mouseXk - xC*xM, mouseYk - yC*yM);
		if(!pulsed)drawArrow(createVector(xC*xM, yC*yM), velocityVector, '#fafafa')

		if (customBallLive) customBallPhysics(); // 3.2
		pop();
	}

	
	pop(); // End of l.0 - Scale and Metrics (l. 183)
	t = t + dt;

	// Administration
	fill('#fafafa');
	textSize(40);
	if(!customBall) text("Treffer " + "0" + ":" + "0", 400, 100);
	
	textSize(15);
	text("Time: " + t.toFixed(2) + " s", 40, 75);
	text("Delta: " + dt.toFixed(3) + " s", 40, 95);
	text("Throwing Time: " + l_ThrowTime.toFixed(2) + "\nAgular-Left: " + angVelocityLeft.toFixed(2) + "\nvx: " + vxL.toFixed(2) + " / vy: " + vyL.toFixed(2), 40, 150);
	text("Throwing Time: " + r_ThrowTime.toFixed(2) +"\nAgular-Right: " + angVelocityRight.toFixed(2) + "\nvx: " + vxR.toFixed(2) + " / vy: " + vyR.toFixed(2), 40, 250);
	text("xL0: " + xL0.toFixed(2) +  " -- yL0: " + yL0.toFixed(2) + "\nxL: " + xL.toFixed(2) + " -- yL: " + yL.toFixed(2), 800, 150);
	text("xR0: " + xR0.toFixed(2) +  " -- yR0: " + yR0.toFixed(2) + "\nxR: " + xR.toFixed(2) + " -- yR: " + yR.toFixed(2), 800, 250);
	text("xC0: " + xC0.toFixed(2) +  " -- yC0: " + yC0.toFixed(2) + "\nxC: " + xC.toFixed(2) + " -- yC: " + yC.toFixed(2), 800, 350);
	text("Windspeed: " + windspeedkmh.toFixed(2), 40, 340);

	textSize(20);
	if(customBall) text("R:  Reset Test Ball \nWASD:  Move Test Ball \nSpace:  Shoot Test Ball", 400, 100);
}


//HIER!

//3.2 Custom Ball Physics
function customBallPhysics()
{
	//3.2.1 Custom Ball
	
	if(!c_physics) {
		c_physics = true;
	}

	if(!pulsed)	
	{
		vxC = 2*velocityVector.x /xM;
		vyC = 2*velocityVector.y /yM;
		pulsed = true;	
	}

	customRolling();
	console.log("vxC: " + vxC);
	console.log("vyC: " + vyC);
}


function startCustomBall(key)
{
	if (key.keyCode == "13")  // Enter
	{
		console.log("Enter");
		
		if(!customBall) customBall = true;
		else customBall = false;
	}
}


function moveCustomBall(key)
{
	if(!customBall) return;
	
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

 function l_leftCollisioning() {
	l_rollingFromRight = false;
	l_flying = false;
	l_collidedLeft = true;
	sL = xL;
 }

 function l_rightCollisioning() {
	l_rollingFromLeft = false;
	l_flying = false;
	l_collidedRight = true;
	sL = xL;
 }

 function r_leftCollisioning() {
	r_rollingFromRight = false;
	r_flying = false;
	r_collidedLeft = true;
	sR = xR;
 }

 function r_rightCollisioning() {
	r_rollingFromLeft = false;
	r_flying = false;
	r_collidedRight = true;
	sR = xR;
 }

 function c_leftCollisioning() {
	c_rollingFromRight = false;
	c_flying = false;
	c_collidedLeft = true;
	sC = xC;
 }

 function c_rightCollisioning() {
	c_rollingFromLeft = false;
	c_flying = false;
	c_collidedRight = true;
	sC = xC;
 }

 function leftRolling() {
	if(vxL > 0) vxL = vxL - myR * gF * dt;
	else vxL = vxL + myR * gF * dt;

	if(Math.abs(vxL) < 0.01) vxL = 0;
	xL = xL + vxL * dt;	

	return vxL;
}

function rightRolling() {
	if(vxR > 0) vxR = vxR - myR * gF * dt;
	else vxR = vxR + myR * gF * dt;

	if(Math.abs(vxR) < 0.01) vxR = 0;
	xR = xR + vxR * dt;	

	return vxR;
}

function customRolling() {
	if(Math.abs(vxC) < 0.01) vxC = 0;

	xC = xC + vxC * dt;	
	yC = yC + vyC * dt;	

	return vxC;
}

function randomizeWindSpeed(number) 
{
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