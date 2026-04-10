# ThingSpeak IoT Integration for SIREP OASIS NEXUS

This document provides the technical guidelines for real-time monitoring of the **WEFEH Nexus** (Water, Energy, Food, Ecosystem, Health) using the **ThingSpeak** platform.

## 🚀 Overview
We use ThingSpeak to aggregate sensor data from smart oases, allowing for:
- **Real-time visualization** of soil, energy, crop, and environmental metrics.
- **MATLAB-based analysis** for predictive maintenance and crop yield optimization.
- **Alert systems** for water scarcity, energy fluctuations, or crop anomalies.
- **AI-assisted anomaly detection** using edge-computed confidence scores.

## 🛠 Prerequisites
1. **Hardware**: ESP32 with WiFi (recommended) or Arduino with WiFi/GSM shield.
2. **Sensors**:
   - Capacitive soil moisture sensor (e.g., CAPACITIVE-v1.2)
   - INA219 or ACS712 current/voltage sensor for solar panel output
   - HC-SR04 ultrasonic sensor or IR distance sensor for crop height
   - DHT22 or SHT31 for ambient temperature and humidity
3. **Library**: [ThingSpeak-Arduino](https://github.com/mathworks/thingspeak-arduino) v2.0.0+.
4. **Connectivity**: SSL/TLS enabled for secure data transmission.

## 📡 Channel Configuration
Create a private channel with the following field mapping:
| Field | Parameter | Metric | Nexus Pillar |
|-------|-----------|--------|--------------|
| Field 1 | Soil Moisture | % | Water |
| Field 2 | Solar Output | W | Energy |
| Field 3 | Crop Height | cm | Food |
| Field 4 | Ambient Temp | °C | Ecosystem |
| Field 5 | Humidity | % | Ecosystem |
| Field 6 | AI Anomaly Score | 0–100 | Analytics |

## 🔒 Security (secrets.h)
Never commit your API keys. Use a `secrets.h` file:
```cpp
#define SECRET_SSID "Your_WiFi_SSID"
#define SECRET_PASS "Your_WiFi_Password"
#define SECRET_CH_ID 0000000
#define SECRET_WRITE_APIKEY "YOUR_WRITE_API_KEY"
```

## 📝 Full Firmware Implementation (ESP32 – WEFEH v2.0)

```cpp
/*
 * SIREP OASIS NEXUS TECH DZ – IoT Agriculture Firmware v2.0
 * WEFEH Sensor Gateway: Water, Energy, Food, Ecosystem, Health
 * Target: ESP32 (WiFi)
 * Patent: INAPI N° 5893/2025
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "ThingSpeak.h"
#include "DHT.h"
#include "secrets.h"

// ── Pin definitions ──────────────────────────────────────────
#define PIN_SOIL_MOISTURE  34   // ADC1 – capacitive soil sensor
#define PIN_SOLAR_VOLTAGE  35   // ADC1 – voltage divider from solar panel
#define PIN_SOLAR_CURRENT  32   // ADC1 – ACS712 current sensor output
#define PIN_ULTRASONIC_TRIG 25  // Ultrasonic TRIG (crop height)
#define PIN_ULTRASONIC_ECHO 26  // Ultrasonic ECHO (crop height)
#define PIN_DHT            27   // DHT22 data pin
#define DHT_TYPE           DHT22

// ── Calibration constants ────────────────────────────────────
// Soil moisture: raw ADC values at 0 % (dry) and 100 % (wet)
static const int SOIL_DRY_RAW  = 3200;
static const int SOIL_WET_RAW  = 1100;

// Solar voltage divider: (R1+R2)/R2 ratio (e.g. 47kΩ / 10kΩ)
static const float VOLTAGE_DIVIDER = 5.7f;
static const float ADC_REF_V       = 3.3f;
static const int   ADC_RESOLUTION  = 4095;

// ACS712-20A: sensitivity 100 mV/A, midpoint at Vcc/2
static const float ACS712_SENSITIVITY = 0.100f; // V per A
static const float ACS712_MIDPOINT    = 1.65f;  // V at 0 A

// Crop height: distance from sensor to pot rim at planting (cm)
static const float CROP_REF_HEIGHT_CM = 30.0f;

// Update interval
static const unsigned long UPDATE_INTERVAL_MS = 20000UL; // 20 s

// ── Globals ──────────────────────────────────────────────────
WiFiClientSecure client;
DHT dht(PIN_DHT, DHT_TYPE);

static float gPrevSoil    = 50.0f;
static float gPrevPower   = 0.0f;
static float gPrevHeight  = 0.0f;
static unsigned long gLastSendMs = 0;

// ── Sensor helpers ───────────────────────────────────────────

float readSoilMoisture() {
    int raw = analogRead(PIN_SOIL_MOISTURE);
    float pct = 100.0f * (1.0f - (float)(raw - SOIL_WET_RAW) /
                                  (float)(SOIL_DRY_RAW - SOIL_WET_RAW));
    pct = constrain(pct, 0.0f, 100.0f);
    // Simple exponential smoothing (α = 0.3)
    gPrevSoil = 0.3f * pct + 0.7f * gPrevSoil;
    return gPrevSoil;
}

float readSolarOutputW() {
    float vRaw = (analogRead(PIN_SOLAR_VOLTAGE) / (float)ADC_RESOLUTION) * ADC_REF_V;
    float voltage = vRaw * VOLTAGE_DIVIDER;

    float iRaw = (analogRead(PIN_SOLAR_CURRENT) / (float)ADC_RESOLUTION) * ADC_REF_V;
    float current = (iRaw - ACS712_MIDPOINT) / ACS712_SENSITIVITY;
    current = max(0.0f, current);

    float power = voltage * current;
    gPrevPower = 0.3f * power + 0.7f * gPrevPower;
    return gPrevPower;
}

float readCropHeightCm() {
    // Trigger pulse
    digitalWrite(PIN_ULTRASONIC_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(PIN_ULTRASONIC_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(PIN_ULTRASONIC_TRIG, LOW);

    long duration = pulseIn(PIN_ULTRASONIC_ECHO, HIGH, 30000UL);
    if (duration == 0) return gPrevHeight; // timeout – return last good value

    float distanceCm = duration * 0.0343f / 2.0f;
    float heightCm   = max(0.0f, CROP_REF_HEIGHT_CM - distanceCm);
    gPrevHeight = 0.3f * heightCm + 0.7f * gPrevHeight;
    return gPrevHeight;
}

// ── AI anomaly score (edge heuristic) ───────────────────────
// Returns 0 (normal) to 100 (critical anomaly).
// powerW: individual panel/array output in Watts (sensor-measured).
// The dashboard frontend mirrors this logic scaled to CSP kW output.
float computeAnomalyScore(float soil, float powerW, float tempC, float hum) {
    float score = 0.0f;

    // Soil moisture out of optimal range (30–70 %)
    if (soil < 30.0f) score += (30.0f - soil) * 1.2f;
    if (soil > 70.0f) score += (soil - 70.0f) * 0.8f;

    // Solar output unexpectedly low — simplified heuristic; does not check time of day.
    // Treat any reading below 10 W as a potential panel fault or night-time condition.
    if (powerW < 10.0f) score += 15.0f;

    // Temperature extreme for Saharan agri context
    if (tempC > 45.0f) score += (tempC - 45.0f) * 2.0f;
    if (tempC < 5.0f)  score += (5.0f - tempC)  * 3.0f;

    // Humidity extremes
    if (hum < 20.0f) score += (20.0f - hum) * 0.5f;
    if (hum > 90.0f) score += (hum - 90.0f) * 0.5f;

    return constrain(score, 0.0f, 100.0f);
}

// ── WiFi helpers ─────────────────────────────────────────────
void ensureWiFi() {
    if (WiFi.status() == WL_CONNECTED) return;

    Serial.print(F("Connecting to WiFi"));
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    unsigned long t0 = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000UL) {
        delay(500);
        Serial.print('.');
    }
    Serial.println(WiFi.status() == WL_CONNECTED ? F(" OK") : F(" FAILED"));
}

// ── Setup ────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println(F("SIREP OASIS NEXUS – Firmware v2.0 boot"));

    pinMode(PIN_ULTRASONIC_TRIG, OUTPUT);
    pinMode(PIN_ULTRASONIC_ECHO, INPUT);

    dht.begin();
    analogReadResolution(12);

    client.setInsecure(); // Use certificate pinning in production
    WiFi.mode(WIFI_STA);
    ThingSpeak.begin(client);

    ensureWiFi();
    Serial.println(F("Setup complete."));
}

// ── Main loop ────────────────────────────────────────────────
void loop() {
    unsigned long now = millis();
    if (now - gLastSendMs < UPDATE_INTERVAL_MS) return;
    gLastSendMs = now;

    ensureWiFi();

    // Read all sensors
    float soil    = readSoilMoisture();
    float powerW  = readSolarOutputW();
    float heightCm = readCropHeightCm();
    float tempC   = dht.readTemperature();
    float hum     = dht.readHumidity();

    // Validate DHT reading
    if (isnan(tempC) || isnan(hum)) {
        Serial.println(F("DHT read error – skipping cycle"));
        return;
    }

    float anomaly = computeAnomalyScore(soil, powerW, tempC, hum);

    // Serial diagnostics
    Serial.printf("Soil: %.1f%%  Power: %.1fW  Height: %.1fcm"
                  "  Temp: %.1f°C  Hum: %.1f%%  Anomaly: %.1f\n",
                  soil, powerW, heightCm, tempC, hum, anomaly);

    // Push to ThingSpeak (all fields in one call = 1 API hit)
    ThingSpeak.setField(1, soil);
    ThingSpeak.setField(2, powerW);
    ThingSpeak.setField(3, heightCm);
    ThingSpeak.setField(4, tempC);
    ThingSpeak.setField(5, hum);
    ThingSpeak.setField(6, anomaly);

    int httpCode = ThingSpeak.writeFields(SECRET_CH_ID, SECRET_WRITE_APIKEY);
    if (httpCode == 200) {
        Serial.println(F("ThingSpeak update OK"));
    } else {
        Serial.printf("ThingSpeak error: %d\n", httpCode);
    }
}
```

## 📊 Analytics & Threshold Reference
| Parameter | Normal Range | Alert Threshold | Action |
|-----------|-------------|-----------------|--------|
| Soil Moisture | 30–70 % | < 20 % or > 85 % | Adjust irrigation |
| Solar Output | > 10 W (daylight) | < 5 W at noon | Inspect panels |
| Crop Height | 0–150 cm | Growth < 0.5 cm/day | Agronomist review |
| Temperature | 10–42 °C | > 45 °C or < 5 °C | Shading/heating |
| Humidity | 20–80 % | < 15 % or > 90 % | Ventilation |
| AI Anomaly Score | 0–20 | > 50 | Immediate inspection |

## ⚖️ Legal & Compliance
Data collected through this IoT system is subject to the project's intellectual property protections (**Patent N° 5893/2025**). For commercial integration, contact the developer.

---
*Powered by SIREP OASIS NEXUS TECH DZ | Tech-Legal Innovation. Firmware v2.0*
