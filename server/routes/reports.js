import express from 'express';
import { dbAll } from '../database.js';
import PDFDocument from 'pdfkit';
import { createObjectCsvStringifier } from 'csv-writer';

export const reportsRouter = express.Router();

// Get monthly transactions
reportsRouter.get('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const transactions = await dbAll(
      `SELECT * FROM transactions 
       WHERE date >= ? AND date < date(?, '+1 month')
       ORDER BY date DESC`,
      [startDate, startDate]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching monthly transactions:', error);
    res.status(500).json({ error: 'Failed to fetch monthly transactions' });
  }
});

// Download monthly report as PDF
reportsRouter.get('/monthly/:year/:month/pdf', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;

    const transactions = await dbAll(
      `SELECT * FROM transactions 
       WHERE date >= ? AND date < date(?, '+1 month')
       ORDER BY date DESC`,
      [startDate, startDate]
    );

    const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${year}-${month}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Monthly Income & Expense Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(monthName, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total Income: ₹${income.toFixed(2)}`, { indent: 20 });
    doc.text(`Total Expenses: ₹${expenses.toFixed(2)}`, { indent: 20 });
    doc.text(`Balance: ₹${balance.toFixed(2)}`, { indent: 20 });
    doc.moveDown(2);

    // Transactions
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.moveDown(0.5);

    if (transactions.length === 0) {
      doc.fontSize(12).text('No transactions for this month.', { indent: 20 });
    } else {
      transactions.forEach((transaction, index) => {
        const date = new Date(transaction.date).toLocaleDateString('en-IN');
        const type = transaction.type === 'income' ? 'Income' : 'Expense';
        const amount = transaction.type === 'income' 
          ? `+₹${transaction.amount.toFixed(2)}` 
          : `-₹${transaction.amount.toFixed(2)}`;

        doc.fontSize(10);
        doc.text(`${date} - ${type}`, { indent: 20 });
        doc.text(`${transaction.description}: ${amount}`, { indent: 40 });
        
        if (index < transactions.length - 1) {
          doc.moveDown(0.3);
        }
      });
    }

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

// Download monthly report as CSV
reportsRouter.get('/monthly/:year/:month/csv', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;

    const transactions = await dbAll(
      `SELECT * FROM transactions 
       WHERE date >= ? AND date < date(?, '+1 month')
       ORDER BY date DESC`,
      [startDate, startDate]
    );

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    // Create CSV
    const csvWriter = createObjectCsvStringifier({
      header: [
        { id: 'date', title: 'Date' },
        { id: 'description', title: 'Description' },
        { id: 'type', title: 'Type' },
        { id: 'amount', title: 'Amount (₹)' }
      ]
    });

    const csvData = transactions.map(t => ({
      date: new Date(t.date).toLocaleDateString('en-IN'),
      description: t.description,
      type: t.type === 'income' ? 'Income' : 'Expense',
      amount: t.amount.toFixed(2)
    }));

    let csv = csvWriter.getHeaderString();
    csv += csvWriter.stringifyRecords(csvData);
    csv += `\n\nSummary\n`;
    csv += `Total Income,₹${income.toFixed(2)}\n`;
    csv += `Total Expenses,₹${expenses.toFixed(2)}\n`;
    csv += `Balance,₹${balance.toFixed(2)}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${year}-${month}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to generate CSV report' });
  }
});

