#!/usr/bin/env python3
"""
FreshGuard IoT - Raspberry Pi 3 Model B Sensor Daemon
------------------------------------------------------
Interfaces:
  - DHT-11 (GPIO 4): Temperature & Relative Humidity
  - MQ-135 via ADS1115 (I2C 0x48 Channel A0): Air Quality & VOC Spoilage Gases
  - DS3231 RTC (I2C 0x68): Hardware Real-Time Clock
  - LCD 1602A via PCF8574 (I2C 0x27): Real-time Local Status Display
  - Reed Switch (GPIO 17 with pull-up): Refrigerator Door Sensor
  - Tri-Color LEDs (GPIO 27 Green, GPIO 22 Yellow, GPIO 23 Red)
  - RC522 (SPI): RFID Container Identification

Pushes telemetry directly to Next.js API endpoint: /api/sensors
"""

import time
import json
import requests

NEXTJS_API_URL = "http://localhost:3000/api/sensors"

def read_dht11():
    """Simulated or Adafruit_DHT reading for GPIO 4"""
    # Replace with Adafruit_DHT.read_retry(Adafruit_DHT.DHT11, 4) on physical Pi
    return 3.8, 68.0

def read_ads1115_mq135():
    """Reads ADS1115 Channel A0 (16-bit) for MQ-135 Gas Sensor"""
    # Replace with smbus or adafruit_ads1x15 reading
    raw_counts = 1420
    voltage = (raw_counts / 32767.0) * 4.096
    return raw_counts, voltage

def read_reed_switch():
    """Reads GPIO 17 (0 = Magnet present/Closed, 1 = Open)"""
    return False

def push_telemetry(temp, hum, gas_raw, gas_voltage, door_open):
    payload = {
        "temperature": temp,
        "humidity": hum,
        "gasRaw": gas_raw,
        "gasVoltage": round(gas_voltage, 3),
        "doorOpen": door_open,
        "dht11Healthy": True,
        "ads1115Healthy": True,
        "mq135Healthy": True,
        "reedSwitchHealthy": True,
    }
    try:
        res = requests.post(NEXTJS_API_URL, json=payload, timeout=2.0)
        print(f"[{time.strftime('%X')}] Synced to FreshGuard Dashboard: {res.status_code}")
    except Exception as e:
        print(f"Dashboard sync error: {e}")

if __name__ == "__main__":
    print("FreshGuard Raspberry Pi 3B Daemon Started...")
    while True:
        try:
            t, h = read_dht11()
            raw, v = read_ads1115_mq135()
            door = read_reed_switch()
            push_telemetry(t, h, raw, v, door)
            time.sleep(3)
        except KeyboardInterrupt:
            print("\nDaemon terminated.")
            break
