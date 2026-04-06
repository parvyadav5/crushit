import { useMemo, useState, useEffect } from 'react';
import { ArrowRight, Plus, Radar, Sparkles, Zap } from 'lucide-react';
import Header_ParvYadav_24BCI0231 from '../components/Header';
import DailyProgress from '../components/DailyProgress';
import FocusTimer from '../components/FocusTimer';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { getTaskMetrics, isOverdue, sortTasksByUrgency } from '../lib/taskMetrics';
import { STUDENT_NAME_ParvYadav, REG_NO_24BCI0231, logTaskAction_24BCI0231 } from '../lib/ParvYadav_24BCI0231';

// Dashboard — Parv Yadav (24BCI0231)
export default function Dashboard_ParvYadav_24BCI0231({ onOpenSidebar }) {
  const { currentUser } = useAuth();
  const { tasks, loading, addTask, toggleTaskComplete, deleteTaskItem } = useTasks();
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);

  // Log dashboard load — Parv Yadav 24BCI0231
  useEffect(() => {
    console.log(`[Dashboard] Loaded by ${STUDENT_NAME_ParvYadav} (${REG_NO_24BCI0231})`);
  }, []);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const metrics = useMemo(() => getTaskMetrics(tasks), [tasks]);

  const visibleTasks = useMemo(() => {
    const openTasks = sortTasksByUrgency(tasks.filter((task) => !task.completed));

    if (filter === 'urgent') {
      return openTasks.filter((task) => task.priority === 'high');
    }

    if (filter === 'overdue') {
      return openTasks.filter((task) => isOverdue(task));
    }

    return openTasks;
  }, [filter, tasks]);

  const highlightCards = [
    {
      icon: Radar,
      label: 'Active lanes',
      value: metrics.active,
      note: `${metrics.dueThisWeek} due this week`,
    },
    {
      icon: Zap,
      label: 'Pressure score',
      value: metrics.pressureScore,
      note: metrics.overdue > 0 ? `${metrics.overdue} need rescue` : 'No rescue missions',
    },
    {
      icon: Sparkles,
      label: 'Completion rate',
      value: `${metrics.completionRate}%`,
      note: `${metrics.completed} tasks closed`,
    },
  ];

  return (
    <div className="page page-dashboard active" id="pageDashboard">
      <Header_ParvYadav_24BCI0231 
        title={`Hello, ${displayName.split(' ')[0]}`}
        subtitle="Shape the board, lock the next sprint, and hit the pressure points before they hit you."
        showDate={true}
        showSearch={true}
        showNotif={true}
        onOpenSidebar={onOpenSidebar}
      />

      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="hero-kicker">Mission Control</span>
          <h2 className="hero-title">Your deadline board is live and reading the room.</h2>
          <p className="hero-text">
            {metrics.overdue > 0
              ? `You have ${metrics.overdue} task${metrics.overdue === 1 ? '' : 's'} slipping. Pull them back into focus before new work piles on.`
              : `No fires right now. Use this clean runway to finish high-value work before the week tightens up.`}
          </p>

          <div className="hero-actions">
            <button className="hero-primary-btn" onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Add Mission
            </button>
            <div className="hero-secondary-stat">
              <ArrowRight size={16} />
              <span>{metrics.focusMinutes} focus minutes queued</span>
            </div>
          </div>
        </div>

        <div className="hero-stat-grid">
          {highlightCards.map((card) => (
            <article key={card.label} className="hero-stat-card">
              <div className="hero-stat-icon">
                <card.icon size={18} />
              </div>
              <span className="hero-stat-label">{card.label}</span>
              <strong className="hero-stat-value">{card.value}</strong>
              <span className="hero-stat-note">{card.note}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="top-row">
        <DailyProgress />
        <FocusTimer />
      </div>

      <section className="priorities-section">
        <div className="priorities-header">
          <div>
            <h2 className="section-heading">Pressure Queue</h2>
            <p className="section-subheading">Work sorted by urgency, not by accident.</p>
          </div>

          <div className="toggle-switch">
            <button 
              className={`toggle-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`toggle-btn ${filter === 'urgent' ? 'active' : ''}`}
              onClick={() => setFilter('urgent')}
            >
              High
            </button>
            <button 
              className={`toggle-btn ${filter === 'overdue' ? 'active' : ''}`}
              onClick={() => setFilter('overdue')}
            >
              Overdue
            </button>
          </div>
        </div>

        <div className="priorities-grid">
          <button className="card add-task-card" onClick={() => setModalOpen(true)}>
            <Plus size={36} strokeWidth={1.5} />
            <strong>Add New Task</strong>
            <span>Brief it, set the pressure, and move.</span>
          </button>

          {loading ? (
            <p>Loading tasks...</p>
          ) : visibleTasks.length === 0 ? (
            <div className="card empty-state-card">
              <Sparkles size={28} />
              <h3>No tasks in this lane</h3>
              <p>Shift the filter or add a fresh mission to keep the board alive.</p>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={toggleTaskComplete}
                onDelete={deleteTaskItem}
              />
            ))
          )}
        </div>
      </section>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)}
        onAddTask={(taskData) => {
          logTaskAction_24BCI0231("Task Created", taskData.title || "Untitled");
          addTask(taskData);
        }}
      />
    </div>
  );
}
