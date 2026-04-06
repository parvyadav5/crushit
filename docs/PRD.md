# Product Requirement Document (PRD)

## Project Name
**CrushIt**

## Goal
To build a **hardcore, no-excuses task tracking web application** that forces users to complete their tasks through aggressive reminders, social pressure, and strict deadlines.

## Core Philosophy
"Discipline over Motivation." The app does not coddle the user. It demands action.

## Target Audience
- Procrastinators who need external pressure.
- Students and professionals with strict deadlines.
- Users who respond well to "tough love" and high-stakes environments.

## Key Features

### 1. Task Management
- **Add Tasks**: Simple input for Title, Deadline (Date & Time), and Priority (High, Medium, Normal).
- **Task List**: Clear view of pending and completed tasks.
- **Strict Deadlines**: Once a deadline is set, the pressure begins.

### 2. Aggressive Reminder System
- **7-Day Warning**: Gentle nudge 7 days before deadline.
- **Daily Reminders**: Sent daily when deadline is 5-6 days away.
- **Urgent Mode (≤ 4 Days)**:
  - **Frequency**: Every 2 hours.
  - **Channels**: Email AND Push Notifications.
  - **Content**: Gender-based motivational insults/tough love.
- **Anti-Spam**:
  - Max 6 reminders per day per task.
  - Quiet Hours (11 PM - 7 AM) enforced.

### 3. User Accounts
- **Authentication**: Google Sign-In (via Firebase Auth).
- **Profile**: Stores Display Name, Gender (Male/Female), and Email.
- **Gender-Based Content**: "King/Warrior" messages for males, "Queen/Slayer" messages for females.

### 4. Technical Architecture (Free Tier Optimized)
- **Frontend**: Hosted on **Firebase Hosting**.
- **Database**: **Firebase Firestore** for real-time data.
- **Backend**: **Node.js Express** app hosted on **Render (Free Tier)**.
- **Scheduler**: External triggers via **cron-job.org** (Every 2 hours + Keep-Alive).
- **Cost**: **$0/month** (Fully Free Architecture).

## User Flows
1. **Onboarding**: User signs in, sets gender, permits notifications.
2. **Task Creation**: User adds "Finish Project", sets deadline for Friday.
3. **The Grind**:
   - Day 7: "Heads up."
   - Day 4: "Get to work."
   - Day 1: "DO IT NOW OR FAIL." (Every 2 hours).
4. **Completion**: User checks off task -> Endorphin rush -> Reminders stop.

## Success Metrics
- **Task Completion Rate**: Higher % of tasks finished on time.
- **Engagement**: Daily active users checking their list.
- **Latency**: Backend wakes up and processes reminders within 60s.
