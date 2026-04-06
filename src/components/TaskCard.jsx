import { useMemo, useState } from 'react';
import { CheckCircle, Clock3, MoreVertical, TimerReset } from 'lucide-react';
import { getTaskDeadline, getUrgencyMeta } from '../lib/taskMetrics';

export default function TaskCard({ task, onComplete, onDelete }) {
  const [showOverlay, setShowOverlay] = useState(false);

  const urgency = useMemo(() => getUrgencyMeta(task), [task]);
  const deadline = useMemo(() => getTaskDeadline(task), [task]);

  const deadlineText = deadline
    ? deadline.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    : 'Flexible deadline';

  const category = task.category || 'Deep Work';
  const focusMinutes = Number(task.focusMinutes || 50);

  const handleCompleteClick = () => {
    if (task.completed) return;
    setShowOverlay(true);
    onComplete(task.docId, true);
  };

  const handleUndo = (event) => {
    event.stopPropagation();
    setShowOverlay(false);
    onComplete(task.docId, false);
  };

  return (
    <div 
      className={`card task-card task-card-${urgency.tone} ${task.completed ? 'task-done' : ''}`} 
      data-priority={task.priority}
    >
      <div className="task-top">
        <div className="task-chip-row">
          <span className={`priority-badge badge-${task.priority || 'medium'}`}>
            {(task.priority || 'medium').toUpperCase()}
          </span>
          <span className={`task-urgency task-urgency-${urgency.tone}`}>{urgency.label}</span>
        </div>

        <button className="menu-btn" aria-label="Delete task" onClick={() => onDelete(task.docId)}>
          <MoreVertical size={18} />
        </button>
      </div>
      
      <div className="task-card-body">
        <div className="task-metadata-row">
          <span className="task-category">{category}</span>
          <span className="task-focus">
            <TimerReset size={14} />
            {focusMinutes}m sprint
          </span>
        </div>

        <h3 className="task-title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.title}
        </h3>
        
        <p className="task-desc">{task.description || 'No notes added yet. Keep the brief clean and the execution sharp.'}</p>
        
        <div className="task-meta task-meta-stack">
          <span className="time-remaining">
            <Clock3 size={14} />
            {urgency.timeText}
          </span>
          <span className="task-deadline-stamp">{deadlineText}</span>
        </div>
      </div>
      
      <div className="task-bottom">
        <div className="progress-line">
          <div
            className="progress-fill"
            style={{ width: task.completed ? '100%' : urgency.tone === 'critical' ? '88%' : urgency.tone === 'today' ? '70%' : urgency.tone === 'soon' ? '46%' : '24%' }}
          />
        </div>
        <button className="complete-btn" aria-label="Mark complete" onClick={handleCompleteClick}>
          <CheckCircle size={20} />
        </button>
      </div>

      {showOverlay && task.completed && (
        <div className="task-completed-overlay visible">
          <CheckCircle size={40} color="#2DA862" />
          <span className="overlay-title">Task completed</span>
          <span className="overlay-sub">Pressure released. The reminder engine can ease off.</span>
          <button className="undo-btn" onClick={handleUndo}>Undo</button>
        </div>
      )}
    </div>
  );
}
