/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  GoogleAuthProvider,
  signInWithPopup
} from '../firebase';

const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register(email, password, gender = 'male', displayName = '') {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const resolvedName = displayName.trim() || email.split('@')[0];

    await updateProfile(userCred.user, {
      displayName: resolvedName,
    });

    await setDoc(doc(db, 'users', userCred.user.uid), {
      email,
      gender,
      displayName: resolvedName,
      createdAt: serverTimestamp(),
    });
    return userCred;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    return signOut(auth);
  }

  async function saveProfile({ displayName, gender }) {
    if (!auth.currentUser) return;

    const resolvedName = displayName.trim() || auth.currentUser.email?.split('@')[0] || 'Operator';

    await updateProfile(auth.currentUser, {
      displayName: resolvedName,
    });

    const nextProfile = {
      email: auth.currentUser.email,
      gender,
      displayName: resolvedName,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', auth.currentUser.uid), nextProfile, { merge: true });

    setCurrentUser({
      ...auth.currentUser,
      displayName: resolvedName,
    });

    setProfile((current) => ({
      ...(current || {}),
      ...nextProfile,
      updatedAt: new Date(),
    }));
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Auto-create user profile if it doesn't exist
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const fallbackName = user.displayName || user.email?.split('@')[0] || 'Operator';

        if (!userSnap.exists()) {
          const nextProfile = {
            email: user.email,
            gender: 'male',
            displayName: fallbackName,
            createdAt: serverTimestamp(),
          };

          await setDoc(userRef, nextProfile);
          setProfile(nextProfile);
        } else {
          setProfile(userSnap.data());
        }
      } else {
        setProfile(null);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    profile,
    login,
    loginWithGoogle,
    register,
    logout,
    saveProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
