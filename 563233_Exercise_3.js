/**************************************************/
/* Author: Sebastian Pütz						  */   
/*                                                */
/* p5.js Template                                 */
/* Date: 23.10.2020                               */
/*                                                */
/**************************************************/


// cartesian and origin
var xi0, yi0;                   
var x0, y0;

// Scaling
var M;						
var xM;
var yM;
var realX = 2; //m		
var realY = 1; //m
var pictureX = 1000; //px
var pictureY = 500;	 //px


var t = 0;	//time in s
var dt;	// deltatime by fps
var fps;

var draggingLeft;
var draggingRight;
var releasedLeft = true;
var releasedRight = true;


// Triagles
var triSide = 0.05;
var triHeight = (Math.sqrt(3) / 2) * triSide;

// Line Position
var lineDistance = 1.2;
var lineLength = 0.25;
var lineHeight = 2*triHeight;
var lineGround = Math.sqrt(lineLength*lineLength - lineHeight*lineHeight);

// Creating Canvas
var canvas; 
var canvasID = 'pTest';

let button;
var mouseTreshhold;
var buttonPressed = false;

function setup() {
	canvas = createCanvas(pictureX, pictureY);
	canvas.parent(canvasID);
	textFont('arial');

	button = createButton('Reset');
	button.position(800, 100);
	button.mousePressed(pressedButton);

	fps = 60;
	frameRate(fps);
	dt = 1.0 / fps;

	// Scalce Calculation
	xM = pictureX / realX;
	yM = pictureY / realY;

	// Cartesian Coordinates
	xi0 = 0.5 * width;
	yi0 = height;
	ballradius = 0.016;
}

function pressedButton() {
	console.log("pressed");
	setup();
	draw();
	if (buttonPressed == false) buttonPressed = true;
	else {
		buttonPressed = false;
	}
}

function draw() {
	background('#424549');
	fill('#fafafa');
	if (buttonPressed) {
		textSize(26);
		text("42!", 850, 100);
	}
	
	// Calculation of Movement and Scale in metrics: meter
	push();
	translate(xi0, yi0);
	scale(1, -1);

	var xOffset = 0.8;
	var yOffset = 1.30;

	// Used for calculations
	angleMode(DEGREES);
	var hightligh = 30;
	var mouseTreshhold = 20;
	var mouseXk = mouseX - xi0;
	var mouseYk = -mouseY + yi0;

	// Static objects
	fill('#1515ff');
	strokeWeight(0);

	triangle(-0.6 * xM, triHeight * yM, (-0.6 - triSide / 2) * xM, 0 * yM, (-0.6 + triSide / 2) * xM, 0);
	triangle(0.6 * xM, triHeight * yM, (0.6 - triSide / 2) * xM, 0 * yM, (0.6 + triSide / 2) * xM, 0);
	

	// Play ball
	fill('#ff8800');
	stroke('#ff8800');
	circle(0, 0 + ballradius * yM, 2 * ballradius * xM);

	fill('#ff000050');
	rect(-0.4*xM, 0, 0.05*xM, 1*yM);
	rect(+0.35*xM, 0, 0.05*xM, 1*yM);


	stroke('burlywood');

	push(); // Left area player
	translate(-0.6 *xM, triHeight*yM);
	var distanceLeft = pow((mouseXk + (0.6 + (lineGround/2))*xM),2) + pow(mouseYk - (lineHeight*yM),2);
	if(distanceLeft < pow(mouseTreshhold,2) || draggingLeft) { //not same radius as drawn circle
		strokeWeight(0);
		

		if(!draggingLeft) {
		circle((- (lineGround/2)*xM), (triHeight*yM), hightligh);
		}
		console.log("Left Pull area");

		if(mouseIsPressed) {
			draggingLeft = true;	
			releasedLeft = false;
			// angleMode() - https://p5js.org/reference/#/p5/angleMode
			let angle = atan2(mouseYk - (triHeight * yM), mouseXk - (-0.6 * xM));
			let angleOffset = atan2(lineHeight*yM - (triHeight * yM), - (-0.6 + lineHeight/2) *yM - (-0,6 *xM));
			angle -= angleOffset;
			rotate(clampLeft(angle));
			circle((- (lineGround/2)*xM), (triHeight*yM), hightligh);
		}

		else {
			draggingLeft = false;
		}
	}

	
	
	// Left catapult
	fill('#ffffff');
	strokeWeight(2);
	line((-lineGround / 2)*xM, triHeight*yM, lineGround / 2 * xM, - triHeight*yM);

	// left ball
	fill('#008800');
	stroke('#008800');
	circle((-(lineGround/2)*xM) * xOffset, (triHeight*yM) * yOffset, 2*ballradius *xM);

	pop();

	
	push(); // Right area player
	translate(+0.6 *xM, triHeight *yM);
	var distanceRight = pow((mouseXk - (0.6*xM + (lineGround/2)*xM)),2) + pow(mouseYk - (lineHeight*yM), 2);
	if(distanceRight < pow(mouseTreshhold,2)/2 || draggingRight) { //not same radius as drawn circle
		strokeWeight(0)
		fill('#ff000088');

		if(!draggingRight) {
			circle((lineGround/2)*xM, (triHeight*yM), hightligh);
		}
		console.log("Right Pull area");

		if(mouseIsPressed) {
			draggingRight = true;
			releasedRight = false;
			// anglemode() https://p5js.org/reference/#/p5/angleMode
			let angle = atan2(mouseYk - (triHeight * yM), mouseXk - (0.6 * xM));
			rotate(clampRight(angle));
			circle((lineGround/2)*xM, (triHeight*yM), hightligh);
		}

		else {
			draggingRight = false;
		}
	}

	// right catapult
	fill('#ffffff');
	strokeWeight(2);
	line(+(lineGround / 2)*xM, triHeight*yM, -lineGround / 2 * xM, - triHeight*yM);
	
	// right ball
	fill('#008800');
	stroke('#008800');
	circle((+(lineGround/2)*xM) * xOffset, (triHeight*yM) * yOffset, 2*ballradius *xM);
	
	pop();



	//x0 = x0 + v * t;
	//t = t + dt;
	pop();

	// Administration
	fill('#fafafa');
	textSize(40);
	text("Treffer " + "0" + ":" + "0", 400, 100);
}

function clampLeft(angle)
{
    if(angle < 0 && angle > -180)	angle = 0;
    else if(angle < -180 && angle > -320)	angle = -320;
    return  angle;
}

function clampRight(angle)
{
    if(angle > 0) angle = 0;
    else if (angle < -40) angle = -40;
    return angle;
}
