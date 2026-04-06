import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

const PRESETS = [25, 50, 90];

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(remainingSeconds).padStart(2, '0'),
  };
}

export default function FocusTimer() {
  const [presetMinutes, setPresetMinutes] = useState(() => Number(localStorage.getItem('crushit-focus-length') || 50));
  const [secondsLeft, setSecondsLeft] = useState(() => Number(localStorage.getItem('crushit-focus-seconds') || Number(localStorage.getItem('crushit-focus-length') || 50) * 60));
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => Number(localStorage.getItem('crushit-session-count') || 0));

  useEffect(() => {
    function syncSettings() {
      const nextPreset = Number(localStorage.getItem('crushit-focus-length') || 50);
      setPresetMinutes(nextPreset);
      setSecondsLeft((current) => (isRunning ? current : nextPreset * 60));
    }

    window.addEventListener('crushit-settings-changed', syncSettings);
    return () => window.removeEventListener('crushit-settings-changed', syncSettings);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          setCompletedSessions((count) => {
            const nextCount = count + 1;
            localStorage.setItem('crushit-session-count', String(nextCount));
            return nextCount;
          });
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem('crushit-focus-seconds', String(secondsLeft));
  }, [secondsLeft]);

  useEffect(() => {
    localStorage.setItem('crushit-focus-length', String(presetMinutes));
  }, [presetMinutes]);

  const totalSeconds = presetMinutes * 60;
  const progress = useMemo(() => {
    if (totalSeconds === 0) return 0;
    return Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);
  }, [secondsLeft, totalSeconds]);
  const { hours, minutes, seconds } = formatTime(secondsLeft);

  function applyPreset(minutesValue) {
    setPresetMinutes(minutesValue);
    setSecondsLeft(minutesValue * 60);
    setIsRunning(false);
  }

  function resetTimer() {
    setSecondsLeft(presetMinutes * 60);
    setIsRunning(false);
  }

  return (
    <section className="card focus-timer-card">
      <div className="timer-content">
        <div className="timer-left">
          <h2 className="timer-title">Focus Sprint</h2>
          <p className="timer-subtitle">
            {progress === 100
              ? 'Sprint closed. Reset and run another round.'
              : `${progress}% through your current deep work block.`}
          </p>

          <div className="timer-presets">
            {PRESETS.map((minutesValue) => (
              <button
                key={minutesValue}
                type="button"
                className={`timer-preset ${presetMinutes === minutesValue ? 'active' : ''}`}
                onClick={() => applyPreset(minutesValue)}
              >
                {minutesValue}m
              </button>
            ))}
          </div>

          <div className="timer-session-meta">
            <span className="timer-badge">Session target</span>
            <p className="session-label">{completedSessions} focus sprints completed</p>
          </div>
        </div>
        
        <div className="timer-center">
          <div className="timer-display">
            <div className="timer-unit">
              <span className="timer-digit">{hours}</span>
              <span className="timer-label">Hours</span>
            </div>
            <span className="timer-colon">:</span>
            <div className="timer-unit timer-unit-highlight">
              <span className="timer-digit">{minutes}</span>
              <span className="timer-label">Minutes</span>
            </div>
            <span className="timer-colon">:</span>
            <div className="timer-unit">
              <span className="timer-digit">{seconds}</span>
              <span className="timer-label">Seconds</span>
            </div>
          </div>

          <div className="timer-progress">
            <div className="timer-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="timer-right">
          <button 
            className={`play-btn ${isRunning ? 'paused' : ''}`} 
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            onClick={() => setIsRunning((current) => !current)}
          >
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>

          <button className="timer-reset-btn" onClick={resetTimer} aria-label="Reset timer">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
