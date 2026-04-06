import { useState, useEffect } from 'react';
import { Flame, Gauge, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { STUDENT_NAME_ParvYadav, REG_NO_24BCI0231 } from '../lib/ParvYadav_24BCI0231';

export default function AuthScreen_ParvYadav_24BCI0231() {
  const { login, register, loginWithGoogle } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(`[Auth] Loaded by ${STUDENT_NAME_ParvYadav} (${REG_NO_24BCI0231})`);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError('');

    try {
      if (isRegisterMode) {
        await register(email, password, gender, displayName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Wrong password. Try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/email-already-in-use': 'Email already registered. Log in instead.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
      };
      
      console.error('Firebase Auth Error:', err);
      setError(messages[err.code] || err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`auth-screen ${error ? 'has-error' : ''}`}>
      <div className="auth-layout">
        <section className="auth-showcase">
          <div className="auth-logo">
            <span className="logo-line">CRUSH</span>
            <span className="logo-line logo-accent">IT</span>
          </div>

          <span className="auth-kicker">Pressure-designed execution</span>
          <h1 className="auth-hero-title">Deadlines should feel cinematic, not chaotic.</h1>
          <p className="auth-hero-copy">
            Build a command center for your priorities with focused sprints, cleaner analytics,
            and sharper urgency when the clock starts closing in.
          </p>

          <div className="auth-showcase-grid">
            <div className="auth-glass-card">
              <Gauge size={18} />
              <strong>Pressure Board</strong>
              <span>See what needs action first, not just what exists.</span>
            </div>
            <div className="auth-glass-card">
              <Target size={18} />
              <strong>Focused Sessions</strong>
              <span>Turn tasks into sprints with visible momentum.</span>
            </div>
            <div className="auth-glass-card">
              <Flame size={18} />
              <strong>Deadline Energy</strong>
              <span>Calm, hard, or savage mode depending on your vibe.</span>
            </div>
          </div>
        </section>

        <div className="auth-card card">
          <div className="auth-card-top">
            <p className="auth-panel-label">{isRegisterMode ? 'Create your board' : 'Welcome back'}</p>
            <h2 className="auth-panel-title">
              {isRegisterMode ? 'Spin up your focus system.' : 'Step back into the arena.'}
            </h2>
            <p className="auth-subtitle">
              {isRegisterMode
                ? 'Set your identity and we will shape the interface around how you work.'
                : 'Your deadlines, focus sessions, and task pressure are waiting.'}
            </p>
          </div>

          <div className={`auth-error ${error ? 'visible' : ''}`}>{error}</div>

          <form onSubmit={handleSubmit} autoComplete="off">
            {isRegisterMode && (
              <div className="form-group">
                <label className="form-label" htmlFor="authDisplayName">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  id="authDisplayName"
                  placeholder="How should CrushIt address you?"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="authEmail">Email</label>
              <input 
                type="email" 
                className="form-input" 
                id="authEmail" 
                placeholder="you@email.com" 
                required 
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="authPassword">Password</label>
              <input 
                type="password" 
                className="form-input" 
                id="authPassword" 
                placeholder="••••••••" 
                required 
                minLength="6"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            
            {isRegisterMode && (
              <div className="form-group" id="genderGroup">
                <label className="form-label">Tone Persona</label>
                <div className="gender-radios">
                  <label className="gender-option">
                    <input 
                      type="radio" 
                      name="authGender" 
                      value="male" 
                      checked={gender === 'male'} 
                      onChange={() => setGender('male')}
                    />
                    <span>Warrior Mode</span>
                  </label>
                  <label className="gender-option">
                    <input 
                      type="radio" 
                      name="authGender" 
                      value="female" 
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                    />
                    <span>Slayer Mode</span>
                  </label>
                </div>
              </div>
            )}
            
            <button type="submit" className="form-submit auth-submit" disabled={loading}>
              {loading ? (isRegisterMode ? 'Creating...' : 'Signing in...') : (isRegisterMode ? 'Launch Dashboard' : 'Log In')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 12px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            <button 
              type="button" 
              className="form-submit" 
              onClick={handleGoogleSignIn} 
              disabled={loading} 
              style={{ 
                background: 'var(--card-bg)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-color)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            
            <button 
              type="button" 
              className="auth-toggle-btn" 
              onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
              {isRegisterMode ? (
                <>Already have an account? <strong>Log In</strong></>
              ) : (
                <>New here? <strong>Create your workspace</strong></>
              )}
            </button>
          </form>

          <div className="auth-footer-note">
            <Sparkles size={14} />
            <span>Built by <strong>{STUDENT_NAME_ParvYadav}</strong> ({REG_NO_24BCI0231}) for sharper structure.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
