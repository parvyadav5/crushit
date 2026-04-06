import { useEffect, useState } from 'react';
import { BellRing, Flame, LogOut, MoonStar, Save, Sparkles, User2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SESSION_OPTIONS = [25, 50, 90];
const TONE_OPTIONS = ['Calm', 'Hard', 'Savage'];

export default function SettingsModal({ isOpen, onClose }) {
  const { currentUser, profile, saveProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('male');
  const [theme, setTheme] = useState('light');
  const [focusLength, setFocusLength] = useState(50);
  const [tone, setTone] = useState('Hard');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setDisplayName(
      currentUser?.displayName
      || profile?.displayName
      || currentUser?.email?.split('@')[0]
      || 'Operator',
    );
    setGender(profile?.gender || 'male');
    setTheme(localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light');
    setFocusLength(Number(localStorage.getItem('crushit-focus-length') || 50));
    setTone(localStorage.getItem('crushit-tone') || 'Hard');
  }, [currentUser, isOpen, profile]);

  if (!isOpen || !currentUser) return null;

  async function handleSave() {
    setSaving(true);

    try {
      await saveProfile({ displayName, gender });
      localStorage.setItem('darkMode', String(theme === 'dark'));
      localStorage.setItem('crushit-focus-length', String(focusLength));
      localStorage.setItem('crushit-tone', tone);

      document.body.classList.toggle('dark', theme === 'dark');
      window.dispatchEvent(new Event('crushit-settings-changed'));
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    onClose();
  }

  return (
    <div className="modal-overlay open" onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal-box card settings-modal">
        <button className="settings-close" onClick={onClose} aria-label="Close settings">
          <X size={18} />
        </button>

        <div className="settings-profile-header">
          <div className="settings-avatar">
            <span className="settings-avatar-text">
              {(displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="settings-profile-info">
            <p className="settings-title">Command Center</p>
            <p className="settings-email">{currentUser.email}</p>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="modal-body">
          <section className="settings-section">
            <div className="settings-section-header">
              <User2 size={14} />
              <span>Identity</span>
            </div>

            <input
              className="settings-input"
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />

            <div className="gender-pills">
              {['male', 'female'].map((option) => (
                <label className="gender-pill" key={option}>
                  <input
                    type="radio"
                    name="settings-gender"
                    checked={gender === option}
                    onChange={() => setGender(option)}
                  />
                  <span className="gender-pill-inner">
                    <Sparkles size={14} />
                    <span>{option === 'male' ? 'Warrior' : 'Slayer'}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-header">
              <MoonStar size={14} />
              <span>Theme</span>
            </div>

            <div className="toggle-switch settings-toggle">
              {['light', 'dark'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`toggle-btn ${theme === option ? 'active' : ''}`}
                  onClick={() => setTheme(option)}
                >
                  {option === 'light' ? 'Glow' : 'Night'}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-header">
              <Flame size={14} />
              <span>Focus Sprint</span>
            </div>

            <div className="session-pills">
              {SESSION_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`session-pill ${focusLength === minutes ? 'active' : ''}`}
                  onClick={() => setFocusLength(minutes)}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-header">
              <BellRing size={14} />
              <span>App Tone</span>
            </div>

            <div className="session-pills tone-pills">
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`session-pill ${tone === option ? 'active' : ''}`}
                  onClick={() => setTone(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <p className="settings-hint">
              <Sparkles size={14} />
              {tone === 'Calm' && 'Softer UI copy and steadier focus cues.'}
              {tone === 'Hard' && 'Balanced pressure with clean, no-drift nudges.'}
              {tone === 'Savage' && 'Sharper energy for deep deadline mode.'}
            </p>
          </section>
        </div>

        <div className="settings-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>

          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
