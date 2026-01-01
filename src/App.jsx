import { useState, useEffect } from 'react'
import './App.css'

const API_BASE_URL = '/api'

function App() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense'
  })
  const [reportMonth, setReportMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })

  // Load transactions from API on mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/transactions`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Failed to load transactions. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? value : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.description.trim() || !formData.amount) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description.trim(),
          amount: parseFloat(formData.amount),
          type: formData.type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      const newTransaction = await response.json()
      setTransactions(prev => [newTransaction, ...prev])
      setFormData({
        description: '',
        amount: '',
        type: 'expense'
      })
    } catch (err) {
      console.error('Error creating transaction:', err)
      setError('Failed to add transaction. Please try again.')
    }
  }

  const handleDelete = async (id) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      setTransactions(prev => prev.filter(transaction => transaction.id !== id))
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setError('Failed to delete transaction. Please try again.')
    }
  }

  const handleDownloadReport = async (format) => {
    try {
      setError(null)
      const { year, month } = reportMonth
      const url = `${API_BASE_URL}/reports/monthly/${year}/${month}/${format}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `monthly-report-${year}-${String(month).padStart(2, '0')}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Error downloading report:', err)
      setError('Failed to download report. Please try again.')
    }
  }

  const calculateBalance = () => {
    return transactions.reduce((total, transaction) => {
      return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
    }, 0)
  }

  const calculateIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0)
  }

  const calculateExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0)
  }

  const balance = calculateBalance()
  const income = calculateIncome()
  const expenses = calculateExpenses()

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">💰 Income & Expense Tracker</h1>
          <p className="subtitle">Track your daily finances</p>
        </header>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        <div className="summary-cards">
          <div className="summary-card balance-card">
            <div className="card-icon">💵</div>
            <div className="card-content">
              <p className="card-label">Balance</p>
              <p className={`card-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                ₹{Math.abs(balance).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="summary-card income-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <p className="card-label">Income</p>
              <p className="card-value positive">₹{income.toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card expense-card">
            <div className="card-icon">📉</div>
            <div className="card-content">
              <p className="card-label">Expenses</p>
              <p className="card-value negative">₹{expenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <div className="type-buttons">
                <button
                  type="button"
                  className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                >
                  💰 Income
                </button>
                <button
                  type="button"
                  className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                >
                  💸 Expense
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Add Transaction
            </button>
          </form>
        </div>

        <div className="reports-container">
          <div className="reports-header">
            <h2 className="reports-title">📊 Monthly Reports</h2>
            <div className="report-selectors">
              <select
                value={reportMonth.year}
                onChange={(e) => setReportMonth(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="report-select"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={reportMonth.month}
                onChange={(e) => setReportMonth(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="report-select"
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div className="report-buttons">
              <button
                onClick={() => handleDownloadReport('pdf')}
                className="report-btn pdf-btn"
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => handleDownloadReport('csv')}
                className="report-btn csv-btn"
              >
                📊 Download CSV
              </button>
            </div>
          </div>
        </div>

        <div className="transactions-container">
          <div className="transactions-header">
            <h2 className="transactions-title">Recent Transactions</h2>
            {loading && <span className="loading-text">Loading...</span>}
          </div>
          {!loading && transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet. Add your first transaction above!</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className={`transaction-item ${transaction.type}`}
                >
                  <div className="transaction-content">
                    <div className="transaction-info">
                      <p className="transaction-description">{transaction.description}</p>
                      <p className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="delete-btn"
                    aria-label="Delete transaction"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
