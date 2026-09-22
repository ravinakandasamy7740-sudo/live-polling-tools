import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import { connectDatabase } from './config/db.js';
import { sendError } from './utils/apiResponse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running.',
    data: { status: 'ok' },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/poll', pollRoutes);

app.use((req, res) => {
  return sendError(res, 404, 'Route not found.');
});

app.use((err, req, res, next) => {
  console.error(err);
  return sendError(res, 500, err.message || 'Internal server error.');
});

connectDatabase().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}).catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1);
});

export default app;
