require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const mindmapRoutes = require('./routes/mindmaps');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/api/mindmaps', mindmapRoutes);

// Compatibility with old frontend route if any
app.post('/jpa/login', (req, res) => {
  // redirecting old path to new auth path just in case
  res.redirect(307, '/auth/login');
});
app.post('/jpa/register', (req, res) => {
  res.redirect(307, '/auth/register');
});

app.get('/', (req, res) => {
  res.status(200).json({success:true, message:"Hello World!"})
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

