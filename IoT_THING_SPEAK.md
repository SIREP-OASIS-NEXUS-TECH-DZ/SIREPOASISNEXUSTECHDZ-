# ThingSpeak IoT Integration for SIREP OASIS NEXUS

This document provides the technical guidelines for real-time monitoring of the **WEFEH Nexus** (Water, Energy, Food, Ecosystem, Health) using the **ThingSpeak** platform.

## 🚀 Overview
We use ThingSpeak to aggregate sensor data from smart oases, allowing for:
- **Real-time visualization** of soil and energy metrics.
- **MATLAB-based analysis** for predictive maintenance and crop yield optimization.
- **Alert systems** for water scarcity or energy fluctuations.

## 🛠 Prerequisites
1. **Hardware**: ESP32 or Arduino with WiFi/GSM shield.
2. **Library**: [ThingSpeak-Arduino](https://github.com/mathworks/thingspeak-arduino) v2.0.0+.
3. **Connectivity**: SSL enabled for secure data transmission.

## 📡 Channel Configuration
Create a private channel with the following field mapping:
| Field | Parameter | Metric | Nexus Pillar |
|-------|-----------|--------|--------------|
| Field 1 | Soil Moisture | % | Water |
| Field 2 | Solar Voltage | V / W | Energy |
| Field 3 | Crop Height | cm | Food |
| Field 4 | Ambient Temp | °C | Ecosystem |
| Field 5 | Humidity | % | Ecosystem |

## 🔒 Security (secrets.h)
Never commit your API keys. Use a `secrets.h` file:
```cpp
#define SECRET_SSID "Your_WiFi_SSID"
#define SECRET_PASS "Your_WiFi_Password"
#define SECRET_CH_ID 0000000
#define SECRET_WRITE_APIKEY "YOUR_WRITE_API_KEY"
```

## 📝 Sample Implementation (Arduino/ESP32)
```cpp
#include <WiFi.h>
#include "ThingSpeak.h"
#include "secrets.h"

WiFiClient  client;

void setup() {
  WiFi.mode(WIFI_STA);
  ThingSpeak.begin(client); 
}

void loop() {
  // Connect or reconnect to WiFi
  if(WiFi.status() != WL_CONNECTED){
    WiFi.begin(SECRET_SSID, SECRET_PASS);
  }

  // Set the fields
  ThingSpeak.setField(1, getSoilMoisture());
  ThingSpeak.setField(2, getSolarOutput());
  
  // Write to ThingSpeak
  int x = ThingSpeak.writeFields(SECRET_CH_ID, SECRET_WRITE_APIKEY);
  if(x == 200){
    Serial.println("Channel update successful.");
  }
  
  delay(20000); // 20 second update interval
}
```

## ⚖️ Legal & Compliance
Data collected through this IoT system is subject to the project's intellectual property protections (**Patent N° 5893/2025**). For commercial integration, contact the developer.

---
*Powered by SIREP OASIS NEXUS TECH DZ | Tech-Legal Innovation.*
