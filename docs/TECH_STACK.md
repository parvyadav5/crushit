# Technology Stack

## Overview
**CrushIt** is built on a **Zero-Cost, High-Performance Hybrid Stack**. It leverages the best free tiers from multiple cloud providers.

## 1. Frontend
- **Language**: HTML5, CSS3, JavaScript (Vanilla ES6+).
- **Framework**: None (Lightweight & Fast).
- **PWA**: Fully supported (Manifest + Service Workers).
- **Hosting**: **Firebase Hosting** (Spark Plan).

## 2. Backend & Compute
- **Runtime**: **Node.js** (v18+).
- **Framework**: **Express.js**.
- **Platform**: **Render** (Free Web Service).
- **Email**: **Nodemailer** (via Gmail SMTP).
- **Functionality**:
  - REST API Architecture.
  - Stateless execution.
  - Keep-Alive mechanism support.

## 3. Database & Storage
- **Database**: **Google Cloud Firestore** (NoSQL).
- **Authentication**: **Firebase Auth** (Google & Email).
- **Push Notifications**: **Firebase Cloud Messaging (FCM)**.

## 4. Automation & DevOps
- **Scheduler**: **cron-job.org** (External Service).
  - Job 1: Reminders (Every 2 Hours).
  - Job 2: Keep-Alive (Every 14 Mins).
- **Version Control**: GitHub.
- **CI/CD**: Render Auto-Deploy (connects to GitHub `main` branch).

## 5. Security
- **Endpoints**: Protected by API Key / Secret Query Param.
- **Database**: Firestore Security Rules (User Isolation).
- **Environment**: Secrets managed via Render Environment Variables (`.env`).

## 6. Key Libraries
- `firebase-admin`: Server-side Firebase access.
- `firebase`: Client-side SDK.
- `moment-timezone`: Date/Time handling.
- `nodemailer`: Email delivery.
- `dotenv`: Configuration management.
