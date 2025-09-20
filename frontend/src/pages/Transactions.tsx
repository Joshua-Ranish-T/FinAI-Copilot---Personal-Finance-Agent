import React, { useState, useEffect } from 'react';
import { Card, Typography, TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, Tooltip } from '@mui/material';
import { Search, Filter, Download, Refresh, CreditCard, TrendingUp, TrendingDown, MoreHoriz } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Transactions.css';
import axios from 'axios';

// Define transaction type
interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  time: string;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  account: string;
  description?: string;
}

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Categories for filtering
  const categories = ['all', 'Food', 'Transport', 'Shopping', 'Subscription', 'Entertainment', 'Income', 'Other'];
  
  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call to the backend
        // For now, we'll simulate with mock data
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            amount: 45.50,
            merchant: 'Starbucks Coffee',
            category: 'Food',
            date: '2023-10-15',
            time: '09:30 AM',
            type: 'debit',
            status: 'completed',
            account: 'Main Account',
            description: 'Morning coffee'
          },
          {
            id: '2',
            amount: 1200.00,
            merchant: 'ABC Company',
            category: 'Income',
            date: '2023-10-14',
            time: '03:45 PM',
            type: 'credit',
            status: 'completed',
            account: 'Main Account',
            description: 'Monthly salary'
          },
          {
            id: '3',
            amount: 120.00,
            merchant: 'Netflix',
            category: 'Subscription',
            date: '2023-10-13',
            time: '12:00 AM',
            type: 'debit',
            status: 'completed',
            account: 'Credit Card',
            description: 'Netflix Premium subscription'
          },
          {
            id: '4',
            amount: 85.20,
            merchant: 'Uber',
            category: 'Transport',
            date: '2023-10-12',
            time: '08:15 PM',
            type: 'debit',
            status: 'completed',
            account: 'Main Account',
            description: 'Ride to home'
          },
          {
            id: '5',
            amount: 250.00,
            merchant: 'Amazon',
            category: 'Shopping',
            date: '2023-10-11',
            time: '11:30 AM',
            type: 'debit',
            status: 'completed',
            account: 'Credit Card',
            description: 'Electronics purchase'
          },
          {
            id: '6',
            amount: 45.00,
            merchant: 'Spotify',
            category: 'Subscription',
            date: '2023-10-10',
            time: '12:00 AM',
            type: 'debit',
            status: 'completed',
            account: 'Main Account',
            description: 'Spotify Premium'
          },
          {
            id: '7',
            amount: 150.00,
            merchant: 'Movie Theater',
            category: 'Entertainment',
            date: '2023-10-09',
            time: '07:45 PM',
            type: 'debit',
            status: 'completed',
            account: 'Main Account',
            description: 'Movie tickets'
          },
          {
            id: '8',
            amount: 350.00,
            merchant: 'Freelance Work',
            category: 'Income',
            date: '2023-10-08',
            time: '11:20 AM',
            type: 'credit',
            status: 'completed',
            account: 'Main Account',
            description: 'Project payment'
          },
          {
            id: '9',
            amount: 12.75,
            merchant: 'Grocery Store',
            category: 'Food',
            date: '2023-10-07',
            time: '05:30 PM',
            type: 'debit',
            status: 'completed',
            account: 'Main Account',
            description: 'Quick shopping'
          },
          {
            id: '10',
            amount: 65.00,
            merchant: 'Gym Membership',
            category: 'Subscription',
            date: '2023-10-06',
            time: '12:00 AM',
            type: 'debit',
            status: 'completed',
            account: 'Credit Card',
            description: 'Monthly gym fee'
          },
        ];
        
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Apply filters and sorting whenever any filter or sorting option changes
  useEffect(() => {
    applyFiltersAndSorting();
  }, [searchTerm, categoryFilter, typeFilter, dateFilter, sortField, sortDirection, transactions]);

  // Apply filters and sorting to the transactions
  const applyFiltersAndSorting = () => {
    let result = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(transaction => 
        transaction.merchant.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.account.toLowerCase().includes(term) ||
        (transaction.description && transaction.description.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(transaction => transaction.category === categoryFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(transaction => transaction.type === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setDate(today.getDate());
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      result = result.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'merchant':
          comparison = a.merchant.localeCompare(b.merchant);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTransactions(result);
  };

  // Handle sort field change
  const handleSortFieldChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    if (type === 'credit') {
      return <TrendingUp className="transaction-type-icon credit" />;
    } else {
      return <TrendingDown className="transaction-type-icon debit" />;
    }
  };

  if (isLoading) {
    return <div className="loading-container">Loading transactions...</div>;
  }

  return (
    <div className="transactions-container">
      {/* Page Header */}
      <div className="page-header">
        <Typography variant="h4" component="h1" className="page-title">
          Transactions
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          View and manage all your financial transactions
        </Typography>
      </div>

      {/* Search and Filters */}
      <Card className={`search-filters-card ${theme}`}>
        <div className="search-filters-container">
          {/* Search Bar */}
          <div className="search-bar">
            <TextField
              fullWidth
              placeholder="Search transactions, merchants, categories..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search className="search-icon" />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f7',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#444' : '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#666' : '#ccc',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0070f3',
                  },
                },
              }}
            />
          </div>
          
          {/* Actions */}
          <div className="actions-container">
            <Tooltip title="Refresh transactions">
              <IconButton className="action-button">
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Download transactions">
              <IconButton className="action-button">
                <Download />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="contained" 
              className="filters-button"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<Filter />}
              sx={{
                backgroundColor: '#0070f3',
                '&:hover': {
                  backgroundColor: '#0051cc',
                },
              }}
            >
              Filters
              {showFilters ? '▲' : '▼'}
            </Button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filters-row">
              <FormControl className="filter-control">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl className="filter-control">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="credit">Income</MenuItem>
                  <MenuItem value="debit">Expense</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl className="filter-control">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        )}
      </Card>

      {/* Transactions Table */}
      <Card className={`transactions-table-card ${theme}`}>
        {/* Table Header */}
        <div className="table-header">
          <div className="table-cell sortable" onClick={() => handleSortFieldChange('date')}>
            <span className="cell-label">Date & Time</span>
            {sortField === 'date' && (
              <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="table-cell sortable" onClick={() => handleSortFieldChange('merchant')}>
            <span className="cell-label">Merchant</span>
            {sortField === 'merchant' && (
              <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="table-cell sortable" onClick={() => handleSortFieldChange('category')}>
            <span className="cell-label">Category</span>
            {sortField === 'category' && (
              <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="table-cell">Account</div>
          <div className="table-cell sortable amount-cell" onClick={() => handleSortFieldChange('amount')}>
            <span className="cell-label">Amount</span>
            {sortField === 'amount' && (
              <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Actions</div>
        </div>
        
        {/* Table Body */}
        <div className="table-body">
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <Typography variant="body1">No transactions found matching your criteria</Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setTypeFilter('all');
                  setDateFilter('all');
                }}
                sx={{
                  marginTop: 2,
                  borderColor: '#0070f3',
                  color: '#0070f3',
                  '&:hover': {
                    borderColor: '#0051cc',
                    backgroundColor: 'rgba(0, 112, 243, 0.04)',
                  },
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="table-row">
                <div className="table-cell">
                  <div className="date-time">
                    <div className="date">{new Date(transaction.date).toLocaleDateString()}</div>
                    <div className="time">{transaction.time}</div>
                  </div>
                </div>
                <div className="table-cell">
                  <div className="merchant-info">
                    <div className="merchant-name">{transaction.merchant}</div>
                    {transaction.description && (
                      <div className="merchant-description">{transaction.description}</div>
                    )}
                  </div>
                </div>
                <div className="table-cell">
                  <div className={`category-badge ${transaction.category.toLowerCase()}`}>
                    {transaction.category}
                  </div>
                </div>
                <div className="table-cell">
                  <div className="account-info">
                    <CreditCard className="account-icon" />
                    <span>{transaction.account}</span>
                  </div>
                </div>
                <div className={`table-cell amount-cell ${transaction.type}`}>
                  <div className="amount">
                    {getTypeIcon(transaction.type)}
                    <span className="amount-value">
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
                <div className="table-cell">
                  <div className="status-indicator" style={{ backgroundColor: getStatusColor(transaction.status) }}>
                    <span className="status-text">{transaction.status}</span>
                  </div>
                </div>
                <div className="table-cell">
                  <IconButton className="action-button">
                    <MoreHoriz />
                  </IconButton>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="summary-stats">
        <Card className={`stat-card ${theme}`}>
          <div className="stat-content">
            <div className="stat-icon income-icon">
            </div>
            <div className="stat-details">
              <div className="stat-label">Total Income</div>
              <div className="stat-value income">
                +{formatCurrency(filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0))}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className={`stat-card ${theme}`}>
          <div className="stat-content">
            <div className="stat-icon expense-icon">
            </div>
            <div className="stat-details">
              <div className="stat-label">Total Expenses</div>
              <div className="stat-value expense">
                -{formatCurrency(filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0))}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className={`stat-card ${theme}`}>
          <div className="stat-content">
            <div className="stat-icon balance-icon">
            </div>
            <div className="stat-details">
              <div className="stat-label">Net Balance</div>
              <div className={`stat-value ${filteredTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0) >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(filteredTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;