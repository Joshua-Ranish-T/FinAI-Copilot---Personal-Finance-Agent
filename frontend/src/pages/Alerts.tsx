import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Divider, Chip, IconButton, Tooltip, Button } from '@mui/material';
import { Notifications, Shield, ChevronRight, LocationOn, Warning, CheckCircle, Info, CalendarToday, AccountCircle, CreditCard, TrendingDown, FilterList } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Alerts.css';

interface Alert {
  id: string;
  type: 'anomaly' | 'insight' | 'reminder';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  category: string;
  metadata?: {
    amount?: number;
    merchant?: string;
    location?: string;
    transactionId?: string;
    recurringAmount?: number;
    usualAmount?: number;
    date?: Date;
    actionTaken?: string;
  };
  actions?: {
    text: string;
    action: () => void;
  }[];
}

const Alerts: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fetch alerts data
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for alerts
        const mockAlerts: Alert[] = [
          {
            id: '1',
            type: 'anomaly',
            severity: 'high',
            title: 'Unusual High-Value Transaction',
            description: 'A transaction of ₹12,500 was detected at a new merchant location.',
            timestamp: new Date('2023-06-21T14:30:00'),
            read: false,
            category: 'Transaction',
            metadata: {
              amount: 12500,
              merchant: 'BigMart Electronics',
              location: 'New Delhi',
              transactionId: 'TX-789123'
            },
            actions: [
              { text: 'Review Transaction', action: () => alert('Reviewing transaction...') },
              { text: 'Flag as Suspicious', action: () => alert('Flagging as suspicious...') }
            ]
          },
          {
            id: '2',
            type: 'insight',
            severity: 'low',
            title: 'Netflix Subscription Increased',
            description: 'Your Netflix subscription charge increased by 10% from last month.',
            timestamp: new Date('2023-06-21T10:15:00'),
            read: true,
            category: 'Subscription',
            metadata: {
              amount: 599,
              usualAmount: 545,
              recurringAmount: 599
            },
            actions: [
              { text: 'Review Plan', action: () => alert('Reviewing subscription plan...') },
              { text: 'Set Reminder', action: () => alert('Setting reminder...') }
            ]
          },
          {
            id: '3',
            type: 'anomaly',
            severity: 'medium',
            title: 'Login Attempt from New Location',
            description: 'Your account was accessed from a new device in Mumbai.',
            timestamp: new Date('2023-06-20T22:45:00'),
            read: false,
            category: 'Security',
            metadata: {
              location: 'Mumbai',
              date: new Date('2023-06-20T22:45:00')
            },
            actions: [
              { text: 'Verify Identity', action: () => alert('Verifying identity...') },
              { text: 'Change Password', action: () => alert('Changing password...') }
            ]
          },
          {
            id: '4',
            type: 'reminder',
            severity: 'low',
            title: 'Credit Card Payment Due',
            description: 'Your credit card payment of ₹8,500 is due in 3 days.',
            timestamp: new Date('2023-06-20T16:20:00'),
            read: true,
            category: 'Payment',
            metadata: {
              amount: 8500,
              date: new Date('2023-06-24')
            },
            actions: [
              { text: 'Pay Now', action: () => alert('Processing payment...') },
              { text: 'Set Reminder', action: () => alert('Setting reminder...') }
            ]
          },
          {
            id: '5',
            type: 'anomaly',
            severity: 'medium',
            title: 'Four Times Your Usual Uber Spend',
            description: 'You spent ₹1,800 on Uber today, which is 4x your usual daily average.',
            timestamp: new Date('2023-06-19T20:30:00'),
            read: false,
            category: 'Transportation',
            metadata: {
              amount: 1800,
              usualAmount: 450,
              merchant: 'Uber India'
            },
            actions: [
              { text: 'Review Rides', action: () => alert('Reviewing rides...') }
            ]
          },
          {
            id: '6',
            type: 'insight',
            severity: 'low',
            title: 'High Dining Expenses This Week',
            description: 'Your dining expenses are 25% higher than your weekly average.',
            timestamp: new Date('2023-06-19T12:10:00'),
            read: true,
            category: 'Food',
            metadata: {
              recurringAmount: 3200,
              usualAmount: 2560
            },
            actions: [
              { text: 'View Analytics', action: () => alert('Viewing analytics...') }
            ]
          },
          {
            id: '7',
            type: 'anomaly',
            severity: 'high',
            title: 'New Merchant Detected',
            description: 'Your first transaction with a new merchant was flagged for review.',
            timestamp: new Date('2023-06-18T18:55:00'),
            read: false,
            category: 'Transaction',
            metadata: {
              amount: 2100,
              merchant: 'Green Grocery Mart',
              location: 'Bengaluru'
            },
            actions: [
              { text: 'Approve Merchant', action: () => alert('Approving merchant...') },
              { text: 'Block Merchant', action: () => alert('Blocking merchant...') }
            ]
          }
        ];
        
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAlerts();
    }
  }, [user]);

  // Format date and time
  const formatDateTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get alert icon
  const getAlertIcon = (type: Alert['type'], severity: Alert['severity']) => {
    let iconColor = '';
    
    switch (severity) {
      case 'high':
        iconColor = 'danger';
        break;
      case 'medium':
        iconColor = 'warning';
        break;
      case 'low':
        iconColor = 'info';
        break;
      default:
        iconColor = 'info';
    }

    switch (type) {
      case 'anomaly':
        return <Warning className={`alert-icon ${iconColor}`} />;
      case 'insight':
        return <Info className={`alert-icon ${iconColor}`} />;
      case 'reminder':
        return <Notifications className={`alert-icon ${iconColor}`} />;
      default:
        return <Warning className={`alert-icon ${iconColor}`} />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: Alert['severity']) => {
    let badgeColor = '';
    let badgeText = '';

    switch (severity) {
      case 'high':
        badgeColor = 'danger';
        badgeText = 'High';
        break;
      case 'medium':
        badgeColor = 'warning';
        badgeText = 'Medium';
        break;
      case 'low':
        badgeColor = 'info';
        badgeText = 'Low';
        break;
      default:
        badgeColor = 'info';
        badgeText = 'Unknown';
    }

    return (
      <Chip
        label={badgeText}
        size="small"
        className={`severity-badge ${badgeColor}`}
        variant="outlined"
      />
    );
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transaction':
        return <CreditCard className="category-icon" />;
      case 'subscription':
        return <CalendarToday className="category-icon" />;
      case 'security':
        return <Shield className="category-icon" />;
      case 'payment':
        return <TrendingDown className="category-icon" />;
      case 'transportation':
        return <LocationOn className="category-icon" />;
      case 'food':
        return <AccountCircle className="category-icon" />;
      default:
        return <Info className="category-icon" />;
    }
  };

  // Mark alert as read
  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.metadata?.merchant && alert.metadata.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && !alert.read) ||
      (filter === 'high' && alert.severity === 'high') ||
      (filter === 'medium' && alert.severity === 'medium') ||
      (filter === 'low' && alert.severity === 'low') ||
      alert.type === filter ||
      alert.category.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Count unread alerts
  const unreadCount = alerts.filter(alert => !alert.read).length;

  // Total alerts count by severity
  const highSeverityCount = alerts.filter(alert => alert.severity === 'high').length;
  const mediumSeverityCount = alerts.filter(alert => alert.severity === 'medium').length;
  const lowSeverityCount = alerts.filter(alert => alert.severity === 'low').length;

  return (
    <div className={`alerts-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Page Header */}
      <div className="page-header">
        <Typography variant="h4" component="h1" className="page-title">
          Alerts & Notifications
        </Typography>
        <Typography variant="subtitle1" className="page-subtitle">
          Stay informed about your financial activities and potential issues
        </Typography>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <Typography variant="h6">Loading alerts...</Typography>
        </div>
      )}

      {/* No Data State */}
      {!loading && filteredAlerts.length === 0 && (
        <div className="no-alerts">
          <Typography variant="h6">No alerts found</Typography>
          <Typography variant="body2">
            You're all caught up! Check back later for new alerts.
          </Typography>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && (
        <div className="stats-summary">
          <Card className="stats-card">
            <CardContent>
              <div className="stats-grid">
                <div className="stat-item">
                  <Typography variant="body2" className="stat-label">Total Alerts</Typography>
                  <Typography variant="h6" className="stat-value">{alerts.length}</Typography>
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="stat-item">
                  <Typography variant="body2" className="stat-label">Unread</Typography>
                  <Typography variant="h6" className={`stat-value ${unreadCount > 0 ? 'danger' : ''}`}>
                    {unreadCount}
                  </Typography>
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="stat-item">
                  <Typography variant="body2" className="stat-label">High Priority</Typography>
                  <Typography variant="h6" className={`stat-value ${highSeverityCount > 0 ? 'danger' : ''}`}>
                    {highSeverityCount}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      {!loading && (
        <div className="search-filters">
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search alerts..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filters-container">
            <Button
              variant="outlined"
              startIcon={<FilterList fontSize="small" />}
              onClick={() => setShowFilters(!showFilters)}
              className="filters-button"
            >
              Filters ({showFilters ? 'Hide' : 'Show'})
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="advanced-filters">
          <div className="filters-chips">
            <Chip
              label="All Alerts"
              clickable
              color={filter === 'all' ? 'primary' : 'default'}
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Unread"
              clickable
              color={filter === 'unread' ? 'primary' : 'default'}
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'filled' : 'outlined'}
              className={unreadCount > 0 ? 'has-count' : ''}
            />
            <Chip
              label="High"
              clickable
              color={filter === 'high' ? 'error' : 'default'}
              onClick={() => setFilter('high')}
              variant={filter === 'high' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Medium"
              clickable
              color={filter === 'medium' ? 'warning' : 'default'}
              onClick={() => setFilter('medium')}
              variant={filter === 'medium' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Low"
              clickable
              color={filter === 'low' ? 'info' : 'default'}
              onClick={() => setFilter('low')}
              variant={filter === 'low' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Anomaly"
              clickable
              color={filter === 'anomaly' ? 'primary' : 'default'}
              onClick={() => setFilter('anomaly')}
              variant={filter === 'anomaly' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Insight"
              clickable
              color={filter === 'insight' ? 'primary' : 'default'}
              onClick={() => setFilter('insight')}
              variant={filter === 'insight' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Reminder"
              clickable
              color={filter === 'reminder' ? 'primary' : 'default'}
              onClick={() => setFilter('reminder')}
              variant={filter === 'reminder' ? 'filled' : 'outlined'}
            />
          </div>
        </div>
      )}

      {/* Alert List */}
      {!loading && filteredAlerts.length > 0 && (
        <div className="alerts-list">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`alert-card ${alert.read ? 'read' : 'unread'}`}>
              <CardContent className="alert-content">
                <div className="alert-header">
                  <div className="alert-icon-section">
                    {getAlertIcon(alert.type, alert.severity)}
                  </div>
                  <div className="alert-main">
                    <div className="alert-title-section">
                      <Typography variant="h6" className="alert-title">
                        {alert.title}
                      </Typography>
                      <div className="alert-badges">
                        {getSeverityBadge(alert.severity)}
                        <Chip
                          label={alert.category}
                          size="small"
                          className="category-badge"
                          variant="outlined"
                        />
                      </div>
                    </div>
                    <Typography variant="body2" className="alert-description">
                      {alert.description}
                    </Typography>
                    
                    {/* Metadata */}
                    {alert.metadata && (
                      <div className="alert-metadata">
                        {alert.metadata.amount && (
                          <div className="metadata-item">
                            <span className="metadata-label">Amount:</span>
                            <span className="metadata-value">₹{alert.metadata.amount.toLocaleString()}</span>
                          </div>
                        )}
                        {alert.metadata.merchant && (
                          <div className="metadata-item">
                            <span className="metadata-label">Merchant:</span>
                            <span className="metadata-value">{alert.metadata.merchant}</span>
                          </div>
                        )}
                        {alert.metadata.location && (
                          <div className="metadata-item">
                            <span className="metadata-label">Location:</span>
                            <span className="metadata-value">{alert.metadata.location}</span>
                          </div>
                        )}
                        {alert.metadata.usualAmount && alert.metadata.recurringAmount && (
                          <div className="metadata-item">
                            <span className="metadata-label">Change:</span>
                            <span className="metadata-value">
                              {((alert.metadata.recurringAmount - alert.metadata.usualAmount) / alert.metadata.usualAmount * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {alert.metadata.date && (
                          <div className="metadata-item">
                            <span className="metadata-label">Date:</span>
                            <span className="metadata-value">
                              {alert.metadata.date.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="alert-footer">
                    <div className="alert-time">
                      <CalendarToday fontSize="small" className="time-icon" />
                      <Typography variant="caption" className="time-text">
                        {formatDateTime(alert.timestamp)}
                      </Typography>
                    </div>
                    <div className="alert-actions">
                      {alert.actions && alert.actions.map((action, index) => (
                        <Tooltip key={index} title={action.text} arrow>
                          <IconButton
                            size="small"
                            onClick={action.action}
                            className="action-button"
                          >
                            {/* <ChevronRight size={16} /> */}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
                {!alert.read && (
                  <div className="mark-read-section">
                    <Button
                      size="small"
                    //   startIcon={<CheckCircle size={16} />}
                      onClick={() => markAsRead(alert.id)}
                      className="mark-read-button"
                    >
                      Mark as Read
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;