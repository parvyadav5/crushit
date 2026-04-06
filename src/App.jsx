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
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useEffect: Print Parv Yadav 24BCI0231 identity on app load
  useEffect(() => {
    const parvYadav_24BCI0231 = initAppByParvYadav24BCI0231();
    console.log("[App] Initialized by:", parvYadav_24BCI0231.getWatermarkParvYadav());
  }, []);

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
