/**
 * Life Manager – settings / profile page
 */

const currentUser = requireAuth();
if (!currentUser) throw new Error('Not authenticated');

document.getElementById('greeting').textContent = `Signed in as ${currentUser.username}`;

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(LM_KEYS.CURRENT_USER);
  window.location.href = 'index.html';
});

function showFormMessage(elId, text, type) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.className = 'message' + (type ? ` ${type}` : '');
}

// ── Load current values ──

const settings = getSettings(currentUser.id);
const users = getUsers();
const fullUser = users.find((u) => u.id === currentUser.id);

document.getElementById('profile-username').value = currentUser.username;
document.getElementById('profile-email').value = currentUser.email;
document.getElementById('theme-select').value = settings.theme;
document.getElementById('notifications-enabled').checked = settings.notificationsEnabled;
document.getElementById('reminder-hour').value = settings.reminderHour;

function updateNotificationStatus() {
  const el = document.getElementById('notification-status');
  if (!('Notification' in window)) {
    el.textContent = 'Notifications are not supported in this browser.';
    return;
  }
  const labels = {
    granted: 'Browser notifications are allowed.',
    denied: 'Notifications are blocked. Enable them in your browser settings.',
    default: 'Click "Allow browser notifications" to enable reminders.',
  };
  el.textContent = labels[Notification.permission] || labels.default;
}

updateNotificationStatus();

document.getElementById('enable-notifications-btn').addEventListener('click', async () => {
  const result = await requestNotificationPermission();
  updateNotificationStatus();
  if (result === 'granted') {
    document.getElementById('notifications-enabled').checked = true;
    showFormMessage('preferences-message', 'Notifications enabled!', 'success');
  } else if (result === 'denied') {
    showFormMessage('preferences-message', 'Notifications were denied.', 'error');
  } else if (result === 'unsupported') {
    showFormMessage('preferences-message', 'This browser does not support notifications.', 'error');
  }
});

// ── Profile form ──

document.getElementById('profile-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('profile-username').value.trim();
  if (!username) {
    showFormMessage('profile-message', 'Username cannot be empty.', 'error');
    return;
  }

  const allUsers = getUsers();
  const idx = allUsers.findIndex((u) => u.id === currentUser.id);
  if (idx === -1) return;

  allUsers[idx].username = username;
  saveUsers(allUsers);

  setCurrentUser({ ...currentUser, username });
  document.getElementById('greeting').textContent = `Signed in as ${username}`;
  showFormMessage('profile-message', 'Profile updated!', 'success');
});

// ── Password form ──

document.getElementById('password-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const current = document.getElementById('current-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;

  if (newPass.length < 4) {
    showFormMessage('password-message', 'New password must be at least 4 characters.', 'error');
    return;
  }

  if (newPass !== confirm) {
    showFormMessage('password-message', 'New passwords do not match.', 'error');
    return;
  }

  const allUsers = getUsers();
  const idx = allUsers.findIndex((u) => u.id === currentUser.id);
  if (idx === -1) return;

  if (allUsers[idx].password !== current) {
    showFormMessage('password-message', 'Current password is incorrect.', 'error');
    return;
  }

  allUsers[idx].password = newPass;
  saveUsers(allUsers);
  e.target.reset();
  showFormMessage('password-message', 'Password updated!', 'success');
});

// ── Preferences form ──

document.getElementById('preferences-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const notificationsEnabled = document.getElementById('notifications-enabled').checked;
  const theme = document.getElementById('theme-select').value;
  const reminderHour = Math.min(23, Math.max(0, parseInt(document.getElementById('reminder-hour').value, 10) || 9));

  if (notificationsEnabled && Notification.permission !== 'granted') {
    const result = await requestNotificationPermission();
    if (result !== 'granted') {
      showFormMessage('preferences-message', 'Enable browser notifications to use reminders.', 'error');
      return;
    }
  }

  saveSettings(currentUser.id, { notificationsEnabled, theme, reminderHour });
  showFormMessage('preferences-message', 'Preferences saved!', 'success');
  updateNotificationStatus();
});

// Live theme preview
document.getElementById('theme-select').addEventListener('change', (e) => {
  applyTheme(e.target.value);
});
