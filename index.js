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
// Use __dirname so it works on Vercel and other deployment platforms
app.use(express.static(path.join(__dirname, 'public')));

// Authentication routes (signup/login)
app.use('/api/auth', authRoutes);

// Savings routes
app.use('/api/savings', savingsRoutes);

// Tasks routes
app.use('/api/tasks', taskRoutes);

// Send React app for any non-API route (SPA fallback)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).send('API route not found');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port configuration
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;