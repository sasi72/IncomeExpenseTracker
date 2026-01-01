# Income & Expense Tracker

A modern, responsive full-stack web application to track your daily income and expenses with database persistence and monthly report generation.

## Features

- 💰 Track income and expenses
- 📊 Real-time balance calculation
- 💾 SQLite database persistence
- 📱 Fully responsive design
- 🎨 Modern liquid/glassmorphism UI
- ✨ Smooth animations and transitions
- 📄 Download monthly reports as PDF
- 📊 Download monthly reports as CSV
- 🇮🇳 Indian currency (₹) support

## Tech Stack

### Frontend
- React 18
- Vite
- Modern CSS with glassmorphism effects

### Backend
- Node.js
- Express.js
- SQLite3
- PDFKit (for PDF reports)
- CSV Writer (for CSV reports)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

The application runs both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

### Individual Commands

If you need to run them separately:

```bash
# Backend only
npm run dev:server

# Frontend only
npm run dev:client
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary/stats` - Get summary statistics

### Reports
- `GET /api/reports/monthly/:year/:month` - Get monthly transactions
- `GET /api/reports/monthly/:year/:month/pdf` - Download monthly PDF report
- `GET /api/reports/monthly/:year/:month/csv` - Download monthly CSV report

## Database

The application uses SQLite database stored in `server/expense_tracker.db`. The database is automatically created on first run.

### Database Schema

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## Usage

1. **Add Transactions**: Enter description, amount, and select type (Income/Expense)
2. **View Summary**: See balance, total income, and total expenses at the top
3. **Download Reports**: 
   - Select year and month
   - Click "Download PDF" or "Download CSV" to get monthly reports
4. **Delete Transactions**: Click the delete button (🗑️) on any transaction

## Monthly Reports

Monthly reports include:
- All transactions for the selected month
- Summary with total income, expenses, and balance
- Formatted dates and amounts in Indian currency (₹)

Reports are available in two formats:
- **PDF**: Formatted document with summary and transaction list
- **CSV**: Spreadsheet-compatible format for data analysis

## Project Structure

```
IncomeExpenseTracker/
├── server/
│   ├── index.js              # Express server entry point
│   ├── database.js           # Database initialization and utilities
│   └── routes/
│       ├── transactions.js   # Transaction API routes
│       └── reports.js        # Report generation routes
├── src/
│   ├── App.jsx               # Main React component
│   ├── App.css               # Styles
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Notes

- The database file (`expense_tracker.db`) is created automatically in the `server` directory
- All amounts are displayed in Indian Rupees (₹)
- Dates are formatted in Indian locale (en-IN)
- Reports are generated on-demand when downloaded
