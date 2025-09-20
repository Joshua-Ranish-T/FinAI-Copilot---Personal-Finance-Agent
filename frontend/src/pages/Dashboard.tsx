import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid } from '@mui/material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Dashboard.css';

// Define transaction type
interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  type: 'credit' | 'debit';
}

// Define balance type
interface Balance {
  account: string;
  amount: number;
  currency: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [spendingData, setSpendingData] = useState<any[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API calls
        // In a real app, these would be actual API calls to the backend
        
        // Mock transactions data
        const mockTransactions: Transaction[] = [
          { id: '1', amount: 45.50, merchant: 'Starbucks', category: 'Food', date: '2023-10-15', type: 'debit' },
          { id: '2', amount: 1200.00, merchant: 'Salary', category: 'Income', date: '2023-10-14', type: 'credit' },
          { id: '3', amount: 120.00, merchant: 'Netflix', category: 'Subscription', date: '2023-10-13', type: 'debit' },
          { id: '4', amount: 85.20, merchant: 'Uber', category: 'Transport', date: '2023-10-12', type: 'debit' },
          { id: '5', amount: 250.00, merchant: 'Amazon', category: 'Shopping', date: '2023-10-11', type: 'debit' },
        ];
        
        // Mock balances data
        const mockBalances: Balance[] = [
          { account: 'Main Account', amount: 5432.10, currency: 'USD' },
          { account: 'Savings', amount: 12500.00, currency: 'USD' },
          { account: 'Credit Card', amount: -1245.75, currency: 'USD' },
        ];
        
        // Mock spending data for chart
        const mockSpendingData = [
          { name: 'Jan', amount: 1200 },
          { name: 'Feb', amount: 1900 },
          { name: 'Mar', amount: 1500 },
          { name: 'Apr', amount: 2000 },
          { name: 'May', amount: 1800 },
          { name: 'Jun', amount: 2200 },
        ];
        
        // Mock income data for chart
        const mockIncomeData = [
          { name: 'Jan', amount: 3500 },
          { name: 'Feb', amount: 3700 },
          { name: 'Mar', amount: 3500 },
          { name: 'Apr', amount: 4000 },
          { name: 'May', amount: 3800 },
          { name: 'Jun', amount: 4200 },
        ];
        
        // Combine spending and income data for the LineChart
        const mockCombinedData = mockSpendingData.map((month, index) => ({
          name: month.name,
          expenses: month.amount,
          income: mockIncomeData[index].amount
        }));
        
        // Mock category data for pie chart
        const mockCategoryData = [
          { name: 'Food', value: 450, color: '#FF6384' },
          { name: 'Transport', value: 300, color: '#36A2EB' },
          { name: 'Shopping', value: 600, color: '#FFCE56' },
          { name: 'Subscription', value: 200, color: '#4BC0C0' },
          { name: 'Entertainment', value: 150, color: '#9966FF' },
          { name: 'Other', value: 300, color: '#FF9F40' },
        ];
        
        setTransactions(mockTransactions);
        setBalances(mockBalances);
        setSpendingData(mockSpendingData);
        setCombinedData(mockCombinedData);
        setCategoryData(mockCategoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate total balance
  const totalBalance = balances.reduce((sum, balance) => sum + balance.amount, 0);

  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return <div className="loading-container">Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <Typography variant="h4" component="h1" className="dashboard-title">
          Welcome back, {user?.name || 'User'}
        </Typography>
        <Typography variant="body1" className="dashboard-subtitle">
          Here's your financial overview for this month
        </Typography>
      </div>

      {/* Balances Section */}
      <div className="balances-section">
          <Grid display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
            <div>
              <Card className="balance-card total-balance-card">
                <CardContent>
                  <Typography variant="subtitle1" className="balance-label">Total Balance</Typography>
                  <Typography variant="h4" component="div" className="balance-amount">
                    {formatCurrency(totalBalance)}
                  </Typography>
                  <Box className="balance-change">
                    <Chip label="+2.5% this month" color="success" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </div>

            {balances.map((balance, index) => (
              <div key={index}>
                <Card className="balance-card">
                  <CardContent>
                    <Typography variant="subtitle1" className="balance-label">{balance.account}</Typography>
                    <Typography variant="h5" component="div" className={`balance-amount ${balance.amount < 0 ? 'negative' : ''}`}>
                      {formatCurrency(balance.amount)}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            ))}
          </Grid>
        </div>

      {/* Charts Section */}
      <div className="charts-section">
        <Grid display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
          {/* Spending Chart */}
          <div>
            <Card className="chart-card">
              <CardContent>
                <Typography variant="h6" component="h2" className="chart-title">
                  Monthly Spending
                </Typography>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={spendingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#eee'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#999' : '#666'} />
                <YAxis stroke={isDarkMode ? '#999' : '#666'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
                    color: isDarkMode ? '#e0e0e0' : '#333',
                    borderColor: isDarkMode ? '#444' : '#ddd'
                  }}
                />
                      <Bar dataKey="amount" fill="#0070f3" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Chart */}
          <div>
            <Card className="chart-card">
              <CardContent>
                <Typography variant="h6" component="h2" className="chart-title">
                  Spending by Category
                </Typography>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
          formatter={(value) => formatCurrency(value as number)}
          contentStyle={{
            backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
            color: isDarkMode ? '#e0e0e0' : '#333',
            borderColor: isDarkMode ? '#444' : '#ddd'
          }}
        />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expenses Chart */}
          <div>
            <Card className="chart-card">
              <CardContent>
                <Typography variant="h6" component="h2" className="chart-title">
                  Income vs Expenses
                </Typography>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#eee'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#999' : '#666'} />
                  <YAxis stroke={isDarkMode ? '#999' : '#666'} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      borderColor: isDarkMode ? '#444' : '#ddd'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ff6b6b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <Card className="transactions-card">
          <CardContent>
            <div className="section-header">
              <Typography variant="h6" component="h2">Recent Transactions</Typography>
              <a href="/transactions" className="view-all-link">View All</a>
            </div>
            <div className="transactions-list">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    <div className={`icon-circle ${transaction.type === 'credit' ? 'credit' : 'debit'}`}>
                      <i className={transaction.type === 'credit' ? 'fas fa-arrow-down' : 'fas fa-arrow-up'}></i>
                    </div>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-merchant">{transaction.merchant}</div>
                    <div className="transaction-meta">
                      <span className="transaction-date">{transaction.date}</span>
                      <span className="transaction-category">{transaction.category}</span>
                    </div>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <div className="insights-section">
        <Card className="insights-card">
          <CardContent>
            <Typography variant="h6" component="h2" className="section-title">Financial Insights</Typography>
            <div className="insights-list">
              <div className="insight-item">
                <div className="insight-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="insight-content">
                  <div className="insight-title">Your spending is 15% higher than last month</div>
                  <div className="insight-description">Consider reducing discretionary expenses.</div>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon">
                  <i className="fas fa-subscription"></i>
                </div>
                <div className="insight-content">
                  <div className="insight-title">Your Netflix subscription increased by $2</div>
                  <div className="insight-description">Review your plan to potentially save.</div>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon">
                  <i className="fas fa-piggy-bank"></i>
                </div>
                <div className="insight-content">
                  <div className="insight-title">You're on track to reach your savings goal</div>
                  <div className="insight-description">Continue with your current savings rate.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;