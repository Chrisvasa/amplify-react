# AWS Amplify React+Vite with ESP32 IoT Integration
This project bridges IoT hardware with a cloud-powered web application hosted on **AWS Amplify**, demonstrating real-time data flow from physical sensors to a dynamic frontend. 

An **ESP32 microcontroller** equipped with a **DHT11 sensor** collects temperature and humidity data and sends it via **MQTT** to **AWS IoT Core**. A message rule in IoT Core triggers an **AWS Lambda function**, which processes the data by associating it with an owner before storing it in **Amazon DynamoDB**. The data is then accessed and visualized on a **React+Vite** frontend using **GraphQL APIs** powered by **AWS AppSync**
## Overview
![image](https://github.com/user-attachments/assets/4a073f0f-576a-4549-8416-0aaa1a7d22c2)

## 🌐 Architecture Overview

1. The ESP32 collects temperature and humidity data using the DHT11 sensor.
2. Data is published via MQTT to AWS IoT Core.
3. IoT Core forwards the data to an AWS Lambda function for processing.
4. The Lambda function updates the DynamoDB database in real time.
5. The React frontend fetches and displays this data using AWS AppSync's GraphQL APIs.

## Requirements
### Hardware
- ESP32
- DHT11 sensor
- Cables and wires to connect everything
- Breadboard
- [IoT Firmware Repository](https://github.com/Chrisvasa/esp_aws): ESP32 firmware for sensor data collection and AWS IoT integration.
### Software
- AWS
  - IoT Core
  - DynamoDB
  - Lambda
  - Amplify
- Node.js
- PlatformIO (For the ESP32)


## 🛠️ Usage
Clone the repository.
```bash
git clone https://github.com/Chrisvasa/amplify-react.git
```
### Frontend
1. Navigate to the `src/` directory and install dependencies:
```bash
   cd src
   npm install
   npm run dev
```
2. Modify the `App.tsx` and `App.css` files to customize your UI. 
### Backend
1. Navigate to the `amplify/` directory for backend setup:
```bash
    cd amplify
```
2. Deploy backend resources:
```bash
    amplify init
    amplify push
```
3. Functions
- The Lambda function logic resides in the `functions/` subfolder. Modify files such as `handler.ts` to customize the data processing logic.
4. Resources
  - IoT and authentication configurations are managed in the `auth/` folder. Use the provided `resources.ts` file for detailed configuration.
### AWS IoT Core Setup
1. Ensure that the ESP32 device is configured with MQTT and the required IoT Core certificates.
2. Publish sensor data to the MQTT topic defined in the `resource.ts` configuration.

### Running the Application
After setting up both the frontend and backend:
1. Access the web application via the development server or the deployed AWS Amplify hosting.
2. Monitor the real-time data updates from the ESP32 sensors on the frontend.

## 📝 License

This project is licensed under the [MIT-0 License](LICENSE).

## 🤝 Contributing

Contributions are welcome! See the [CONTRIBUTING](CONTRIBUTING.md) guide for more information.
