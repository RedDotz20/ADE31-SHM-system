#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsServer.h>

const int voltagePin = 39; // Analog pin connected to the ZMPT101B output
const int currentPin = 34; // Analog pin connected to the SCT-013 output

const char *ssid = "ZTE Main 2.4G";
const char *password = "tabangay0607";

WebSocketsServer webSocket = WebSocketsServer(81);

int ledPin = 2; // GPIO pin connected to the Built-in LED
bool isLEDOn = false;

unsigned long lastUpdateTime = 0;
float totalEnergy = 0.0; // Total energy consumption in Wh

void handleWebSocket() {
  webSocket.loop();

  // VOLTAGE SENSOR (ZMPT101B) SIGNAL
  int voltageValueADC = analogRead(voltagePin);
  float voltage = voltageValueADC * (3.3 / 4095); // Assuming ESP32 ADC is set to 12-bit resolution

  static unsigned long voltageLastSendTime = 0;
  if (millis() - voltageLastSendTime > 1000) {
    voltageLastSendTime = millis();
    String message = "Voltage: " + String(voltage);
    webSocket.broadcastTXT(message.c_str());
  }
  
  // CURRENT SENSOR (SCT-013) SIGNAL
  int currentValueADC = analogRead(currentPin);

  static unsigned long currentLastSendTime = 0;
  if (millis() - currentLastSendTime > 1000) {
    currentLastSendTime = millis();
    String message = "Current: " + String(currentValueADC);
    webSocket.broadcastTXT(message.c_str());
  }

  // Calculating Energy Consumption (Wh)
  if (isLEDOn) {
    // Calculate power for each sensor
    float power = voltage * (currentValueADC / 4095.0);

    // Calculate energy consumption (Wh)
    unsigned long currentTime = millis();
    float deltaTime = (currentTime - lastUpdateTime) / 1000.0; // Convert to seconds
    float energy = power * deltaTime / 3600.0; // Convert to Wh

    totalEnergy += energy;
    lastUpdateTime = currentTime;

    // Send energy consumption to clients
    String message = "Energy: " + String(totalEnergy) + " Wh";
    webSocket.broadcastTXT(message.c_str());

    // Send energy consumption in kilowatt-hours (kWh) to clients
    float totalEnergyKWh = totalEnergy / 1000.0; // Convert Wh to kWh
    String messageKWh = "Energy (kWh): " + String(totalEnergyKWh) + " kWh";
    webSocket.broadcastTXT(messageKWh.c_str());
  }
}

void sendToClient(const char *message) {
  webSocket.broadcastTXT(message);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_TEXT:
      if (strcmp((char *)payload, "on") == 0) {
        Serial.write('1');
        isLEDOn = true;
        Serial.print("isLEDOn: ");
        Serial.println(isLEDOn);
        sendToClient("Power Turned ON");
        digitalWrite(ledPin, HIGH);
      } else if (strcmp((char *)payload, "off") == 0) {
        Serial.write('0');
        isLEDOn = false;
        Serial.print("isLEDOn: ");
        Serial.println(isLEDOn);
        sendToClient("Power Turned OFF");
        digitalWrite(ledPin, LOW);
      } else if (strcmp((char *)payload, "reset") == 0) {
        totalEnergy = 0.0;
      }

      break;
    default:
    break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi Successfully Connected");

  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  handleWebSocket();
}