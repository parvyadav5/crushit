import { useEffect, useState } from 'react';
import { BellRing, Mail, MoonStar, Save, Smartphone, Sparkles, User2, AlignLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, getDoc } from '../firebase';
import { getStudentInfo_ParvYadav } from '../lib/ParvYadav_24BCI0231';

export default function SettingsPage_ParvYadav_24BCI0231({ onOpenSidebar }) {
  const { currentUser, profile, saveProfile } = useAuth();
  
  // Basic settings
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('male');
  
  // Notification & New settings
  const [emailReminders, setEmailReminders] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('23:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [tone, setTone] = useState('Motivational');
  
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Load from profile or defaults
    setDisplayName(
      currentUser?.displayName || profile?.displayName || currentUser?.email?.split('@')[0] || 'Operator'
    );
    setGender(profile?.gender || 'male');
    
    // Load advanced settings from firestore
    const loadSettings = async () => {
      const docRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.emailReminders !== undefined) setEmailReminders(data.emailReminders);
        if (data.pushNotifications !== undefined) setPushNotifications(data.pushNotifications);
        if (data.quietHoursStart !== undefined) setQuietHoursStart(data.quietHoursStart);
        if (data.quietHoursEnd !== undefined) setQuietHoursEnd(data.quietHoursEnd);
        if (data.tone !== undefined) setTone(data.tone);
      }
      setLoaded(true);
    };
    
    loadSettings();
  }, [currentUser, profile]);

  async function handleSave() {
    if (!currentUser) return;
    setSaving(true);
    try {
      // Save identity (updates auth profile and basic user doc implicitly via AuthContext)
      await saveProfile({ displayName, gender });
      
      // Save notification and new settings directly to the user document
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, {
        emailReminders,
        pushNotifications,
        quietHoursStart,
        quietHoursEnd,
        tone
      }, { merge: true });

      const studentInfo = getStudentInfo_ParvYadav();
      console.log(`[${studentInfo.regNo}] Preferences applied by ${studentInfo.name}`);

    } catch (e) {
      console.error('Error saving settings', e);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <>
        <div className="dash-header">
          <div className="header-left">
            <h1 className="greeting">Settings</h1>
            <p className="greeting-sub">Loading your preferences...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hamburger" onClick={onOpenSidebar}>
        <AlignLeft size={24} />
      </div>

      <div className="dash-header">
        <div className="header-left">
          <h1 className="greeting">Settings</h1>
          <p className="greeting-sub">Configure your environment and notifications.</p>
        </div>
      </div>

      <div className="top-row" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <h2 className="section-heading" style={{fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <User2 size={16} /> Identity
            </h2>
            <div style={{marginBottom: '16px'}}>
              <label style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block'}}>Display Name</label>
              <input
                className="settings-input"
                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-body)'}}
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div>
               <label style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block'}}>Avatar Style</label>
               <div className="toggle-switch" style={{display: 'inline-flex'}}>
                {['male', 'female'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`toggle-btn ${gender === option ? 'active' : ''}`}
                    onClick={() => setGender(option)}
                  >
                     {option === 'male' ? 'Warrior' : 'Slayer'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-heading" style={{fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Mail size={16} /> Reminders & Notifications
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                 <p style={{fontSize: '0.9rem', fontWeight: 600}}>Email Reminders</p>
                 <p style={{fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>Receive task approaching alerts</p>
              </div>
              <div className="toggle-switch">
                  <button className={`toggle-btn ${emailReminders ? 'active' : ''}`} onClick={() => setEmailReminders(true)}>On</button>
                  <button className={`toggle-btn ${!emailReminders ? 'active' : ''}`} onClick={() => setEmailReminders(false)}>Off</button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                 <p style={{fontSize: '0.9rem', fontWeight: 600}}>Push Notifications</p>
                 <p style={{fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>Browser/OS push alerts</p>
              </div>
              <div className="toggle-switch">
                  <button className={`toggle-btn ${pushNotifications ? 'active' : ''}`} onClick={() => setPushNotifications(true)}>On</button>
                  <button className={`toggle-btn ${!pushNotifications ? 'active' : ''}`} onClick={() => setPushNotifications(false)}>Off</button>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MoonStar size={16} style={{color: 'var(--text-tertiary)'}} />
                <p style={{fontSize: '0.9rem', fontWeight: 600}}>Quiet Hours</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>Start</label>
                  <input
                    type="time"
                    style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-body)'}}
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>End</label>
                  <input
                    type="time"
                    style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-body)'}}
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 className="section-heading" style={{fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <BellRing size={16} /> Notification Tone
            </h2>
            <p style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '16px'}}>
              Choose how the AI communicates your reminders.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {['Friendly', 'Strict', 'Motivational'].map(option => (
                 <div 
                   key={option} 
                   onClick={() => setTone(option)} 
                   style={{
                     padding: '16px', 
                     borderRadius: '8px', 
                     border: tone === option ? '2px solid var(--orange)' : '1px solid var(--border-color)',
                     background: tone === option ? 'var(--bg-body)' : 'transparent',
                     cursor: 'pointer'
                   }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{fontWeight: 600}}>{option}</p>
                      {tone === option && <Sparkles size={16} style={{color: 'var(--orange)'}} />}
                   </div>
                   <p style={{fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px'}}>
                     {option === 'Friendly' && 'Gentle nudges and soft encouragement.'}
                     {option === 'Strict' && 'No-nonsense alerts focusing purely on the impending deadline.'}
                     {option === 'Motivational' && 'High-energy hype and relentless encouragement to get it done.'}
                   </p>
                 </div>
               ))}
            </div>
          </div>

          <button 
             onClick={handleSave} 
             disabled={saving}
             style={{
               width: '100%', 
               padding: '16px', 
               background: 'var(--text-primary)', 
               color: 'white', 
               fontWeight: 600, 
               borderRadius: '12px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '8px',
               cursor: saving ? 'wait' : 'pointer',
               marginTop: 'auto'
             }}>
            <Save size={18} />
            {saving ? 'Saving Preferences...' : 'Save Settings'}
          </button>
        </div>

      </div>
    </>
  );
}
