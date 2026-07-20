/**
 * Life Manager – shared utilities
 * Used by dashboard, settings, and auth pages.
 */

const LM_KEYS = {
  USERS: 'lm-users',
  CURRENT_USER: 'lm-current-user',
  THEME: 'lm-theme',
};

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(LM_KEYS.CURRENT_USER));
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(LM_KEYS.CURRENT_USER, JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
  }));
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(LM_KEYS.USERS) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(LM_KEYS.USERS, JSON.stringify(users));
}

function storageKey(suffix, userId) {
  const id = userId || getCurrentUser()?.id;
  return `lm-${suffix}-${id}`;
}

function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

const DEFAULT_SETTINGS = {
  notificationsEnabled: false,
  theme: 'dark',
  reminderHour: 9,
};

function getSettings(userId) {
  const key = storageKey('settings', userId);
  const saved = loadData(key);
  return { ...DEFAULT_SETTINGS, ...saved };
}

function saveSettings(userId, settings) {
  saveData(storageKey('settings', userId), settings);
  localStorage.setItem(LM_KEYS.THEME, settings.theme);
  applyTheme(settings.theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme || 'dark');
}

function initTheme() {
  const user = getCurrentUser();
  const theme = user
    ? getSettings(user.id).theme
    : (localStorage.getItem(LM_KEYS.THEME) || 'dark');
  applyTheme(theme);
}

function getRemindedKey(userId) {
  return storageKey('reminded', userId);
}

/** Returns map of taskId -> date string when notification was sent */
function getRemindedMap(userId) {
  return loadData(getRemindedKey(userId)) || {};
}

function markReminded(userId, taskId) {
  const map = getRemindedMap(userId);
  map[taskId] = todayStr();
  saveData(getRemindedKey(userId), map);
}

function taskDueStatus(dueDate, completed) {
  if (!dueDate || completed) return null;
  const today = todayStr();
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'due-today';
  return 'upcoming';
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

function showTaskNotification(task) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const status = taskDueStatus(task.dueDate, task.completed);
  const label = status === 'overdue' ? 'Overdue' : 'Due today';
  new Notification(`Life Manager – ${label}`, {
    body: task.title,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>',
    tag: `lm-task-${task.id}`,
  });
}

function checkDueReminders(userId) {
  const settings = getSettings(userId);
  if (!settings.notificationsEnabled) return;
  if (Notification.permission !== 'granted') return;

  const tasks = loadData(storageKey('tasks', userId)) || [];
  const reminded = getRemindedMap(userId);
  const today = todayStr();

  tasks.forEach((task) => {
    if (task.completed || !task.dueDate) return;
    const status = taskDueStatus(task.dueDate, task.completed);
    if (status !== 'overdue' && status !== 'due-today') return;
    if (reminded[task.id] === today) return;

    showTaskNotification(task);
    markReminded(userId, task.id);
  });
}

initTheme();
