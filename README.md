# 🗳️ Election Assistant

A conversational, rule-based AI assistant designed to guide users through the Indian election process, voter eligibility, registration, and voting day steps.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

## 🚀 Overview

Election Assistant is a smart-feeling, personalized guide built without expensive AI APIs. It uses a custom intent-detection engine and a state-based conversation flow to provide accurate, step-by-step information based on official Election Commission of India (ECI) guidelines.

### ✨ Key Features
- **Smart Eligibility Checker**: Personalized results based on age and citizenship.
- **Voter Registration Guide**: 10-step interactive guide for new voters.
- **State-wise Timelines**: Upcoming election dates for major Indian states.
- **Voting Day Assistant**: Step-by-step instructions for a smooth polling experience.
- **AI Simulation**: Realistic typing delays, message chunking, and varied responses for a "human" feel.
- **Mobile-First Design**: Clean, dark-mode interface with glassmorphism aesthetics.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vanilla CSS (Design System), Vite.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Communication**: REST API with session-based context memory.

## ⚙️ Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/election-assistant.git
   cd election-assistant
   ```

2. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   PORT=5000
   ```

4. **Seed the Database**:
   ```bash
   npm run seed
   ```

5. **Run the Application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🌐 Deployment

This project is optimized for "Single-Host" deployment on platforms like **Render**, **Railway**, or **Vercel**.

1. **Build**: `npm run build` (Builds the React frontend into static files).
2. **Start**: `npm start` (Runs the Express server which serves the API and the static frontend).

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Disclaimer: Data is sourced from official ECI guidelines. For official information, please visit [eci.gov.in](https://eci.gov.in).*
