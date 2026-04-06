import { NavLink } from 'react-router-dom';
import { BarChart3, Calendar, LayoutDashboard, ListChecks, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { getTaskMetrics } from '../lib/taskMetrics';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const { tasks } = useTasks();
  const metrics = getTaskMetrics(tasks);
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        id="sidebarOverlay" 
        onClick={onClose}
      />
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="logo-line">CRUSH</span>
          <span className="logo-line logo-accent">IT</span>
        </div>

        {/* Main Nav */}
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={onClose}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Calendar size={20} />
            <span>Calendar</span>
          </NavLink>
          
          <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <BarChart3 size={20} />
            <span>Analytics</span>
          </NavLink>
          
          <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <ListChecks size={20} />
            <span>Tasks</span>
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <div className="sidebar-status-card">
            <div className="sidebar-status-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="sidebar-status-title">Momentum</p>
              <p className="sidebar-status-copy">
                {metrics.active} active, {metrics.overdue} overdue, {metrics.completionRate}% closed
              </p>
            </div>
          </div>

          <button className="nav-item settings-item" onClick={logout} style={{width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-tertiary)'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span>Log Out</span>
          </button>
          
          <div className="user-profile">
            <div className="avatar">
              <span className="avatar-text">{initial}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
            </div>
          </div>

          <a 
            href="https://www.linkedin.com/in/parv-yadav-7b9baa239" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="sidebar-credit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            <span>Built by Parv Yadav</span>
          </a>
        </div>
      </aside>
    </>
  );
}
