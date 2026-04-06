import { useEffect, useState } from 'react';
import { CalendarClock, Flame, Layers3, TimerReset, X } from 'lucide-react';

const CATEGORY_OPTIONS = ['Deep Work', 'Study', 'Career', 'Health'];
const FOCUS_OPTIONS = [25, 50, 90];

function formatLocalDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AddTaskModal({ isOpen, onClose, onAddTask }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Deep Work');
  const [focusMinutes, setFocusMinutes] = useState(50);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function resetForm() {
    setTitle('');
    setPriority('medium');
    setDeadline('');
    setDescription('');
    setCategory('Deep Work');
    setFocusMinutes(50);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function applyDeadlinePreset(hoursAhead) {
    const nextDate = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    setDeadline(formatLocalDateTime(nextDate));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    
    await onAddTask({
      title: title.trim(),
      priority,
      deadline: deadline ? new Date(deadline) : null,
      description: description.trim(),
      category,
      focusMinutes,
    });
    
    handleClose();
  }

  return (
    <div className="modal-overlay open" onClick={(event) => {
      if (event.target === event.currentTarget) handleClose();
    }}>
      <div className="modal-box card task-modal-upgrade">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Spin Up A New Mission</h3>
            <p className="modal-caption">Shape the task, the pressure, and the focus block in one move.</p>
          </div>
          <button className="modal-close" onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="taskNameInput">Task Name</label>
            <input 
              type="text" 
              className="form-input" 
              id="taskNameInput" 
              placeholder="Finish presentation, ship feature, submit draft..."
              required 
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="taskDescInput">Mission Notes</label>
            <textarea 
              className="form-input" 
              id="taskDescInput" 
              rows="3"
              placeholder="What done looks like, blockers, or what to hit first..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Layers3 size={14} />
              Category
            </label>
            <div className="quick-pill-row">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`quick-pill ${category === option ? 'active' : ''}`}
                  onClick={() => setCategory(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="taskDueInput">
                <CalendarClock size={14} />
                Due Date & Time
              </label>
              <input 
                type="datetime-local" 
                className="form-input" 
                id="taskDueInput" 
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />

              <div className="quick-pill-row deadline-presets">
                <button type="button" className="quick-pill ghost" onClick={() => applyDeadlinePreset(8)}>Tonight</button>
                <button type="button" className="quick-pill ghost" onClick={() => applyDeadlinePreset(24)}>Tomorrow</button>
                <button type="button" className="quick-pill ghost" onClick={() => applyDeadlinePreset(72)}>3 Days</button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Flame size={14} />
                Priority
              </label>
              <div className="priority-select">
                <button 
                  type="button" 
                  className={`pr-opt pr-opt-high ${priority === 'high' ? 'active' : ''}`}
                  onClick={() => setPriority('high')}
                >High</button>
                <button 
                  type="button" 
                  className={`pr-opt pr-opt-medium ${priority === 'medium' ? 'active' : ''}`}
                  onClick={() => setPriority('medium')}
                >Medium</button>
                <button 
                  type="button" 
                  className={`pr-opt pr-opt-low ${priority === 'low' ? 'active' : ''}`}
                  onClick={() => setPriority('low')}
                >Low</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <TimerReset size={14} />
              Focus Sprint
            </label>
            <div className="quick-pill-row">
              {FOCUS_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`quick-pill ${focusMinutes === minutes ? 'active' : ''}`}
                  onClick={() => setFocusMinutes(minutes)}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>
          
          <button type="submit" className="form-submit">Add To Board</button>
        </form>
      </div>
    </div>
  );
}
