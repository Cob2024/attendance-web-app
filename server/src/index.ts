import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/authRoutes.js';
import { courseRouter } from './routes/courseRoutes.js';
import { attendanceRouter } from './routes/attendanceRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartAttend API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`🚀 SmartAttend Production Server running on port ${PORT}`);
});
