import { useMemo, useState } from 'react';
import { Clock3, Flame, Sparkles, Target } from 'lucide-react';
import Header_ParvYadav_24BCI0231 from '../components/Header';
import { useTasks } from '../contexts/TaskContext';
import { getTaskDeadline, getTaskMetrics, getUrgencyMeta, isOverdue, sortTasksByUrgency } from '../lib/taskMetrics';
import { PROJECT_BY_ParvYadav_24BCI0231 } from '../lib/ParvYadav_24BCI0231';

export default function TasksPage_ParvYadav_24BCI0231({ onOpenSidebar }) {
  const { tasks, toggleTaskComplete } = useTasks();
  const [filter, setFilter] = useState('all');

  const metrics = useMemo(() => getTaskMetrics(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    const ordered = sortTasksByUrgency(tasks);

    if (filter === 'focus') return ordered.filter((task) => !task.completed && task.priority === 'high');
    if (filter === 'overdue') return ordered.filter((task) => isOverdue(task));
    if (filter === 'done') return ordered.filter((task) => task.completed);
    return ordered;
  }, [filter, tasks]);

  const pills = [
    { id: 'all', label: 'All' },
    { id: 'focus', label: 'Focus' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'done', label: 'Done' },
  ];

  const summaryCards = [
    {
      icon: Target,
      label: 'Active',
      value: metrics.active,
      note: 'open missions',
    },
    {
      icon: Clock3,
      label: 'Due today',
      value: metrics.dueToday,
      note: 'same-day pressure',
    },
    {
      icon: Flame,
      label: 'High priority',
      value: metrics.highPriority,
      note: 'need attention',
    },
  ];

  return (
    <div className="page page-tasks active">
      <Header_ParvYadav_24BCI0231 
        title="Task Board"
        subtitle="A tighter list view for when you want pure execution."
        onOpenSidebar={onOpenSidebar}
        rightActions={
          <div className="tasks-filter-pills">
            {pills.map((pill) => (
              <button 
                key={pill.id}
                className={`tasks-pill ${filter === pill.id ? 'active' : ''}`}
                onClick={() => setFilter(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        }
      />

      <section className="task-board-summary">
        {summaryCards.map((card) => (
          <article key={card.label} className="card task-summary-card">
            <div className="task-summary-icon">
              <card.icon size={18} />
            </div>
            <div>
              <p className="task-summary-label">{card.label}</p>
              <strong className="task-summary-value">{card.value}</strong>
              <span className="task-summary-note">{card.note}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="card tasks-list-card">
        <div className="tasks-list-header">
          <div>
            <h3>Execution Lane</h3>
            <p>{filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'} in this view</p>
          </div>
          <span className="task-board-chip">
            <Sparkles size={14} />
            Sorted by urgency
          </span>
        </div>

        <div className="tasks-full-list" id="tasksFullList">
          {filteredTasks.length === 0 ? (
            <div className="al-empty">
              <p>No tasks matching this filter.</p>
              <small style={{ marginTop: '8px', opacity: 0.5, display: 'block' }}>
                {PROJECT_BY_ParvYadav_24BCI0231}
              </small>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const deadline = getTaskDeadline(task);
              const urgency = getUrgencyMeta(task);

              return (
                <div 
                  key={task.id} 
                  className={`task-row ${task.completed ? 'row-done' : ''}`} 
                  data-priority={task.priority}
                >
                  <button 
                    className={`task-row-check ${task.completed ? 'checked' : ''}`} 
                    aria-label="Complete task"
                    onClick={() => toggleTaskComplete(task.docId, !task.completed)}
                  >
                    ✓
                  </button>
                  <span className={`task-row-dot pr-${task.priority || 'medium'}`}></span>
                  <div className="task-row-info">
                    <div className="task-row-name">{task.title}</div>
                    <div className="task-row-subline">
                      <span>{task.category || 'Deep Work'}</span>
                      <span>{task.focusMinutes || 50}m sprint</span>
                      <span>{deadline ? deadline.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Flexible'}</span>
                    </div>
                  </div>
                  <span className={`task-row-badge b-${task.priority || 'medium'}`}>{urgency.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
