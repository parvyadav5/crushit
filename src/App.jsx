import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthScreen_ParvYadav_24BCI0231 from './pages/AuthScreen';
import Sidebar from './components/Sidebar';
import SettingsPage from './pages/SettingsPage';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TasksPage from './pages/TasksPage';
import { initAppByParvYadav24BCI0231 } from './lib/ParvYadav_24BCI0231';

// App — CrushIt by Parv Yadav (24BCI0231)
export default function App_ParvYadav_24BCI0231() {
  const { currentUser, authError } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useEffect: Print Parv Yadav 24BCI0231 identity on app load
  useEffect(() => {
    const parvYadav_24BCI0231 = initAppByParvYadav24BCI0231();
    console.log("[App] Initialized by:", parvYadav_24BCI0231.getWatermarkParvYadav());
  }, []);

  if (authError) {
    return (
      <div className="auth-screen">
        <div className="auth-layout">
          <div className="auth-card card" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="auth-card-top">
              <p className="auth-panel-label">Startup issue</p>
              <h2 className="auth-panel-title">CrushIt could not connect to Firebase.</h2>
              <p className="auth-subtitle">
                The app is running, but Firebase configuration is missing or a startup request failed.
              </p>
            </div>

            <div className="auth-error visible" style={{ marginBottom: '16px' }}>
              {authError}
            </div>

            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <p>Fix this by adding the Firebase environment variables in Vercel Project Settings and then redeploying.</p>
              <p>For local setup, copy <code>.env.example</code> to <code>.env</code> and paste your Firebase web app config.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen_ParvYadav_24BCI0231 />;
  }

  return (
    <div id="appShell">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className="dashboard" id="dashboard">
        <Routes>
          <Route path="/" element={<Dashboard onOpenSidebar={() => setSidebarOpen(true)} />} />
          <Route path="/calendar" element={<CalendarPage onOpenSidebar={() => setSidebarOpen(true)} />} />
          <Route path="/analytics" element={<AnalyticsPage onOpenSidebar={() => setSidebarOpen(true)} />} />
          <Route path="/tasks" element={<TasksPage onOpenSidebar={() => setSidebarOpen(true)} />} />
          <Route path="/settings" element={<SettingsPage onOpenSidebar={() => setSidebarOpen(true)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    </div>
  );
}
