# Multi-Asset Trading & Analytics Simulator

Educational, internship-grade trading simulation platform built with React, Firebase, and Recharts. This project **does not use real market data**—all prices are randomly generated for learning purposes.

## Features
- Firebase Authentication with email/password.
- Firebase Firestore user profiles with simulated balances.
- Multi-asset market snapshot (equities, crypto, FX, commodities).
- Trend visualization with Recharts.
- Portfolio health and strategy prompts.

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure Firebase
Create a Firebase project, enable Email/Password authentication, and create a Firestore database. Then copy your project credentials into a `.env` file:

```bash
cp .env.example .env
```

Update the values in `.env` with your Firebase configuration.

### 3) Run the app
```bash
npm run dev
```

## Project Structure
```
src/
  components/      UI building blocks
  contexts/        Auth context for Firebase
  styles/          Global CSS
  utils/           Randomized simulator data
  firebase.js      Firebase SDK setup
```

## Notes
- This application is **educational only**. No real market APIs or live trading.
- Data is randomly generated every session to encourage practice and exploration.
