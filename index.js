const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

// Route modules
const authRoutes = require('./routes/authRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();

const app = express();

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Basic session setup
app.use(
  session({
    secret: 'very_secret_key', // later move to .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true only when you use HTTPS
  })
);

// Serve static files (HTML, CSS, JS) from the "public" folder
// Make sure "public" is at the same level as index.js
app.use(express.static('public'));

// Manual test route to serve test.html directly
app.get('/test-manual', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Home route (API-only)
app.get('/', (req, res) => {
  res.send('Personal Life Manager API is running');
});

// Authentication routes (signup/login)
app.use('/api/auth', authRoutes);

// Savings routes
app.use('/api/savings', savingsRoutes);

// Tasks routes
app.use('/api/tasks', taskRoutes);

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});