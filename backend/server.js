const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
