import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import postRoute from './routes/postRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import commentRoute from './routes/commentRoute.js';
import likeRoute from './routes/likeRoute.js';
import userRoute from './routes/userRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/posts', postRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/comments', commentRoute);
app.use('/api/likes', likeRoute);
app.use('/api/users', userRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔒 CORS enabled for: ${CORS_ORIGIN}`);
});

export default app;
