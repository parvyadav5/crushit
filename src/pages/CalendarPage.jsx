import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, SquareMenu } from 'lucide-react';
import Header_ParvYadav_24BCI0231 from '../components/Header';
import { useTasks } from '../contexts/TaskContext';
import { getTaskMetrics } from '../lib/taskMetrics';
import { logTaskAction_24BCI0231 } from '../lib/ParvYadav_24BCI0231';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage_ParvYadav_24BCI0231({ onOpenSidebar }) {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const calYear = currentDate.getFullYear();
  const calMonth = currentDate.getMonth();
  const metrics = useMemo(() => getTaskMetrics(tasks), [tasks]);

  const taskData = useMemo(() => {
    const result = {};

    tasks.forEach((task) => {
      if (!task.deadline) return;

      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      const dateKey = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`;

      if (!result[dateKey]) result[dateKey] = [];

      result[dateKey].push({
        id: task.id,
        name: task.title,
        time: deadline.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        priority: task.priority || 'medium',
        category: task.category || 'Deep Work',
        completed: task.completed,
      });
    });

    return result;
  }, [tasks]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();

  const selectedTasks = selectedDate ? taskData[selectedDate] || [] : [];
  const monthTaskCount = Object.entries(taskData).reduce((count, [dateKey, list]) => {
    const [year, month] = dateKey.split('-').map(Number);
    return year === calYear && month === calMonth + 1 ? count + list.length : count;
  }, 0);

  function getDayKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  }

  function renderCells() {
    const cells = [];

    for (let index = 0; index < firstDay; index += 1) {
      cells.push(<div key={`empty-${index}`} className="cal-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = getDayKey(calYear, calMonth, day);
      const dayTasks = taskData[dateKey] || [];
      const hasTaskClass = dayTasks.length > 0 ? 'has-tasks' : '';
      const selectedClass = selectedDate === dateKey ? 'selected' : '';
      const todayClass = isToday(calYear, calMonth, day) ? 'today' : '';

      cells.push(
        <button 
          key={day} 
          className={`cal-day ${hasTaskClass} ${selectedClass} ${todayClass}`}
          onClick={() => {
            logTaskAction_24BCI0231("Calendar Date Select", dateKey);
            setSelectedDate(dateKey);
          }}
        >
          <span className="cal-day-num">{day}</span>
          {dayTasks.length > 0 && (
            <div className="cal-dots">
              {dayTasks.slice(0, 3).map((task, index) => (
                <span key={`${task.id}-${index}`} className={`cal-dot dot-${task.priority}`}></span>
              ))}
              {dayTasks.length > 3 && <span className="cal-dot-extra">+{dayTasks.length - 3}</span>}
            </div>
          )}
        </button>,
      );
    }

    return cells;
  }

  const displayDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;

  return (
    <div className="page page-calendar active">
      <Header_ParvYadav_24BCI0231 
        title="Calendar"
        subtitle="See how your tasks stack across the month before they collide."
        onOpenSidebar={onOpenSidebar}
      />

      <div className="calendar-layout">
        <div className="card calendar-card">
          <div className="cal-header">
            <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(calYear, calMonth - 1, 1))} aria-label="Previous month">
              <ChevronLeft size={20} />
            </button>
            <div className="calendar-header-copy">
              <h3 className="cal-month">{MONTH_NAMES[calMonth]} {calYear}</h3>
              <p>{monthTaskCount} task{monthTaskCount === 1 ? '' : 's'} plotted this month</p>
            </div>
            <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(calYear, calMonth + 1, 1))} aria-label="Next month">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="cal-weekdays">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="cal-grid">
            {renderCells()}
          </div>
        </div>

        <div className="card calendar-detail">
          <div className="calendar-side-summary">
            <article className="calendar-summary-card">
              <strong>{metrics.dueToday}</strong>
              <span>due today</span>
            </article>
            <article className="calendar-summary-card">
              <strong>{metrics.overdue}</strong>
              <span>overdue</span>
            </article>
            <article className="calendar-summary-card">
              <strong>{metrics.highPriority}</strong>
              <span>high priority</span>
            </article>
          </div>

          {!selectedDate ? (
            <div className="detail-placeholder">
              <SquareMenu size={48} strokeWidth={1.5} color="var(--text-tertiary)" />
              <p>Click a highlighted day to inspect that lane.</p>
            </div>
          ) : (
            <div className="detail-content visible">
              <h3 className="detail-date">
                {displayDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="detail-tasks">
                {selectedTasks.length === 0 ? (
                  <p className="no-tasks-msg">No tasks scheduled.</p>
                ) : (
                  selectedTasks.map((task) => (
                    <div key={task.id} className="dt-item">
                      <span className={`dt-dot dot-${task.priority}`}></span>
                      <div className="dt-info">
                        <span className="dt-name">{task.name}</span>
                        <span className="dt-time">{task.time} · {task.category}</span>
                      </div>
                      {task.completed && <span className="task-board-chip calm">Done</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
