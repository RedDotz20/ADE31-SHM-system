void setup() {
  Serial.begin(115200); // Set the baud rate to the same value used in the Arduino
  pinMode(4, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read(); // Read the incoming command
    // Check the command received from the ESP32

    if (command == '0') {
      digitalWrite(4, HIGH); // Turn on the LED
      digitalWrite(LED_BUILTIN, LOW); // Turn on the LED
    } else if (command == '1') {
      digitalWrite(4, LOW); // Turn off the LED
      digitalWrite(LED_BUILTIN, HIGH); // Turn on the LED
    }
  }
}
