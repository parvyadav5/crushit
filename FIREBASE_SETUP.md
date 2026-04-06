# Clean Firebase Setup for CrushIt

This guide gives you a clean Firebase setup with no hardcoded project config in the app.

## 1. Create a New Firebase Project

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project**.
3. Enter a new project name.
4. Wait for the project to finish provisioning.

## 2. Register a Web App

1. Inside the Firebase project, click **Add app** and choose **Web**.
2. Give it a name such as `crushit-web`.
3. You do not need Firebase Hosting checked here if you already deploy with the CLI.
4. Copy the Firebase config object that Firebase shows you.

## 3. Add the Config to This Project

1. In the repo root, copy `.env.example` to `.env`.
2. Replace every placeholder with the values from your Firebase web app config.

Use this format:

```env
VITE_FIREBASE_API_KEY="your-web-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
VITE_USE_FIREBASE_EMULATORS="false"
```

Notes:

- `src/firebase.js` now requires these env vars and will stop immediately if they are missing.
- `public/firebase-messaging-sw.js` is auto-generated before `npm run dev` and `npm run build`.
- If your Firebase project does not use Analytics, you can leave `VITE_FIREBASE_MEASUREMENT_ID` blank.

## 4. Enable Firebase Authentication

Go to **Firebase Console > Build > Authentication > Sign-in method** and enable:

1. **Email/Password**
2. **Google**

For Google sign-in:

1. Set the public app name and support email.
2. Under **Authentication > Settings > Authorized domains**, make sure these are allowed:
   - `localhost`
   - your Firebase Hosting domain such as `your-project-id.web.app`
   - any custom domain you plan to use

## 5. Create Firestore Database

1. Go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose **Production mode**.
4. Pick a region close to your users.

Why production mode:

- You already have a real `firestore.rules` file in this repo.
- Starting in production mode avoids the temporary open-access test rules.

## 6. Use the New Firestore Rules

The file [firestore.rules](/Users/parvyadav/Desktop/CrushIt/firestore.rules) is already set up for this app.

What these rules do:

1. `users/{userId}`
   - A signed-in user can read only their own profile.
   - They can create only their own profile document.
   - They cannot change the profile email to another value.
   - `displayName`, `gender`, reminder toggles, quiet hours, and tone are validated.

2. `users/{userId}/tokens/{tokenId}`
   - A user can read, write, and delete only their own push-token docs.
   - The token must be a non-empty string.
   - `createdAt` is locked after creation.

3. `tasks/{taskId}`
   - A user can read and delete only their own tasks.
   - A task must belong to the signed-in user.
   - The rule validates `title`, `priority`, `category`, `focusMinutes`, `deadline`, and completion fields.
   - Reminder fields written by Cloud Functions are protected from direct client edits.

Why this is safer than the old rules:

- It validates field shapes instead of checking ownership only.
- It prevents client-side tampering with reminder metadata such as `notified7day` and `lastReminderSent`.
- It keeps `createdAt` and email fields stable after the first write.

## 7. Link the Firebase CLI to the New Project

Run these commands in the repo root:

```bash
firebase login
firebase use --add
```

Choose your new project and set it as the default for this repo.

If you want, you can also manually update [.firebaserc](/Users/parvyadav/Desktop/CrushIt/.firebaserc) so `"default"` matches your new Firebase project ID.

## 8. Deploy the Rules

After the project is linked, deploy only the Firestore rules:

```bash
firebase deploy --only firestore:rules
```

## 9. Prepare for Vercel Deployment

This project can use Firebase Auth, Firestore, and Functions while the frontend itself is deployed on Vercel.

Important:

- You do not need Firebase Hosting if you deploy the frontend to Vercel.
- You still keep Firebase for Auth, Firestore, Messaging, and optionally Functions.
- [vercel.json](/Users/parvyadav/Desktop/CrushIt/vercel.json) is included so React Router deep links like `/tasks` and `/settings` work on Vercel.

### Add environment variables in Vercel

In your Vercel project settings, add these same variables:

```env
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_USE_FIREBASE_EMULATORS
```

Recommended values:

- `VITE_USE_FIREBASE_EMULATORS=false`
- use the same Firebase project values as your local `.env`

### Vercel build settings

If Vercel does not auto-detect them correctly, use:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Firebase Auth authorized domains for Vercel

In Firebase Console, add your Vercel domains under:

`Authentication > Settings > Authorized domains`

Add:

- `your-project-name.vercel.app`
- your custom production domain if you use one

Without this, Google sign-in may fail on the deployed Vercel site.

### Auto redeploy behavior

If your GitHub repo is connected to Vercel:

- pushes to the production branch usually create a production deployment
- pushes to other branches create preview deployments

That means you should also set your Firebase env vars in both:

- `Production`
- `Preview`

## 10. Run the App Locally

```bash
npm install
npm run dev
```

The app will:

1. Load Firebase config from `.env`
2. Generate `public/firebase-messaging-sw.js`
3. Start Vite

If you want Firebase emulators locally:

```env
VITE_USE_FIREBASE_EMULATORS="true"
```

Then run:

```bash
firebase emulators:start --only auth,firestore,functions
```

## 11. Recommended Verification Checklist

1. Open the app and create a new account with email/password.
2. Confirm a document appears in `users/{uid}`.
3. Create a task and confirm it appears in `tasks`.
4. Toggle a task complete and confirm `completed` and `completedAt` update.
5. Sign in with Google and confirm the same profile flow works.
6. Try opening another user's task document manually in Firestore. The rules should deny it.

## 12. Common Setup Mistakes

1. Missing `.env`
   - Fix: copy `.env.example` to `.env`.

2. Google sign-in popup closes or says unauthorized domain
   - Fix: add your domain under **Authentication > Settings > Authorized domains**.

3. Firestore writes fail with permission errors
   - Fix: deploy [firestore.rules](/Users/parvyadav/Desktop/CrushIt/firestore.rules) to the same Firebase project used in `.env`.

4. App still points to an old project
   - Fix: check `.env`, `.firebaserc`, and the active CLI project from `firebase use`.

5. Vercel deployment works but direct links return 404
   - Fix: keep [vercel.json](/Users/parvyadav/Desktop/CrushIt/vercel.json) in the repo so SPA rewrites send requests to `index.html`.

6. Vercel app loads but Firebase auth popup fails
   - Fix: add the Vercel domain in Firebase Auth authorized domains.
