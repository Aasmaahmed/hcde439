// Match the baud rate in the Arduino code
const BAUD_RATE = 9600;

// Set the threshold for day and night modes
const threshold = 450;

// Store the readings received from Arduino
let sensorReading = 0;
let brightness = 0;

// Declare global variables for the serial connection
let port, connectBtn;

// Store the positions of all flowers
let flowers = [];

// Store the positions of all stars
let stars = [];

function setup() {
  // Run the serial setup function
  setupSerial();

  // Create a canvas that fills the browser window
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // Check whether the serial port is open
  const portIsOpen = checkPort();

  // Exit if Arduino is not connected
  if (!portIsOpen) return;

  // Read incoming data until a newline
  let str = port.readUntil("\n");

  // Update readings when new data is received
  if (str.length > 0) {

    // Remove whitespace and separate values by commas
    let arr = str.trim().split(",");

    // Make sure both values are received
    if (arr.length == 2) {

      // Convert the received values to numbers
      sensorReading = Number(arr[0]);
      brightness = Number(arr[1]);
    }
  }
  // Convert brightness percentage to an opacity value
  let opacity = map(brightness, 0, 100, 0, 255);

  // Determine day or night mode
  if (sensorReading > threshold) {

    // Set a light blue background
    background(135, 206, 235);

    // Remove the outline of the sun
    noStroke();

    // Set the sun color to yellow
    fill(255, 220, 0, opacity);

    // Draw the sun
    circle(width * 0.8, height * 0.2, 100);

    // Draw all flowers stored in the flowers array
    for (let flower of flowers) {
      drawFlower(flower.x, flower.y);
    }

  } else {

    // Set a dark blue background
    background(15, 20, 50);

    // Remove the outline of the moon
    noStroke();

    // Set the moon color
    fill(240, 240, 210, opacity);

    // Draw the moon
    circle(width * 0.8, height * 0.2, 100);

    // Use the background color to create a crescent
    fill(15, 20, 50);
    circle(width * 0.8 + 25, height * 0.2 - 15, 90);

    // Draw all stars stored in the stars array
    for (let star of stars) {
      drawStar(star.x, star.y);
    }
  }
}

function drawFlower(x, y) {
  // Set a consistent flower height from the bottom
  y = height - 180;

  // Remove outlines
  noStroke();

  // Draw the stem
  fill(146, 208, 80);
  rect(x - 6, y, 12, 180);

  // Draw the left leaf
  ellipse(x - 23, y + 90, 50, 22);

  // Draw the right leaf
  ellipse(x + 23, y + 130, 50, 22);

  // Draw the pink flower
  fill("pink");
  circle(x, y, 80);

  // Draw the yellow center
  fill("yellow");
  circle(x, y, 30);
}

// Draw a star at the specified x and y coordinates
function drawStar(x, y) {

  // Save the current drawing settings
  push();

  // Position the star where the user clicked
  translate(x, y);

  // Reduce the star to 15% of its original size
  scale(0.15);

  // Set the star color
  noStroke();
  fill("yellow");

  // Draw the star
  beginShape();
  vertex(0, 0);
  vertex(15, 40);
  vertex(60, 40);
  vertex(25, 65);
  vertex(40, 110);
  vertex(0, 80);
  vertex(-40, 110);
  vertex(-25, 65);
  vertex(-60, 40);
  vertex(-15, 40);
  endShape(CLOSE);

  // Restore the original drawing settings
  pop();
}

function mousePressed() {
  // Make sure Arduino is connected
  if (!port.opened()) return;

  // Ignore clicks near the connection button
  if (mouseY < 40) return;

  // Add flowers during the day in the lower half
  if (sensorReading > threshold && mouseY >= height / 2) {

    // Store the flower position
    flowers.push({ x: mouseX, y: mouseY });

    // Send F to Arduino
    port.write("F");

  // Add stars during the night in the upper half
  } else if (sensorReading <= threshold && mouseY < height / 2) {

    // Store the star position
    stars.push({ x: mouseX, y: mouseY });

    // Send S to Arduino
    port.write("S");
  }
}


// Three helper functions for managing the serial connection

function setupSerial() {
  // Create a serial object
  port = createSerial();

  // Check for previously used serial ports
  let usedPorts = usedSerialPorts();

  if (usedPorts.length > 0) {
    // Open the first previously used port
    port.open(usedPorts[0], BAUD_RATE);
  }

  // Create a connection button
  connectBtn = createButton("Connect to Arduino");

  // Position the button in the top left corner
  connectBtn.position(5, 5);

  // Run the function when the button is clicked
  connectBtn.mouseClicked(onConnectButtonClicked);
}

function checkPort() {
  // Check if the serial port is closed
  if (!port.opened()) {

    // Update the button text
    connectBtn.html("Connect to Arduino");

    // Set the background to gray
    background("gray");

    return false;

  } else {

    // Update the button text when connected
    connectBtn.html("Disconnect");

    return true;
  }
}

function onConnectButtonClicked() {
  // Check whether the serial port is open
  if (!port.opened()) {

    // Open the serial port
    port.open(BAUD_RATE);

  } else {

    // Close the serial port
    port.close();
  }
}