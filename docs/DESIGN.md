# Design Document - CrushIt

## 1. System Architecture (Hybrid & Free)

The system uses a **Hybrid Cloud Architecture** to maximize free tier capabilities across providers.

### High-Level Diagram
```mermaid
graph TD
    User[User (Browser/PWA)] <-->|Hosting & Auth| Firebase[Firebase Hosting + Auth]
    User <-->|Read/Write Data| Firestore[Firestore Database]
    User <--|Push Notifications| FCM[Firebase Cloud Messaging]
    
    Cron[cron-job.org] -->|Every 2 Hours| Render[Render Backend (Node.js)]
    Cron2[cron-job.org (Keep-Alive)] -->|Every 14 Mins| Render
    
    Render -->|Query Tasks| Firestore
    Render -->|Send Email| Gmail[Gmail SMTP]
    Render -->|Send Push| FCM
```

## 2. Component Design

### A. Frontend (Firebase Hosting)
- **Tech**: HTML5, Vanilla JS, CSS3.
- **Hosting**: Served globally via Firebase CDN.
- **Logic**:
  - Direct Firestore connection for Task CRUD.
  - Firebase Auth for user management.
  - Service Worker for PWA & FCM Token handling.

### B. Backend (Render Web Service)
- **Tech**: Node.js (Express).
- **Execution**:
  - Stateless Web Service.
  - Sleeps after 15 mins of inactivity (Free Tier limitation).
  - Woken up by external pings.
- **Endpoints**:
  - `GET /run-reminder?key=SECRET`: Triggers the reminder logic.
  - `GET /`: Health check for Keep-Alive.
- **Security**:
  - Protected by `CRON_SECRET` query parameter.
  - Uses `firebase-admin` service account for DB access.

### C. Database (Firestore)
- **Collections**:
  - `users`: `{ uid, email, gender, photoURL }`
  - `users/{uid}/tokens`: `{ token, lastUpdated }` (FCM Tokens)
  - `tasks`: `{ title, deadline, priority, completed, userId, lastReminderSent }`
- **Security Rules**: Strict `request.auth.uid == resource.data.userId`.

## 3. Reminder Logic Flow

1. **Trigger**: Cron job hits `/run-reminder`.
2. **Fetch**: Query active tasks from Firestore.
3. **Filter**:
   - Is it Quiet Hours (11 PM - 7 AM IST)? -> Skip.
   - Is deadline passed? -> Skip.
   - Is task completed? -> Skip.
4. **Process**:
   - **Daily (9-11 AM)**: Send for 5-7 days left.
   - **Urgent (Every run)**: Send for ≤ 4 days left.
5. **Anti-Spam**:
   - Check `lastReminderSent` timestamp.
   - Check `remindersSentToday` count (Max 6).
6. **Action**:
   - Send Email (Nodemailer).
   - Send Push (FCM).
   - Update `lastReminderSent` in Firestore.

## 4. UI/UX Design
- **Theme**: Dark Mode (Black/Grey with Neon Accents).
- **Typography**: 'Inter' or 'Roboto' (Clean, Modern).
- **Interactions**:
  - Swipe to complete (Mobile).
  - Modal for detailed settings.
  - Smooth transitions for list updates.
