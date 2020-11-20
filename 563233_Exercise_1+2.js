/**************************************************/
/* Author: Sebastian Pütz                 	      */   
/*                                                */
/* p5.js Template                                 */
/* Date: 17.10.2020                        		  */
/*                                                */
/**************************************************/

/* Variablendeklaration */
var xi0, yi0;                   // Cartesian origing of coordinate system
var x0, y0;

var M							// Scale into meter
var realX = 2;					// meters		
var pictureX = 1000; 			// pixels
var pictureY = 500;	            // pixels

var t = 0;						// time
var dt;							// delta time - by framerate
var frameRate;					// Needed for floating point reciprocal


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

function setup() {
	canvas = createCanvas(pictureX, pictureY);
	canvas.parent(canvasID);

	fremrRate = 60;
	frameRate(frameRate);
	dt = 1.0 / frameRate;

	// Scalce Calculation
	M = pictureX / realX;

	// Cartesian Coordinates
	xi0 = 0.5 * width;
	yi0 = height;
	ballradius = 0.016;
}

function draw() {
	background('#aaaaaa');

	// Presentation  Calculation in pixel

	//circle(xi0, yi0 - ballradius * M, 2 * ballradius * M);
	//triangle(xi0 - 0.6*M, yi0 - triHeight*M, xi0 - 0.6*M - (triSide/2)*M, yi0, xi0 - 0.6*M + (triSide/2)*M, yi0);
	//triangle(xi0 + 0.6*M, yi0 - triHeight*M, xi0 + 0.6*M - (triSide/2)*M, yi0, xi0 + 0.6*M + (triSide/2)*M, yi0);
	//line(xi0 - (lineDistance/2 + lineGround/2)*M, yi0 - lineHeight*M, xi0 - (lineDistance/2 - lineGround/2)*M, yi0);
	//line(xi0 + (lineDistance/2 + lineGround/2)*M, yi0 - lineHeight*M, xi0 + (lineDistance/2 - lineGround/2)*M, yi0);


	// Calculation of Movement and Scale in metrics: meter
	push();
	translate(xi0, yi0);
	scale(1, -1);
	fill('#ff0000');
    circle(0, 0 + ballradius * M, 2 * ballradius * M);

	fill('#0000ff');
	triangle(-0.6 * M, triHeight * M, (-0.6 - triSide / 2) * M, 0 * M, (-0.6 + triSide / 2) * M, 0 * M);
	triangle(0.6 * M, triHeight * M, (0.6 - triSide / 2) * M, 0 * M, (0.6 + triSide / 2) * M, 0 * M);
	line(-(lineDistance / 2 + lineGround / 2) * M, lineHeight * M, -(lineDistance / 2 - lineGround / 2) * M, 0);
	line((lineDistance / 2 + lineGround / 2) * M, lineHeight * M, (lineDistance / 2 - lineGround / 2) * M, 0);

	fill('#ffffff');
	var offsetX = 0.95;
	var offsetY = 1.10;
	circle((-0.6*M - (lineGround/2)*M) * offsetX, (lineHeight*M) * offsetY, 2*ballradius *M);
	circle((+0.6*M + (lineGround/2)*M) * offsetX, (lineHeight*M) * offsetY, 2*ballradius *M);

	//x0 = x0 + v * t;
	//t = t + dt;
	pop();

	// Administration
	fill(0);
	textSize(40);
	text("Treffer " + "0" + ":" + "0", 400, 100);
}