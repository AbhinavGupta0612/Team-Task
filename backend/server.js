const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "*", // 🔥 Railway test ke liye open rakh
  credentials: true
}));
app.use(express.json());

// Routes
//app.use('/api/auth', require('./routes/auth'));
//app.use('/api/projects', require('./routes/projects'));
//app.use('/api/tasks', require('./routes/tasks'));
//app.use('/api/users', require('./routes/users'));

// Root Route (IMPORTANT)
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// 🔥 MongoDB + Server start
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing ❌");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server start error:', err.message);
    process.exit(1);
  }
};

startServer();