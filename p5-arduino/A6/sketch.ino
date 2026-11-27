// Include the library to control the LCD screen
#include <LiquidCrystal.h>

// digital pins connected to the LCD
const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;

// Create an LCD object using the defined pins
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

// photoresistor and potentiometer input pins
const int sensor = A1;
const int poten = A0;

// Set the threshold for switching between day and night modes
const int threshold = 450;

// Store the previous day or night mode
bool previousDayMode = false;

void setup() {
  // Set the photoresistor and potentiometer as inputs
  pinMode(sensor, INPUT);
  pinMode(poten, INPUT);

  // Start serial communication at a baud rate of 9600
  // to communicate with p5.js
  Serial.begin(9600);

  // Initialize the LCD with 16 columns and 2 rows
  lcd.begin(16, 2);
}

void loop() {
  // Read the analog values from the photoresistor
  // and potentiometer
  int sensorReading = analogRead(sensor);
  int potenReading = analogRead(poten);

  // Map the potentiometer reading from 0-1023
  // to a brightness percentage between 0 and 100
  int brightness = map(potenReading, 0, 1023, 0, 100);

  // Determine the current mode based on the light reading
  // True represents day mode and false represents night mode
  bool currentDayMode = sensorReading > threshold;

  // Check if the mode has changed
  if (currentDayMode != previousDayMode) {

    // Move the LCD cursor to the second row
    lcd.setCursor(0, 1);

    // Clear the previous flower or star message using 16 spaces
    lcd.print("                ");

    // Update the previous mode to match the current mode
    previousDayMode = currentDayMode;
  }

  // Display day mode if the light reading is above
  // or equal to the threshold
  if (sensorReading > threshold) {

    // Move the LCD cursor to the first row
    lcd.setCursor(0, 0);

    // Display the day mode message
    lcd.print("    DAY MODE  ");
  } 
  else {

    // Display night mode if the light reading is
    // below the threshold
    lcd.setCursor(0, 0);
    lcd.print("   NIGHT MODE    ");
  }

  // Send the photoresistor reading to p5.js
  Serial.print(sensorReading);

  // Separate the two values with a comma
  Serial.print(",");

  // Send the brightness percentage
  Serial.println(brightness);

  // Check if Arduino has received data from p5.js
  // as a result of a mouse click
  if (Serial.available() > 0) {

    // Read the incoming character sent from p5.js
    char incomingData = Serial.read();

    // Check if F was received, indicating a flower was added
    if (incomingData == 'F') {

      // Display Flower Added on the second row of the LCD
      lcd.setCursor(0, 1);
      lcd.print("  Flower Added  ");
    }

    // Check if S was received, indicating a star was added
    if (incomingData == 'S') {

      // Display Star Added on the second row of the LCD
      lcd.setCursor(0, 1);
      lcd.print("   Star Added   ");
    }
  }

  // Wait 100 ms 
  delay(100);
}