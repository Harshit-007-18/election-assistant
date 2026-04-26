const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/user');
const timelineRoutes = require('./routes/timeline');
const guideRoutes = require('./routes/guides');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/election-assistant')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use('/api/message', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/guides', guideRoutes);

// --- NEW: Serve Frontend in Production ---
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// All other requests go to React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
