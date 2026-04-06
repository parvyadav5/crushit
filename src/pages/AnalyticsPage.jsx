import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ListTodo, Radar } from 'lucide-react';
import Header_ParvYadav_24BCI0231 from '../components/Header';
import { useTasks } from '../contexts/TaskContext';
import { getTaskDeadline, getTaskMetrics, getWeeklyTimeline, isOverdue } from '../lib/taskMetrics';
import { PROJECT_BY_ParvYadav_24BCI0231 } from '../lib/ParvYadav_24BCI0231';

export default function AnalyticsPage_ParvYadav_24BCI0231({ onOpenSidebar }) {
  const { tasks } = useTasks();

  const metrics = useMemo(() => getTaskMetrics(tasks), [tasks]);
  const timeline = useMemo(() => getWeeklyTimeline(tasks), [tasks]);

  const completedTasks = tasks.filter((task) => task.completed).slice(0, 5);
  const missedTasks = tasks.filter((task) => isOverdue(task)).slice(0, 5);

  const progressPerc = metrics.completionRate;
  const offset = 377 - (377 * progressPerc) / 100;

  const maxLoad = Math.max(...timeline.map((day) => day.completedCount + day.activeCount), 1);

  const insights = [
    {
      label: 'Pressure',
      value: metrics.pressureScore,
      note: metrics.pressureScore > 65 ? 'High urgency on the board' : 'Manageable pacing',
    },
    {
      label: 'This week',
      value: metrics.dueThisWeek,
      note: 'tasks are approaching',
    },
    {
      label: 'Focus queue',
      value: metrics.focusMinutes,
      note: 'minutes estimated',
    },
  ];

  return (
    <div className="page page-analytics active">
      <Header_ParvYadav_24BCI0231 
        title="Analytics"
        subtitle="Less vanity. More signal on what your week actually looks like."
        onOpenSidebar={onOpenSidebar}
      />

      <div className="analytics-stats">
        <div className="card stat-ring-card analytics-hero-card">
          <div className="ring-container">
            <svg className="progress-ring" width="140" height="140" viewBox="0 0 140 140">
              <circle className="ring-bg" cx="70" cy="70" r="60" fill="none" stroke="var(--border-color)" strokeWidth="12" />
              <circle 
                className="ring-fill" 
                cx="70" cy="70" r="60" 
                fill="none" stroke="var(--yellow)" 
                strokeWidth="12" strokeLinecap="round" 
                strokeDasharray="377" 
                strokeDashoffset={offset} 
                transform="rotate(-90 70 70)" 
              />
            </svg>
            <div className="ring-label">
              <span className="ring-percent">{progressPerc}%</span>
              <span className="ring-sub">Closed</span>
            </div>
          </div>
          <p className="stat-ring-title">Completion Efficiency</p>
          <small style={{ marginTop: '8px', opacity: 0.5, display: 'block', textAlign: 'center' }}>
            {PROJECT_BY_ParvYadav_24BCI0231}
          </small>
        </div>

        <div className="card stat-card stat-completed">
          <div className="stat-icon">
            <CheckCircle2 color="#2DA862" size={24} />
          </div>
          <span className="stat-number">{metrics.completed}</span>
          <span className="stat-label">Completed</span>
        </div>

        <div className="card stat-card stat-missed">
          <div className="stat-icon">
            <AlertTriangle color="#D44040" size={24} />
          </div>
          <span className="stat-number">{metrics.overdue}</span>
          <span className="stat-label">Overdue</span>
        </div>

        <div className="card stat-card stat-total">
          <div className="stat-icon">
            <ListTodo color="var(--orange)" size={24} />
          </div>
          <span className="stat-number">{metrics.total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
      </div>

      <section className="analytics-trend-grid">
        <div className="card analytics-trend-card">
          <div className="analytics-trend-header">
            <div>
              <h3>7-Day Load</h3>
              <p>How much due pressure and completion volume each day carried.</p>
            </div>
            <span className="task-board-chip">
              <Radar size={14} />
              Live board pulse
            </span>
          </div>

          <div className="trend-bars">
            {timeline.map((day) => {
              const height = ((day.completedCount + day.activeCount) / maxLoad) * 100;

              return (
                <div key={day.key} className="trend-day">
                  <div className="trend-column">
                    <div className="trend-column-track">
                      <div className="trend-column-fill" style={{ height: `${Math.max(height, 14)}%` }} />
                    </div>
                  </div>
                  <strong>{day.label}</strong>
                  <span>{day.completedCount + day.activeCount}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="analytics-insight-stack">
          {insights.map((item) => (
            <article key={item.label} className="card analytics-insight-card">
              <span className="analytics-insight-label">{item.label}</span>
              <strong className="analytics-insight-value">{item.value}</strong>
              <span className="analytics-insight-note">{item.note}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="analytics-lists">
        <div className="card analytics-list-card">
          <h3 className="analytics-list-title">
            <span className="al-dot al-dot-green"></span>
            Latest Wins
          </h3>
          <div className="analytics-task-list">
            {completedTasks.length === 0 ? (
              <p className="al-empty">No completed tasks yet.</p>
            ) : (
              completedTasks.map((task) => (
                <div key={task.id} className="al-item al-item-done">
                  <span className="al-icon">✓</span>
                  <div className="al-info">
                    <span className="al-name">{task.title}</span>
                    <span className="al-due">{task.category || 'Deep Work'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card analytics-list-card">
          <h3 className="analytics-list-title">
            <span className="al-dot al-dot-red"></span>
            Rescue Targets
          </h3>
          <div className="analytics-task-list">
            {missedTasks.length === 0 ? (
              <p className="al-empty">No overdue tasks. Keep that standard high.</p>
            ) : (
              missedTasks.map((task) => {
                const deadline = getTaskDeadline(task);

                return (
                  <div key={task.id} className="al-item al-item-missed">
                    <span className="al-icon">!</span>
                    <div className="al-info">
                      <span className="al-name">{task.title}</span>
                      <span className="al-due">
                        Due {deadline ? deadline.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'soon'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
