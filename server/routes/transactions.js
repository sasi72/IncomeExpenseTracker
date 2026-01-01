import express from 'express';
import { dbRun, dbAll, dbGet } from '../database.js';

export const transactionsRouter = express.Router();

// Get all transactions
transactionsRouter.get('/', async (req, res) => {
  try {
    const transactions = await dbAll(
      'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
    );
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
transactionsRouter.get('/:id', async (req, res) => {
  try {
    const transaction = await dbGet('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create new transaction
transactionsRouter.post('/', async (req, res) => {
  try {
    const { description, amount, type } = req.body;

    if (!description || amount === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    const date = new Date().toISOString();
    const result = await dbRun(
      'INSERT INTO transactions (description, amount, type, date) VALUES (?, ?, ?, ?)',
      [description, amount, type, date]
    );

    const newTransaction = await dbGet('SELECT * FROM transactions WHERE id = ?', [result.id]);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
transactionsRouter.put('/:id', async (req, res) => {
  try {
    const { description, amount, type } = req.body;

    if (!description || amount === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await dbRun(
      'UPDATE transactions SET description = ?, amount = ?, type = ? WHERE id = ?',
      [description, amount, type, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updatedTransaction = await dbGet('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
transactionsRouter.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM transactions WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get summary statistics
transactionsRouter.get('/summary/stats', async (req, res) => {
  try {
    const income = await dbGet(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'"
    );
    const expenses = await dbGet(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'"
    );

    const balance = income.total - expenses.total;

    res.json({
      income: income.total,
      expenses: expenses.total,
      balance: balance
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

