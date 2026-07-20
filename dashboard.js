/**
 * Life Manager – dashboard
 * Per-user localStorage keys: lm-tasks-{userId}, lm-habits-{userId}, lm-goals-{userId}, lm-notes-{userId}
 */

const currentUser = requireAuth();
if (!currentUser) throw new Error('Not authenticated');

document.getElementById('greeting').textContent = `Hi, ${currentUser.username}`;

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(LM_KEYS.CURRENT_USER);
  window.location.href = 'index.html';
});

// ── Due date reminders ──

checkDueReminders(currentUser.id);

// Re-check every 30 minutes while dashboard is open
setInterval(() => checkDueReminders(currentUser.id), 30 * 60 * 1000);

// ── Tasks ──

const tasksKey = storageKey('tasks');
const tasksList = document.getElementById('tasks-list');

function renderTasks() {
  const tasks = loadData(tasksKey) || [];
  tasksList.innerHTML = '';

  if (tasks.length === 0) {
    tasksList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
    return;
  }

  tasks.forEach((task) => {
    const status = taskDueStatus(task.dueDate, task.completed);
    const li = document.createElement('li');
    li.className = 'item' + (task.completed ? ' completed' : '') + (status ? ` ${status}` : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const body = document.createElement('div');
    body.className = 'item-body';

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = task.title;
    body.appendChild(title);

    if (task.dueDate) {
      const meta = document.createElement('div');
      meta.className = 'item-meta';
      let dueText = `Due: ${formatDate(task.dueDate)}`;
      if (status === 'overdue') dueText += ' · Overdue';
      else if (status === 'due-today') dueText += ' · Due today';
      meta.textContent = dueText;
      body.appendChild(meta);
    }

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, deleteBtn);
    li.append(checkbox, body, actions);
    tasksList.appendChild(li);
  });
}

function toggleTask(id) {
  const tasks = loadData(tasksKey) || [];
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  saveData(tasksKey, tasks);
  renderTasks();
}

function editTask(id) {
  const tasks = loadData(tasksKey) || [];
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const newTitle = prompt('Edit task title:', task.title);
  if (newTitle === null) return;
  if (!newTitle.trim()) return;

  task.title = newTitle.trim();
  saveData(tasksKey, tasks);
  renderTasks();
}

function deleteTask(id) {
  saveData(tasksKey, (loadData(tasksKey) || []).filter((t) => t.id !== id));
  renderTasks();
}

document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const dueDate = document.getElementById('task-due').value || null;
  if (!title) return;

  const tasks = loadData(tasksKey) || [];
  tasks.unshift({ id: generateId(), title, dueDate, completed: false });
  saveData(tasksKey, tasks);
  e.target.reset();
  renderTasks();
  checkDueReminders(currentUser.id);
});

// ── Habits ──

const habitsKey = storageKey('habits');
const habitsList = document.getElementById('habits-list');

function calcStreak(completions) {
  if (!completions || completions.length === 0) return 0;

  const sorted = [...completions].sort().reverse();
  let streak = 0;
  let check = todayStr();

  if (sorted[0] !== check) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    check = yesterday.toISOString().slice(0, 10);
  }

  for (const date of sorted) {
    if (date === check) {
      streak++;
      const prev = new Date(check + 'T00:00:00');
      prev.setDate(prev.getDate() - 1);
      check = prev.toISOString().slice(0, 10);
    } else if (date < check) {
      break;
    }
  }

  return streak;
}

function renderHabits() {
  const habits = loadData(habitsKey) || [];
  habitsList.innerHTML = '';

  if (habits.length === 0) {
    habitsList.innerHTML = '<li class="empty-state">No habits yet. Start building one!</li>';
    return;
  }

  const today = todayStr();

  habits.forEach((habit) => {
    const doneToday = (habit.completions || []).includes(today);
    const streak = calcStreak(habit.completions || []);

    const li = document.createElement('li');
    li.className = 'item';

    const body = document.createElement('div');
    body.className = 'item-body';

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = habit.name;
    body.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'item-meta';
    const streakBadge = document.createElement('span');
    streakBadge.className = 'habit-streak';
    streakBadge.textContent = `${streak} day streak`;
    meta.appendChild(streakBadge);
    body.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn btn-primary btn-sm';
    doneBtn.textContent = doneToday ? 'Done ✓' : 'Mark Done';
    doneBtn.disabled = doneToday;
    doneBtn.addEventListener('click', () => markHabitDone(habit.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteHabit(habit.id));

    actions.append(doneBtn, deleteBtn);
    li.append(body, actions);
    habitsList.appendChild(li);
  });
}

function markHabitDone(id) {
  const habits = loadData(habitsKey) || [];
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  if (!habit.completions) habit.completions = [];
  const today = todayStr();
  if (!habit.completions.includes(today)) {
    habit.completions.push(today);
  }

  saveData(habitsKey, habits);
  renderHabits();
}

function deleteHabit(id) {
  saveData(habitsKey, (loadData(habitsKey) || []).filter((h) => h.id !== id));
  renderHabits();
}

document.getElementById('habit-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('habit-name').value.trim();
  if (!name) return;

  const habits = loadData(habitsKey) || [];
  habits.push({ id: generateId(), name, completions: [] });
  saveData(habitsKey, habits);
  e.target.reset();
  renderHabits();
});

// ── Goals ──

const goalsKey = storageKey('goals');
const goalsList = document.getElementById('goals-list');

function renderGoals() {
  const goals = loadData(goalsKey) || [];
  goalsList.innerHTML = '';

  if (goals.length === 0) {
    goalsList.innerHTML = '<li class="empty-state">No goals yet. Set one above!</li>';
    return;
  }

  goals.forEach((goal) => {
    const li = document.createElement('li');
    li.className = 'item';

    const body = document.createElement('div');
    body.className = 'item-body';

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = goal.title;
    body.appendChild(title);

    if (goal.description) {
      const desc = document.createElement('div');
      desc.className = 'item-meta';
      desc.textContent = goal.description;
      body.appendChild(desc);
    }

    if (goal.targetDate) {
      const meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.textContent = `Target: ${formatDate(goal.targetDate)}`;
      body.appendChild(meta);
    }

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const fill = document.createElement('div');
    fill.className = 'progress-bar-fill';
    fill.style.width = `${goal.progress || 0}%`;
    progressBar.appendChild(fill);
    body.appendChild(progressBar);

    const progressRow = document.createElement('div');
    progressRow.className = 'progress-input';
    const range = document.createElement('input');
    range.type = 'range';
    range.min = 0;
    range.max = 100;
    range.value = goal.progress || 0;
    const label = document.createElement('span');
    label.className = 'item-meta';
    label.textContent = `${goal.progress || 0}%`;
    range.addEventListener('input', () => {
      const val = parseInt(range.value, 10);
      label.textContent = `${val}%`;
      fill.style.width = `${val}%`;
    });
    range.addEventListener('change', () => updateGoalProgress(goal.id, parseInt(range.value, 10)));
    progressRow.append(range, label);
    body.appendChild(progressRow);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editGoal(goal.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteGoal(goal.id));

    actions.append(editBtn, deleteBtn);
    li.append(body, actions);
    goalsList.appendChild(li);
  });
}

function updateGoalProgress(id, progress) {
  const goals = loadData(goalsKey) || [];
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;
  goal.progress = progress;
  saveData(goalsKey, goals);
}

function editGoal(id) {
  const goals = loadData(goalsKey) || [];
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  const newTitle = prompt('Edit goal title:', goal.title);
  if (newTitle === null) return;
  if (!newTitle.trim()) return;

  goal.title = newTitle.trim();
  saveData(goalsKey, goals);
  renderGoals();
}

function deleteGoal(id) {
  saveData(goalsKey, (loadData(goalsKey) || []).filter((g) => g.id !== id));
  renderGoals();
}

document.getElementById('goal-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('goal-title').value.trim();
  const description = document.getElementById('goal-description').value.trim();
  const targetDate = document.getElementById('goal-target').value || null;
  const progress = Math.min(100, Math.max(0, parseInt(document.getElementById('goal-progress').value, 10) || 0));
  if (!title) return;

  const goals = loadData(goalsKey) || [];
  goals.unshift({ id: generateId(), title, description, targetDate, progress });
  saveData(goalsKey, goals);
  e.target.reset();
  document.getElementById('goal-progress').value = 0;
  renderGoals();
});

// ── Notes ──

const notesKey = storageKey('notes');
const notesList = document.getElementById('notes-list');
const MAX_NOTES_DISPLAY = 5;

function renderNotes() {
  const notes = loadData(notesKey) || [];
  notesList.innerHTML = '';

  if (notes.length === 0) {
    notesList.innerHTML = '<li class="empty-state">No notes yet. Jot something down!</li>';
    return;
  }

  notes.slice(0, MAX_NOTES_DISPLAY).forEach((note) => {
    const li = document.createElement('li');
    li.className = 'note-item';

    const text = document.createElement('div');
    text.textContent = note.text;

    const date = document.createElement('div');
    date.className = 'note-date';
    date.textContent = new Date(note.createdAt).toLocaleString();

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    actions.style.marginTop = '0.5rem';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteNote(note.id));

    actions.appendChild(deleteBtn);
    li.append(text, date, actions);
    notesList.appendChild(li);
  });
}

function deleteNote(id) {
  saveData(notesKey, (loadData(notesKey) || []).filter((n) => n.id !== id));
  renderNotes();
}

document.getElementById('note-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('note-text').value.trim();
  if (!text) return;

  const notes = loadData(notesKey) || [];
  notes.unshift({ id: generateId(), text, createdAt: new Date().toISOString() });
  saveData(notesKey, notes);
  e.target.reset();
  renderNotes();
});

// ── Initial render ──

renderTasks();
renderHabits();
renderGoals();
renderNotes();
