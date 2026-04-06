/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from '../firebase';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function useTasks() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const q = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
    
    // Listen for realtime updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tasksData.push({
          id: docSnap.id, // For React rendering
          docId: docSnap.id,
          ...data,
        });
      });

      // Sort by createdAt descending in JS 
      tasksData.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });

      setTasks(tasksData);
      setLoading(false);
      
    }, (error) => {
      console.error('Failed to load tasks:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  async function addTask(taskData) {
    if (!currentUser) return;
    const newTask = {
      ...taskData,
      category: taskData.category || 'Deep Work',
      focusMinutes: Number(taskData.focusMinutes || 50),
      completed: false,
      completedAt: null,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
    };
    return await addDoc(collection(db, 'tasks'), newTask);
  }

  async function toggleTaskComplete(docId, isCompleted) {
    return await updateDoc(doc(db, 'tasks', docId), {
      completed: isCompleted,
      completedAt: isCompleted ? serverTimestamp() : null,
    });
  }

  async function deleteTaskItem(docId) {
    return await deleteDoc(doc(db, 'tasks', docId));
  }

  const value = {
    tasks: currentUser ? tasks : [],
    loading: currentUser ? loading : false,
    addTask,
    toggleTaskComplete,
    deleteTaskItem,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}
