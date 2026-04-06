# Project Report: CrushIt

**Name:** Parv Yadav  
**Regno:** 24BCI0231  
**Course code:** [Insert Course Code Here]  
**Course Title:** [Insert Course Title Here]  
**Slot:** [Insert Slot Here]  

---

## 1. Given Problem Statement

Traditional to-do lists are passive systems that don't reflect the true urgency of real-world deadlines. When tasks slip past their due date, they merely change color, leading to procrastination and compounded stress. There is an active need for a system that mirrors real-world pressure, holds users accountable, and communicates urgency based on personal productivity styles.

## 2. Problem Description

**CrushIt** is a dynamic, high-accountability deadline tracker and reminder system designed to actively keep users focused. It solves the passive task-tracker problem by using intelligent, continuous background tracking. The system dynamically monitors upcoming work and actively pings the user with varying levels of urgency through custom motivational tones. By incorporating features like a "Pressure Score", Active Lanes, and strict deadline monitoring, it transforms task management from a passive checklist into an active command center.

## 3. Modules details and its key features

The project is built using a modern stack: HTML, CSS, JavaScript, ReactJS (Frontend), and Node.js + Firebase (Backend).

### A. Authentication & Identity Module
*   **Key Features:** Secure email/password login and registration. Users can define their personal "Tone Persona" (Warrior/Slayer Mode) and "Display Name" during onboarding.
*   **Tech:** Firebase Auth, React Context API (`AuthContext`).

### B. Core Dashboard & Analytics Module
*   **Key Features:** Live readout of the user's "Pressure Score", completion efficiency, and "Active Lanes" (tasks due in the current week). The Dashboard automatically separates tasks by High Priority, Overdue, and Deep Work.
*   **Tech:** React Hooks (`useMemo`, `useState`), custom algorithms to calculate momentum and urgency based on incoming deadline timestamps.

### C. Task Management & Board Module
*   **Key Features:** Allows users to create tasks with strict deadlines, categories, and priority levels. The board visually reflects the urgency using color-coded tags and lane separation.
*   **Tech:** React Components (`TaskCard`, `AddTaskModal`), Firestore Realtime queries mapping NoSQL documents to state.

### D. Automated Cron & Email Dispatch Module
*   **Key Features:** A secured backend Firebase Function that runs securely in the background. It sweeps the database looking for tasks hitting critical thresholds (24 hours, 7 days) and uses Resend API to deliver beautifully styled HTML emails directly to the user's inbox based on their chosen motivational tone (Friendly, Strict, or Motivational).
*   **Tech:** Google Cloud Scheduler (`onSchedule`), Resend Node SDK, Firebase Admin.

## 4. Design layout (Pictorial representation of workflow)

*Below is the high-level workflow architecture of the CrushIt platform.*

```text
[ User / Frontend ]                                   [ Backend / Cloud ]
       |                                                      |
  1. Login/Signup   --------(Firebase Auth)-------->    Authenticates User
       |                                                      |
  2. Create Task    ------(Update Firestore)------->   Stores Document (Deadline, Title)
       |                                                      |
  3. Dashboard View <------(Realtime Fetch)---------   Maintains Pressure Score Live
       |                                                      |
       .                                           [ Google Cloud Scheduler ]
       .                                                      | (Runs defined schedule)
       .                                                      v
       .                                           [ Firebase Cloud Function ]
       .                                         Queries DB for tasks due in < 24 hrs
       .                                                      |
       .                                                      v
  4. User's Inbox   <-------(Resend API)------------   Dispatches Styled Reminder Email
```

## 5. User Interface (UI) design

The UI relies heavily on a custom design system styled purely with CSS. It implements a fully responsive "glassmorphism" overlay with smooth neumorphic accents to make the Pressure Score and active task lanes highly visible. Features include a global Dark Mode toggle, distinct focus timer elements, and a sidebar navigation panel.

*(Instructor Note: Paste screenshots here from your UI. Consider taking fresh screenshots of the Dashboard, Settings, and Task modals to place into the Word Document.)*

## 6. Source code

*(Note: Paste your core files into the final Word Document. Below are the structural highlights.)*

**Frontend Setup (`src/App.jsx` segment):**
```javascript
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthScreen_ParvYadav_24BCI0231 from './pages/AuthScreen';
import Dashboard_ParvYadav_24BCI0231 from './pages/Dashboard';
import { initAppByParvYadav24BCI0231 } from './lib/ParvYadav_24BCI0231';

export default function App_ParvYadav_24BCI0231() {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Identity Verification Watermark
    const parvYadav_24BCI0231 = initAppByParvYadav24BCI0231();
    console.log("[App] Initialized by:", parvYadav_24BCI0231.getWatermarkParvYadav());
  }, []);

  if (!currentUser) return <AuthScreen_ParvYadav_24BCI0231 />;

  return (
    <div id="appShell">
       <main className="dashboard">
          <Routes>
            <Route path="/" element={<Dashboard_ParvYadav_24BCI0231 />} />
          </Routes>
       </main>
    </div>
  );
}
```

## 7. Input and Output / Screenshot with Timestamp

*(Instructor Note: Take live screenshots of your desktop running the application with the system clock visible in the taskbar or use a browser extension to stamp the time. Include screenshots of:)*
1. **Input:** The "Add Mission" modal being filled out with a task.
2. **Output:** The Dashboard immediately calculating the new Pressure Score and rendering the task in the execution lane.
3. **Output:** The Email Reminder sitting in your actual Gmail inbox.

## 8. Include your portfolio in your project as exclusive hyperlink.

The portfolio hyperlink has been exclusively integrated directly into the CrushIt Frontend UI. At the bottom of the main navigation Sidebar, there is a dedicated section that reads **"Built by Parv Yadav"**.

Clicking this opens the exclusive portfolio hyperlink:
**[https://www.linkedin.com/in/parv-yadav-7b9baa239](https://www.linkedin.com/in/parv-yadav-7b9baa239)**
