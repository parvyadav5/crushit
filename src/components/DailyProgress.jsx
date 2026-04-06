import { useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { getTaskMetrics, calculateStreak } from '../lib/taskMetrics';
import { Flame, CheckCircle, Circle, ArrowRight } from 'lucide-react';

export default function DailyProgress() {
  const { tasks } = useTasks();

  const metrics = useMemo(() => getTaskMetrics(tasks), [tasks]);
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);

  const progressPercentage = metrics.total === 0 ? 0 : Math.round((metrics.completed / metrics.total) * 100);

  return (
    <section className="card daily-progress-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-heading" style={{fontSize: '1.25rem', marginBottom: '4px'}}>Current Progress</h2>
          <p className="card-subtitle">Your real-time mission report.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--peach-light)', color: 'var(--orange-deep)', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
          <Flame size={16} />
          {streak} Day Streak
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
           <p style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Total tasks</p>
           <p style={{fontSize: '1.5rem', fontWeight: 800}}>{metrics.total}</p>
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
           <p style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px'}}>
             <CheckCircle size={14} style={{color: 'var(--badge-low-text)'}}/> Completed
           </p>
           <p style={{fontSize: '1.5rem', fontWeight: 800}}>{metrics.completed}</p>
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
           <p style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px'}}>
             <Circle size={14} style={{color: 'var(--orange-deep)'}}/> Pending
           </p>
           <p style={{fontSize: '1.5rem', fontWeight: 800}}>{metrics.active}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: 'auto' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{fontWeight: 600}}>Completion</span>
            <span style={{fontWeight: 800, color: 'var(--orange-deep)'}}>{progressPercentage}%</span>
         </div>
         <div style={{ width: '100%', height: '12px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercentage}%`, 
                background: 'linear-gradient(90deg, var(--yellow) 0%, var(--orange) 100%)',
                transition: 'width 0.5s ease-out'
              }} 
            />
         </div>
      </div>
      
    </section>
  );
}
