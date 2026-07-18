const request = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const registerUser = (username, email, password) =>
  request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });

export const loginUser = (email, password) =>
  request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const fetchTasks = () => request('/api/tasks');

export const createTask = (task) =>
  request('/api/tasks', { method: 'POST', body: JSON.stringify(task) });

export const updateTask = (id, patch) =>
  request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(patch) });

export const deleteTask = (id) =>
  request(`/api/tasks/${id}`, { method: 'DELETE' });

export const fetchSavings = () => request('/api/savings');

export const createSavingsEntry = (entry) =>
  request('/api/savings', { method: 'POST', body: JSON.stringify(entry) });
