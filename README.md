<h1 align="center">Tugas Besar - II3240 Rekayasa Sistem dan Teknologi Informasi (HeaLink)</h1>

## Table of Contents
* [General Information](#general-information)
* [How to Run](#how-to-run)
* [Contributors](#contributors)

## General Information
**HeaLink** is an integrated emergency healthcare monitoring system designed to improve real-time patient data collection and communication between medical staff, ambulances, and hospitals. Using IoT sensors connected to ESP devices, cloud processing, and a web dashboard, HeaLink accelerates emergency response and optimizes patient triage and coordination.

## How to Run
Follow these steps to set up and run the HeaLink system!
### 1. Clone the Repository
```
git clone https://github.com/monicaangelah/healink-backend.git
cd healink-backend
```
### 2. Upload Arduino Code & Connect ESP32 Device to WiFi
* Open `healink_v1.ino` in Arduino IDE.
* Upload the code to your ESP32 device.
* Ensure the ESP32 device connects to your WiFi network.
### 3. Connect to the MQTT Broker
Use an MQTT client (e.g. MQTT Explorer) and connect to the broker with these settings:
* Host: `reksti.profybandung.cloud`
* Port: `1883`
* Protocol: `mqtt://`
* No username/password or encryption required

This connection allows real-time communication between IoT devices, backend, and dashboard.
### 4. Run the Backend Server
Start the Node.js backend server by running:
```
node index.js
```
### 5. Start the Frontend Server (PWA)
Navigate to the `pwa-deploy` directory and start the PWA server:
```
cd pwa-deploy
http-server -c-1
```
The -c-1 option disables caching to always serve fresh content.
### 6. Access the Web Dashboard
Open the following URLs in your browser to use the system:
* Backend API: 
```
https://healink-backend-production.up.railway.app/
```
* Frontend Dashboard: 
```
https://healink-reksti.netlify.app/
```

## Contributors
### Kelompok 7 - HeaLink

| NIM      | Nama                      |
|----------|---------------------------|
| 18222026 | Tamara Mayranda Lubis     |
| 18222034 | Christoper Daniel         |
| 18222074 | Kayla Dyara               |
| 18222078 | Monica Angela Hartono     |
| 18222094 | Yovanka Sandrina Maharaja |
