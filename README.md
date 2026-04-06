# CrushIt 🔒

**CrushIt** is a dynamic, high-accountability deadline tracker and reminder system designed to keep you focused. Unlike passive task-managers that let overdue work pile up, CrushIt uses intelligent, continuous background tracking to actively ping you with varying levels of urgency and highly customizable motivational tones.

---

## The Problem

Traditional to-do lists are passive. When a deadline slips, the task simply turns red and sits there, easy to ignore and resulting in compounding procrastination. Users lack an active force that mirrors the pressure of real-world deadlines, holds them accountable, and communicates with them based on their personal productivity style.

## Features

- **Extreme Accountability Pipeline:** Tracks tasks in real-time, highlighting them based on runway length (e.g., *In Runway*, *On Deck*, *Critical*, *Past Due*).
- **Tone-Based Dynamic Emails:** Set your personalized AI tone in the Settings (Friendly, Strict, or Motivational). Your automated email reminders completely adapt their colors, subject lines, and copy to match your working style.
- **Automated Scheduling Hooks:** Native Firebase Cron jobs that poll for impending tasks. Daily digests arrive in the morning, and urgent alerts ping every two hours when a deadline is critically close.
- **Respectful Boundaries:** Real-time timezone and Quiet Hours parsing ensures the system never spams you while you're asleep, unless explicitly permitted.
- **Gamified Momentum:** Visual streaks, focus timers, and a sleek real-time "Pressure Score" natively built into the dashboard metrics to maintain pace.

## Tech Stack

This project uses a fully serverless, lean architecture separating standard frontend state from secure backend schedule actions.

1. **Frontend:** React + Vite, vanilla structured CSS, and minimal contextual state loops.
2. **Backend Services:** Firebase (Auth for identities, Firestore for NoSQL user/task data, Cloud Messaging for push alerts).
3. **Automated Compute:** Firebase Cloud Functions v2 (`onRequest` for HTTP webhook polling, and `onSchedule` for native Google Cloud Scheduler triggers).
4. **Transactional Email:** Resend API Node SDK to deliver beautifully formatted HTML reminder alerts.

## Working Flow

1. **Identity & Preference:** The user authenticates and defines their workflow parameters in their personalized settings pane (quiet hours, notification tones, and avatar identity).
2. **Task Creation:** The user sets a priority, objective, and strict deadline. The dashboard immediately calculates the exact completion percentage and pressure score dynamically.
3. **Background Sync:** The Firebase Cloud Scheduler routinely scans the `tasks` collection. As deadlines approach the 7-day, 24-hour, and sub-12 hour marks, it queries the specific user's `users` document.
4. **Dispatch:** The backend formats a custom payload (using the Resend SDK for email and FCM for push notifications) mapped precisely to the user's selected Tone and dispatches it directly to their devices. 

---

## Setup Steps

For a full clean-project walkthrough, see [FIREBASE_SETUP.md](/Users/parvyadav/Desktop/CrushIt/FIREBASE_SETUP.md).

To run CrushIt locally and securely deploy its automated backend, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- Firebase Account (Project must be on the **Blaze** Pay-as-you-go plan to use Google Cloud Scheduler for background Cron jobs).
- Resend API Key

### 1. Project Initialization
Clone the repository and install the frontend dependencies:
```bash
git clone https://github.com/yourusername/CrushIt.git
cd CrushIt
npm install
```

### 2. Frontend Environment
Create a `.env` file in the root directory and add your Firebase configuration tokens:
```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_domain"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

### 3. Backend Setup
Navigate to the Firebase functions directory.
```bash
cd functions
npm install
```
Securely add your Resend API key to the Firebase environment parameters:
```bash
# Add Resend API credential to Firebase Secret Manager / Config
firebase functions:secrets:set RESEND_API_KEY
```

### 4. Running the App
Spin up the local development frontend:
```bash
# From the root directory:
npm run dev
```

### 5. Deploying the Cloud Backend
Deploy the updated automated cron scheduling and HTTPS rules directly to Google Cloud:
```bash
firebase deploy --only functions
```
