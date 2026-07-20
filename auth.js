/**
 * Life Manager – auth (login / signup)
 * Storage keys: lm-users, lm-current-user
 */

const USERS_KEY = 'lm-users';
const CURRENT_USER_KEY = 'lm-current-user';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
  }));
}

function showMessage(text, type) {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = text;
  el.className = 'message' + (type ? ` ${type}` : '');
}

// Redirect if already logged in
if (getCurrentUser()) {
  window.location.href = 'dashboard.html';
}

// Tab switching
document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.auth-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${target}-panel`).classList.add('active');
    showMessage('');
  });
});

// Signup
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;

  if (!username || !email || !password) {
    showMessage('Please fill in all signup fields.', 'error');
    return;
  }

  if (password.length < 4) {
    showMessage('Password must be at least 4 characters.', 'error');
    return;
  }

  const users = getUsers();

  if (users.some((u) => u.email === email)) {
    showMessage('An account with this email already exists.', 'error');
    return;
  }

  users.push({ id: generateId(), username, email, password });
  saveUsers(users);

  showMessage('Signup successful! You can now log in.', 'success');
  e.target.reset();

  // Switch to login tab after signup
  document.querySelector('[data-tab="login"]').click();
  document.getElementById('login-email').value = email;
});

// Login
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showMessage('Please enter email and password.', 'error');
    return;
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    showMessage('Invalid email or password.', 'error');
    return;
  }

  setCurrentUser(user);
  window.location.href = 'dashboard.html';
});
