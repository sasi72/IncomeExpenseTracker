import express from 'express';
import cors from 'cors';
import { initDatabase, getDb } from './database.js';
import { transactionsRouter } from './routes/transactions.js';
import { reportsRouter } from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

