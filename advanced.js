// Code written by Destiny Iroakazi
// Canvas and context declaration
var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext('2d');

// Index of the image. Used to loop through dots.
var i = 0;

// Variable to let us know the status of the canvas
var running = false;
var stopped = false;
var moveDirection = null;
var lastDraw = false;

// Initial shape. Is set as a constant so we can reset when needed. Also, in lowercase by habit - should be Uppercase.
const shapeInitial = [
   {x:7,y:24},
    {x:35,y:3},
    {x:85,y:5},
    {x:152,y:29},
    {x:224,y:86},
    {x:255,y:128},
    {x:285,y:185},
    {x:296,y:152},
    {x:279,y:110},
    {x:250,y:79},
    {x:279,y:110},
    {x:296,y:152},
    {x:315,y:149},
    {x:333,y:116},
    {x:366,y:82},
    {x:333,y:116},
    {x:315,y:149},
    {x:317,y:177},
    {x:328,y:209},
    {x:317,y:177},
    {x:351,y:132},
    {x:403,y:67},
    {x:460,y:27},
    {x:523,y:5},
    {x:560,y:4},
    {x:595,y:13},
    {x:606,y:31},
    {x:600,y:65},
    {x:576,y:122},
    {x:557,y:159},
    {x:539,y:186},
    {x:527,y:203},
    {x:496,y:215},
    {x:427,y:221},
    {x:368,y:217},
    {x:328,y:209},
    {x:368,y:217},
    {x:427,y:221},
    {x:496,y:215},
    {x:521,y:237},
    {x:542,y:259},
    {x:553,y:283},
    {x:551,y:315},
    {x:543,y:348},
    {x:530,y:382},
    {x:511,y:410},
    {x:479,y:431},
    {x:450,y:439},
    {x:429,y:441},
    {x:404,y:434},
    {x:376,y:406},
    {x:346,y:362},
    {x:321,y:326},
    {x:328,y:261},
    {x:328,y:209},
    {x:328,y:261},
    {x:321,y:326},
    {x:317,y:360},
    {x:306,y:376},
    {x:291,y:354},
    {x:289,y:322},
    {x:281,y:271},
    {x:278,y:227},
    {x:285,y:185},
    {x:278,y:227},
    {x:281,y:271},
    {x:289,y:322},
    {x:251,y:376},
    {x:219,y:419},
    {x:180,y:438},
    {x:120,y:427},
    {x:80,y:379},
    {x:60,y:323},
    {x:58,y:280},
    {x:80,y:244},
    {x:124,y:216},
    {x:179,y:220},
    {x:234,y:219},
    {x:277,y:210},
    {x:285,y:185},
    {x:277,y:210},
    {x:234,y:219},
    {x:179,y:220},
    {x:124,y:216},
    {x:86,y:205},
    {x:64,y:173},
    {x:47,y:143},
    {x:28,y:103},
    {x:14,y:69},
    {x:7,y:24}
];

// The shape that will be manipulated - moved to center, right, left, top, or bottom.
var shape = shapeInitial;


// Some more constants. Self-explainatory, but let me get through them quickly

// Window width and height
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// Radius of the dots (points)
const radius = 7;

// Line thickness of the gradient lines
const lineThickness = 7;

// Time to wait before the next step - in milliseconds
const timeoutTime = 300;

// Time to wait before next move - in milliseconds
const movingTime = 50;

// Step to move - in pixels
const movingStep = 4;

// Limit is used as the index of the last point. Not the size itself. We need this to know the last point's index so that we can connect it to the first point - close the loop.
const limit = (shape.length - 1);

// Function to clear the Canvas
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function that draws the dots
const drawDots = () => {
  // clear canvas
  clearCanvas();

  // Loop through all points and draw dots using the x and y coordinates.
  shape.forEach((dot, index) => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  });
}

// Function that moves the shape to the center of the screen. Some maths involved, explained below.
const moveToCenter = () => {
  // Declare the extrema
  let mostLeftDot = 0;
  let mostRightDot = 0;
  let mostTopDot = 0;
  let mostBottomDot = 0;

  // Set the extrema
  shape.forEach((item, i) => {
    if(item.x < mostLeftDot || mostLeftDot == 0) {
      mostLeftDot = item.x;
    }
    if(item.x > mostRightDot || mostRightDot == 0) {
      mostRightDot = item.x;
    }
    if(item.y < mostTopDot || mostTopDot == 0) {
      mostTopDot = item.y;
    }
    if(item.y > mostBottomDot || mostBottomDot == 0) {
      mostBottomDot = item.y;
    }
  });

  // Calculate the offset for x and y axis
  let offsetX = (windowWidth - (mostRightDot - mostLeftDot))/2;
  let offsetY = (windowHeight - (mostBottomDot - mostTopDot))/2;

  // Apply offset for each point
  shape = shape.map((d) => {
    return {x: d.x+offsetX, y: d.y+offsetY}
  });
}

// Function that draws all points in the canvas.
async function drawShape() {
  // clear canvas
  clearCanvas();

  // reset index of the shape
  i = 0;

  // Draw the points first.
  drawDots();

  // Connect all dots by looping through all points of the shape.
  while (i < shape.length) {
    // Here we need to wait for the drawNextLine function to complete before the next iteration.
    await drawNextLine();

    // Increment the index
    i++;
  }
}

// Function that will wait for a given amount of time before doing something
const sleep = (ms) => {
  // Notice here we use Promise, as we don't want to return anything before the timeout has been completed.
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Function that starts the animation
async function beginAnimation() {

  // Set some statuses. Self-explainatory.
  stopped = false;
  running = true;

  // Set the button's Label to "Stop", since it has started now.
  // document.getElementById("animationControl").innerText = 'Stop';

  // Disable Extra Buttons
  disableExtraButttons();

  // Reset some variables. Explained in the function.
  resetVars();

  // Move the shape to the center of the screen.
  moveToCenter();

  // Draw the dots.
  drawDots();

  // reset index;
  i = 0;

  // Here we need to wait for the sleep and drawNextLine function to complete before the next iteration, as we might have to wait a few soconds before the next move.
  while (i < shape.length) {
    await sleep(timeoutTime);
    await drawNextLine();

    // Increment the index
    i++;
  }

  // One last wait before we start to move the shape.
  await sleep(timeoutTime);

  // Basic animation done, reset button Text
  resetButton_animationControl();

  // Enable Extra Buttons
  enableExtraButttons();

  // Get the direction in which the shape has to move, randomly.
  // moveDirection = Math.floor(Math.random() * 4);

  // Move the shape.
  // moveShape(moveDirection);
}

// Function which draws the next line. Note that here we use the index declared earlier.
const drawNextLine = () => {

  // Return Promise, as we want the function to finish before moving on.
  return new Promise(function(resolve, reject) {
    // Declare gradient. Will be filled below.
    let gradient;

    // Begin a path, from a certain point.
    ctx.beginPath();
    ctx.moveTo(shape[i].x, shape[i].y);

    // Since we use the index, we need the limit to know whether we are at the last point. Using "shape.length" will not work.
    // For all points except the last one, connect to the next point. Also set the gradient's direction.
    if(i < limit) {
      ctx.lineTo(shape[i + 1].x, shape[i + 1].y);
      gradient = ctx.createLinearGradient(shape[i].x, shape[i].y, shape[i + 1].x, shape[i + 1].y);
    }
    // The last point connects to the first one.
    else {
      ctx.lineTo(shape[0].x, shape[0].y);
      gradient = ctx.createLinearGradient(shape[i].x, shape[i].y, shape[0].x, shape[0].y);
    }

    // Set gradient colors
    gradient.addColorStop("0", "blue");
    gradient.addColorStop("0.5" ,"red");
    gradient.addColorStop("1.0", "yellow");

    // Set stroke style as gradient...
    ctx.strokeStyle = gradient;
    // ...and line's width using line's thickness, declared as a constant
    ctx.lineWidth = lineThickness;

    // Apply the stroke
    ctx.stroke();

    // return resolved Promise - can be read as "successfully completed".
    resolve("done!");
  });

}

// Reset variables
const resetVars = () => {
  lastDraw = false;
  canRedraw = true;

  // reset shape to it's initial form
  shape = shapeInitial;
}

const moveShapeRandomly = () => {
  stopButton_animationControl();

  // Get the direction in which the shape has to move, randomly.
  moveDirection = Math.floor(Math.random() * 4);

  // Move the shape.
  moveShape(moveDirection);
}


const moveShapeRight = (e) => {
  e.preventDefault();
  stopButton_animationControl();

  // Set the direction in which the shape has to move, right.
  moveDirection = 0;

  // Move the shape.
  moveShape(moveDirection);
  resetButton_animationControl();
}


const moveShapeLeft = (e) => {
  e.preventDefault();

  stopButton_animationControl();

  // Set the direction in which the shape has to move, right.
  moveDirection = 1;

  // Move the shape.
  moveShape(moveDirection);
}

const moveShapeTop = (e) => {
  e.preventDefault();

  stopButton_animationControl();

  // Set the direction in which the shape has to move, right.
  moveDirection = 2;

  // Move the shape.
  moveShape(moveDirection);
}

const moveShapeBottom = (e) => {
  e.preventDefault();
  // Set the direction in which the shape has to move, right.
  moveDirection = 3;

  // Move the shape.
  moveShape(moveDirection);
}

// Function to move the shape
async function moveShape(dir) {

  // Check whether it's stopped. If so, don't do anything.
  if(stopped) {
    return false;
  }

  // Declare x and y, later to be used
  let x = 0;
  let y = 0;

  switch (dir) {
    case 0:
        // Move right
        shape = shape.map((d) => {
          // Set the next point to move. Here we need to change only the x axis, since it's moving right.
          x = d.x+movingStep;
          console.log(x, typeof(x));

          // One last correction if needed.
          if(x > (windowWidth - radius)) {
            // This will correct the in-between values. So if the shape is further than the canvas width, it will make it touch the egde.
            x = (windowWidth - radius);
            // This variable let's us know that this will be the last draw of the shape, since it has reached the end
            lastDraw = true;
            console.log(x,y, "vnvnvn")
          }
          console.log(x,d.y, "try")
          return {x: x, y: d.y}
        
         
        });
      break;
    case 1:
        // Move left
        shape = shape.map((d) => {
          // Set the next point to move. Here we need to change only the x axis, since it's moving left.
          x = d.x-movingStep;

          // One last correction if needed.
          if(x < radius) {
            // This will correct the in-between values. So if the shape is further than the canvas width, it will make it touch the egde on the left side.
            x = radius;
            // This variable let's us know that this will be the last draw of the shape, since it has reached the end
            lastDraw = true;
          }
          return {x: x, y: d.y}
        });
      break;
    case 2:
        // Move top
        shape = shape.map((d) => {
          // Set the next point to move. Here we need to change only the y axis, since it's moving up.
          y = d.y-movingStep;

          // One last correction if needed.
          if(y < radius) {
            // This will correct the in-between values. So if the shape is further than the canvas height, it will make it touch the egde on the top side.
            y = radius;
            // This variable let's us know that this will be the last draw of the shape, since it has reached the end
            lastDraw = true;
          }
          return {x: d.x, y: y}
        });
      break;
    case 3:
        // Move bottom
        shape = shape.map((d) => {
          // Set the next point to move. Here we need to change only the y axis, since it's moving down.
          y = d.y+movingStep;

          // One last correction if needed.
          if(y > (windowHeight - radius)) {
            // This will correct the in-between values. So if the shape is further than the canvas height, it will make it touch the egde on the bottom side.
            y = (windowHeight - radius);
            lastDraw = true;
          }
          return {x: d.x, y: y}
        });
      break;
    default:
      break;
  }


  // Declare canRedraw as true, since we assume that we can redraw the shape. Then check
  let canRedraw = true;

  shape.forEach((item, i) => {
    if(item.x > (windowWidth - radius) || item.x < radius || item.y < radius || item.y > (windowHeight - radius) || lastDraw) {

      // If any of the points is outside the canvas, we cannot redraw...
      canRedraw = false;
    }
  });

  // ...except if it's the last, corrected draw. Then do it one more time and stop the animation
  if(lastDraw) {
    await sleep(movingTime);
    await drawShape();

    // Set the last draw to false, since it's already drawn by now.
    lastDraw = false;

    // Stop the animation
    stopAnimation();

    // Also return a value so the next lines won't be executed.
    return false;
  }

  if(!canRedraw) {
    // Stop the animation since it can't redraw.
    stopAnimation();

    // Also return a value so the next lines won't be executed.
    return false;
  }

  // If all the checks are OK, wait for a bit and redraw the shape.
  await sleep(movingTime);
  await drawShape();

  // Call itself, since we want to move it again, until it touches the edge.
  moveShape(dir);
}

// Button control
const handleAnimation = () => {

  // If it is not running, then begin animation when the button is clicked.
  if(!running) {
    beginAnimation();
  }
  // If it is already runnning, the stop the animation.
  else {
    stopAnimation();
  }
}

// Function to stop the animation. Will reset some variables and also change the button's text.
const stopAnimation = () => {
  stopped = true;
  running = false;
  resetButton_animationControl();
}


// Function to change button text
const resetButton_animationControl = () => {
  document.getElementById("animationControl").innerText = 'Begin Animation';
}

// Function to change button text to stop
const stopButton_animationControl = () => {
  document.getElementById("animationControl").innerText = 'Stop';
}


const enableExtraButttons = () => {
  let inputs = document.getElementsByClassName('extra-button');
  for(var i = 0; i < inputs.length; i++) {
    inputs[i].disabled = false;
  }
}

const disableExtraButttons = () => {
  let inputs = document.getElementsByClassName('extra-button');
  for(var i = 0; i < inputs.length; i++) {
    inputs[i].disabled = true;
  }
}

// Function to initialize things. Here we set the canvas' width, height, and we add an event listener to the buttons.
const init = () => {
  canvas.width = windowWidth;
  canvas.height = windowHeight;

  document.getElementById("animationControl").addEventListener("click", handleAnimation);
  document.getElementById("clear").addEventListener("click", clearCanvas);
  document.getElementById("random_animation").addEventListener("click", moveShapeRandomly);
  document.getElementById("right_animation").addEventListener("click", moveShapeRight);
  document.getElementById("left_animation").addEventListener("click", moveShapeLeft);
  document.getElementById("top_animation").addEventListener("click", moveShapeTop);
  document.getElementById("bottom_animation").addEventListener("click", moveShapeBottom);
  
}

// On load, call this function
init();
