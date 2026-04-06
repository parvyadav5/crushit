import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, Menu, Moon, Search, Sparkles, Sun, X } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { buildNotifications, getTaskMetrics, getUrgencyMeta, sortTasksByUrgency } from '../lib/taskMetrics';
import { getStudentInfo_ParvYadav } from '../lib/ParvYadav_24BCI0231';

export default function Header_ParvYadav_24BCI0231({ 
  title, 
  subtitle, 
  showDate = false,
  showSearch = false,
  showNotif = false,
  onOpenSidebar,
  rightActions
}) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const metrics = useMemo(() => getTaskMetrics(tasks), [tasks]);
  const notifications = useMemo(() => buildNotifications(tasks), [tasks]);
  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    return sortTasksByUrgency(tasks)
      .filter((task) => {
        const haystack = [
          task.title,
          task.description,
          task.category,
          task.priority,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 6);
  }, [searchTerm, tasks]);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  useEffect(() => {
    function syncSettings() {
      setIsDark(localStorage.getItem('darkMode') === 'true');
    }

    window.addEventListener('crushit-settings-changed', syncSettings);
    return () => window.removeEventListener('crushit-settings-changed', syncSettings);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = '📅  ' + now.toLocaleDateString('en-US', options);

  function openSearch() {
    const studentInfo = getStudentInfo_ParvYadav();
    console.log(`[${studentInfo.regNo}] Search opened by ${studentInfo.name}`);
    setNotifOpen(false);
    setSearchOpen(true);
  }

  function toggleNotifications() {
    setSearchOpen(false);
    setNotifOpen((current) => !current);
  }

  function openTasksBoard() {
    navigate('/tasks');
    setSearchOpen(false);
    setNotifOpen(false);
  }

  return (
    <>
      <button className="hamburger" aria-label="Open sidebar" onClick={onOpenSidebar}>
        <Menu size={24} />
      </button>

      <header className="dash-header">
        <div className="header-left">
          <h1 className="greeting">{title}</h1>
          <p className="greeting-sub">{subtitle}</p>
          {showDate && <p className="greeting-date">{dateStr}</p>}

          <div className="header-status-row">
            <span className="header-status-pill">
              <Sparkles size={14} />
              {metrics.active} active lanes
            </span>

            {metrics.overdue > 0 ? (
              <span className="header-status-pill danger">
                <AlertTriangle size={14} />
                {metrics.overdue} overdue
              </span>
            ) : (
              <span className="header-status-pill calm">
                <Sparkles size={14} />
                Board looks clean
              </span>
            )}
          </div>
        </div>
        
        <div className="header-right">
          {rightActions}
          
          <button 
            className="icon-btn dark-mode-btn" 
            aria-label="Toggle dark mode"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {showSearch && (
            <button className="icon-btn" aria-label="Search" onClick={openSearch}>
              <Search size={20} />
            </button>
          )}
          
          {showNotif && (
            <button className="icon-btn notification-btn" aria-label="Notifications" onClick={toggleNotifications}>
              <Bell size={20} />
              {notifications.length > 0 && <span className="notif-dot"></span>}
            </button>
          )}
        </div>
      </header>

      <div className={`search-overlay ${searchOpen ? 'open' : ''}`} onClick={() => setSearchOpen(false)}>
        <div className="search-box card" onClick={(event) => event.stopPropagation()}>
          <div className="search-input-row">
            <Search size={18} />
            <input
              className="search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search task title, category, or notes..."
              autoFocus
            />
            <button className="search-close" onClick={() => setSearchOpen(false)}>Close</button>
          </div>

          <div className="search-results">
            {!searchTerm.trim() && <p className="search-hint">Search your board to jump straight into execution.</p>}
            {searchTerm.trim() && searchResults.length === 0 && (
              <p className="search-no-results">No tasks matched that query.</p>
            )}

            {searchResults.map((task) => {
              const urgency = getUrgencyMeta(task);

              return (
                <button
                  key={task.id}
                  className="search-result-item"
                  onClick={openTasksBoard}
                >
                  <span className={`sr-dot pr-${task.priority || 'medium'}`}></span>
                  <span className="sr-name">{task.title}</span>
                  <span className="sr-due">{urgency.timeText}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`notif-panel-overlay ${notifOpen ? 'open' : ''}`} onClick={() => setNotifOpen(false)} />
      <aside className={`notif-panel ${notifOpen ? 'open' : ''}`}>
        <div className="notif-panel-header">
          <div>
            <p className="notif-panel-title">Signal Feed</p>
            <span className="notif-panel-subtitle">Fresh pressure and momentum from your board</span>
          </div>
          <button className="notif-clear" onClick={() => setNotifOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="notif-list">
          {notifications.map((item) => (
            <button key={item.id} className="notif-item unread" onClick={openTasksBoard}>
              <span className={`notif-icon ni-${item.kind}`}>
                {item.kind === 'alert' && <AlertTriangle size={16} />}
                {item.kind === 'reminder' && <Bell size={16} />}
                {item.kind === 'task' && <Sparkles size={16} />}
              </span>
              <span className="notif-info">
                <span className="notif-text">{item.title}</span>
                <span className="notif-time">{item.meta}</span>
              </span>
              <span className="notif-unread-dot" />
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
