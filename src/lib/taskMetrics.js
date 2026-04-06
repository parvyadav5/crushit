const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getTaskDeadline(task) {
  if (!task?.deadline) return null;
  return task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
}

export function getTaskCompletedAt(task) {
  if (!task?.completedAt) return null;
  return task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
}

export function getTaskCreatedAt(task) {
  if (!task?.createdAt) return null;
  return task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
}

export function getHoursRemaining(task, now = new Date()) {
  const deadline = getTaskDeadline(task);
  if (!deadline) return null;
  return (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function getDaysRemaining(task, now = new Date()) {
  const hoursRemaining = getHoursRemaining(task, now);
  if (hoursRemaining === null) return null;
  return Math.ceil(hoursRemaining / 24);
}

export function isOverdue(task, now = new Date()) {
  const hoursRemaining = getHoursRemaining(task, now);
  return !task?.completed && hoursRemaining !== null && hoursRemaining < 0;
}

export function isDueToday(task, now = new Date()) {
  const deadline = getTaskDeadline(task);
  if (!deadline) return false;
  return deadline.toDateString() === now.toDateString();
}

export function isDueThisWeek(task, now = new Date()) {
  const deadline = getTaskDeadline(task);
  if (!deadline) return false;

  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return deadline >= startOfWeek && deadline < endOfWeek;
}

export function getUrgencyMeta(task, now = new Date()) {
  const hoursRemaining = getHoursRemaining(task, now);

  if (task?.completed) {
    return {
      tone: 'done',
      label: 'Closed',
      timeText: 'Completed',
    };
  }

  if (hoursRemaining === null) {
    return {
      tone: 'steady',
      label: 'Flexible',
      timeText: 'No deadline',
    };
  }

  if (hoursRemaining < 0) {
    const overdueHours = Math.abs(Math.round(hoursRemaining));
    return {
      tone: 'overdue',
      label: 'Past due',
      timeText: overdueHours >= 24
        ? `${Math.ceil(overdueHours / 24)}d overdue`
        : `${Math.max(1, overdueHours)}h overdue`,
    };
  }

  if (hoursRemaining <= 8) {
    return {
      tone: 'critical',
      label: 'Critical',
      timeText: `${Math.max(1, Math.ceil(hoursRemaining))}h left`,
    };
  }

  if (hoursRemaining <= 24) {
    return {
      tone: 'today',
      label: 'Due today',
      timeText: `${Math.ceil(hoursRemaining)}h left`,
    };
  }

  if (hoursRemaining <= 72) {
    return {
      tone: 'soon',
      label: 'On deck',
      timeText: `${Math.ceil(hoursRemaining / 24)}d left`,
    };
  }

  return {
    tone: 'steady',
    label: 'In runway',
    timeText: `${Math.ceil(hoursRemaining / 24)}d left`,
  };
}

export function sortTasksByUrgency(tasks) {
  return [...tasks].sort((a, b) => {
    const aDeadline = getTaskDeadline(a);
    const bDeadline = getTaskDeadline(b);
    const aPriority = PRIORITY_WEIGHT[a.priority] ?? 0;
    const bPriority = PRIORITY_WEIGHT[b.priority] ?? 0;

    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (aDeadline && bDeadline && aDeadline.getTime() !== bDeadline.getTime()) {
      return aDeadline.getTime() - bDeadline.getTime();
    }
    if (aDeadline && !bDeadline) return -1;
    if (!aDeadline && bDeadline) return 1;
    if (aPriority !== bPriority) return bPriority - aPriority;

    const aCreated = getTaskCreatedAt(a)?.getTime() ?? 0;
    const bCreated = getTaskCreatedAt(b)?.getTime() ?? 0;
    return bCreated - aCreated;
  });
}

export function getTaskMetrics(tasks, now = new Date()) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const overdue = tasks.filter((task) => isOverdue(task, now)).length;
  const dueToday = tasks.filter((task) => isDueToday(task, now) && !task.completed).length;
  const dueThisWeek = tasks.filter((task) => isDueThisWeek(task, now) && !task.completed).length;
  const highPriority = tasks.filter(
    (task) => !task.completed && (task.priority || 'medium') === 'high',
  ).length;
  const focusMinutes = tasks.reduce(
    (sum, task) => sum + (task.completed ? 0 : Number(task.focusMinutes || 0)),
    0,
  );
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pressureScore = Math.min(
    100,
    highPriority * 12 + overdue * 20 + dueToday * 10 + Math.max(0, active - completed) * 2,
  );

  return {
    total,
    completed,
    active,
    overdue,
    dueToday,
    dueThisWeek,
    highPriority,
    focusMinutes,
    completionRate,
    pressureScore,
  };
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function getWeeklyTimeline(tasks, now = new Date()) {
  const today = startOfDay(now);
  const start = new Date(today);
  start.setDate(today.getDate() - 3);

  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);

    const dueTasks = tasks.filter((task) => {
      const deadline = getTaskDeadline(task);
      return deadline ? isSameDay(deadline, day) : false;
    });

    const completedTasks = tasks.filter((task) => {
      const completedAt = getTaskCompletedAt(task);
      return completedAt ? isSameDay(completedAt, day) : false;
    });

    return {
      key: day.toISOString(),
      label: DAY_LABELS[day.getDay()],
      dayNumber: day.getDate(),
      isToday: isSameDay(day, today),
      dueCount: dueTasks.length,
      completedCount: completedTasks.length,
      activeCount: dueTasks.filter((task) => !task.completed).length,
      intensity: Math.min(3, dueTasks.length),
      day,
    };
  });
}

export function buildNotifications(tasks, now = new Date()) {
  const items = [];
  const sorted = sortTasksByUrgency(tasks, now);

  sorted
    .filter((task) => isOverdue(task, now))
    .slice(0, 2)
    .forEach((task) => {
      items.push({
        id: `overdue-${task.id}`,
        kind: 'alert',
        title: `${task.title} slipped past its deadline`,
        meta: getUrgencyMeta(task, now).timeText,
      });
    });

  sorted
    .filter((task) => !task.completed && isDueToday(task, now))
    .slice(0, 2)
    .forEach((task) => {
      items.push({
        id: `today-${task.id}`,
        kind: 'reminder',
        title: `${task.title} is due today`,
        meta: getUrgencyMeta(task, now).timeText,
      });
    });

  const recentlyCompleted = sorted
    .filter((task) => task.completed)
    .slice(0, 2);

  recentlyCompleted.forEach((task) => {
    items.push({
      id: `done-${task.id}`,
      kind: 'task',
      title: `${task.title} is locked in`,
      meta: 'Momentum added to your board',
    });
  });

  if (items.length === 0) {
    items.push({
      id: 'calm-board',
      kind: 'task',
      title: 'Board is calm right now',
      meta: 'No urgent pressure. Keep stacking small wins.',
    });
  }

  return items.slice(0, 5);
}

export function calculateStreak(tasks) {
  const completedTasks = tasks.filter(t => t.completed && t.completedAt);
  if (completedTasks.length === 0) return 0;

  const completedDates = new Set(
    completedTasks.map(t => {
      const d = getTaskCompletedAt(t);
      if (!d) return null;
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }).filter(Boolean)
  );

  let tempStreak = 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Check if today has completions
  if (completedDates.has(now.getTime())) {
    tempStreak++;
    now.setDate(now.getDate() - 1);
  } else {
    // If today doesn't, maybe yesterday does (streak is active but not extended yet today)
    now.setDate(now.getDate() - 1);
    if (!completedDates.has(now.getTime())) return 0; // Streak broken
  }

  // Count backwards
  while (completedDates.has(now.getTime())) {
    tempStreak++;
    now.setDate(now.getDate() - 1);
  }

  return tempStreak;
}
