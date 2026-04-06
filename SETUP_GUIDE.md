# Beginner's Setup Guide: Running CrushIt Locally

This guide provides step-by-step instructions to pull the CrushIt application down to your local machine and run it from scratch using Visual Studio Code (VS Code).

---

## 1. Prerequisites

Before starting, ensure your system has the following core tools installed:

1. **Node.js**: You need **Node 18** or higher.
   * *Check:* Open your terminal and run `node -v` to see if it's installed.
   * *Install:* Download from [nodejs.org](https://nodejs.org/).
2. **VS Code**: A modern code editor.
   * *Install:* Download from [code.visualstudio.com](https://code.visualstudio.com/).
3. **Firebase CLI**: Google's command-line tool for running the backend locally.
   * *Install:* Open your terminal and run the command: `npm install -g firebase-tools`

---

## 2. Setup Steps

1. **Download the Project**
   * Download the project folder (or clone from GitHub if connected).
2. **Open in VS Code**
   * Open VS Code, select **File > Open Folder**, and choose the `CrushIt` root directory.
3. **Open the Integrated Terminal**
   * In VS Code, go to **Terminal > New Terminal** (or use the shortcut `` Ctrl + ` ``).
4. **Install Dependencies**
   * You need to install packages for both the frontend (React) and backend (Firebase Functions).
   * **Frontend:** Run `npm install` in the current `CrushIt` root folder.
   * **Backend:** Navigate to the functions folder and install its dependencies:
     ```bash
     cd functions
     npm install
     cd ..
     ```
     *(The `cd ..` brings you back to the root folder).*

---

## 3. Firebase Setup

You must connect the local project to your actual Firebase account to get access to auth and database services.

1. **Login to Firebase (Manual Terminal Step)**
   * Run: `firebase login`
   * This will open your web browser. Log in with your Google account.
2. **Select Your Project (Manual Terminal Step)**
   * Run: `firebase use YOUR_PROJECT_ID`
   * *(Replace `YOUR_PROJECT_ID` with the actual project ID shown in your Firebase Console settings. For this project, it is currently `crushit`)*.
3. **Environment Variables**
   * Inside the `functions/` folder, create a new file named `.env`.
   * Add your email credentials and Resend API key inside:
     ```env
     RESEND_API_KEY="your-resend-api-key"
     EMAIL_USER="your-email@gmail.com"
     EMAIL_PASS="your-app-password"
     ```

---

## 4. Running Locally

We will use two separate terminal windows inside VS Code to run the frontend and backend simultaneously.

**Terminal 1: Start the Firebase Backend Emulators**
1. Ensure you are in the root `CrushIt` folder.
2. Run: `firebase emulators:start --only auth,firestore,functions`
3. Wait until you see the green text confirming the emulators are running (usually on ports `9099`, `8080`, and `5001`). **Keep this terminal open.**

**Terminal 2: Start the Frontend React Server**
1. Open a **second terminal** in VS Code (click the '+' icon in the terminal panel).
2. Ensure you are in the root `CrushIt` folder.
3. Run: `npm run dev`
4. The terminal will give you a local URL (e.g., `http://localhost:5173/`). `Ctrl+Click` (or `Cmd+Click` on Mac) to open it in your browser.

---

## 5. Verify Setup

To ensure everything is connected properly, check the following:
1. **App Loads:** The auth screen should appear beautifully in your browser.
2. **Backend Connected:** Open your console (Right Click -> Inspect -> Console). You should see `[App] Initialized by...` and NO red Firebase networking errors.
3. **Functions Running:** Back in **Terminal 1**, you should see logs stating background sweeps have started initializing.
4. **Firebase UI:** Go to `http://127.0.0.1:4000/` in your browser. This is the local Firebase Emulator UI where you can actively watch users and tasks being created in your database.

---

## 6. Common Errors & Fixes

* **Emulator Connection Refused / Auth Mismatch**
  * *Fix:* The frontend is looking for the wrong port. Check `src/firebase.js`. Ensure `connectAuthEmulator` matches the port printed in your emulator terminal (usually `9099`). Also ensure `.firebaserc` project ID strictly matches your frontend firebase config.
* **Firebase Login Failing / Forbidden**
  * *Fix:* Your CLI login session expired. Run `firebase logout` and then `firebase login` again.
* **Module Not Found Error**
  * *Fix:* You forgot an `npm install`. Turn off the servers (`Ctrl + C`), run `npm install` in root, then `cd functions` -> `npm install`, then start servers again.
* **Emails Not Sending (Resend API)**
  * *Fix:* Resend's free tier only sends to verified domains. During testing, ensure the recipient email matches the verified email used to register the Resend account.

---

## 7. Final Working Flow

Here is how you actually test the application from start to finish:
1. **Signup:** Click "Create your workspace" on the login screen. Input a test email/password and select your Tone Persona.
2. **Dashboard Load:** You should seamlessly transition to the dashboard, and a user document should appear in the Emulator UI on your other tab.
3. **Task Creation:** Click "Add Mission". Set a deadline for *30 minutes from now*. Watch the task appear instantly on the board.
4. **Test Reminders:** Normally cron jobs handle this, but you can force-trigger it. In your terminal or browser, hit the emulator function endpoint (e.g., `http://127.0.0.1:5001/crushit/us-central1/checkReminders`). Check your inbox—you should receive an AI-toned HTML email alerting you of the impending deadline!
