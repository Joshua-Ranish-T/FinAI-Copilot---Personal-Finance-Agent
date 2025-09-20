import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Divider, Switch, FormControlLabel, 
  Button, TextField, IconButton, Tooltip, MenuItem, Select, 
  FormControl, InputLabel, Alert, Avatar
} from '@mui/material';
import {
  Person, Shield, Notifications, CreditCard, Settings as SettingsIcon,
  Lock, Visibility, VisibilityOff, Logout, X,
  ArrowRight, CalendarToday, Warning, Add, Edit, Delete
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Settings.css';

interface Account {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'wallet' | 'upi';
  balance?: number;
  lastUpdated?: Date;
  status: 'active' | 'inactive' | 'pending';
}

interface NotificationPreference {
  id: string;
  type: string;
  enabled: boolean;
  frequency?: 'realtime' | 'daily' | 'weekly' | 'monthly';
}

interface CategoryRule {
  id: string;
  merchantPattern: string;
  category: string;
  enabled: boolean;
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<boolean>(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState<boolean>(false);
  const [showAddAccountForm, setShowAddAccountForm] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [timeFormat, setTimeFormat] = useState<string>('12h');

  // Mock data for accounts
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      name: 'HDFC Bank Savings',
      type: 'bank',
      balance: 25842.50,
      lastUpdated: new Date(),
      status: 'active'
    },
    {
      id: '2',
      name: 'SBI Credit Card',
      type: 'credit_card',
      balance: -8500.00,
      lastUpdated: new Date(),
      status: 'active'
    },
    {
      id: '3',
      name: 'Google Pay',
      type: 'wallet',
      balance: 1250.75,
      lastUpdated: new Date(),
      status: 'active'
    },
    {
      id: '4',
      name: 'PhonePe UPI',
      type: 'upi',
      lastUpdated: new Date(),
      status: 'pending'
    }
  ]);

  // Mock data for notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      type: 'High-Value Transactions',
      enabled: true,
      frequency: 'realtime'
    },
    {
      id: '2',
      type: 'Anomaly Detection',
      enabled: true,
      frequency: 'realtime'
    },
    {
      id: '3',
      type: 'Login Attempts',
      enabled: true,
      frequency: 'realtime'
    },
    {
      id: '4',
      type: 'Weekly Spending Summary',
      enabled: true,
      frequency: 'weekly'
    },
    {
      id: '5',
      type: 'Subscription Renewals',
      enabled: true,
      frequency: 'daily'
    },
    {
      id: '6',
      type: 'Account Balance Alerts',
      enabled: false,
      frequency: 'daily'
    }
  ]);

  // Mock data for category rules
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([
    {
      id: '1',
      merchantPattern: 'Uber|Ola',
      category: 'Transportation',
      enabled: true
    },
    {
      id: '2',
      merchantPattern: 'Netflix|Prime|Spotify',
      category: 'Subscription',
      enabled: true
    },
    {
      id: '3',
      merchantPattern: 'Swiggy|Zomato|Uber Eats',
      category: 'Food',
      enabled: true
    }
  ]);

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would validate and update the password
    setPasswordChangeSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setPasswordChangeSuccess(false);
    }, 3000);
  };

  // Handle account status toggle
  const handleAccountStatusToggle = (accountId: string) => {
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, status: account.status === 'active' ? 'inactive' : 'active' }
        : account
    ));
  };

  // Handle notification toggle
  const handleNotificationToggle = (notificationId: string) => {
    setNotificationPreferences(notificationPreferences.map(notification => 
      notification.id === notificationId 
        ? { ...notification, enabled: !notification.enabled }
        : notification
    ));
  };

  // Handle notification frequency change
  const handleFrequencyChange = (notificationId: string, frequency: NotificationPreference['frequency']) => {
    setNotificationPreferences(notificationPreferences.map(notification => 
      notification.id === notificationId 
        ? { ...notification, frequency }
        : notification
    ));
  };

  // Handle category rule toggle
  const handleCategoryRuleToggle = (ruleId: string) => {
    setCategoryRules(categoryRules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get account icon
  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return <CreditCard className="account-icon" />;
      case 'credit_card':
        return <CreditCard className="account-icon" />;
      case 'wallet':
        return <CreditCard className="account-icon" />;
      case 'upi':
        return <CreditCard className="account-icon" />;
      default:
        return <span className="account-icon">?</span>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: Account['status']) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active">Active</span>;
      case 'inactive':
        return <span className="status-badge inactive">Inactive</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

  // Format date for last updated
  const formatLastUpdated = (date?: Date): string => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  };

  // Render tabs
  const renderTabs = () => {
    const tabs = [
        { id: 'profile', label: 'Profile', icon: <Person fontSize="small" /> },
        { id: 'accounts', label: 'Connected Accounts', icon: <CreditCard fontSize="small" /> },
        { id: 'notifications', label: 'Notifications', icon: <Notifications fontSize="small" /> },
        { id: 'security', label: 'Security', icon: <Shield fontSize="small" /> },
        { id: 'categories', label: 'Category Rules', icon: <SettingsIcon fontSize="small" /> },
        { id: 'preferences', label: 'Preferences', icon: <SettingsIcon fontSize="small" /> },
      ];

    return (
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // Render profile tab
  const renderProfileTab = () => (
    <div className="tab-content profile-tab">
      <Card className="profile-card">
        <CardContent className="profile-content">
          <div className="profile-header">
            <Avatar className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <div className="profile-info">
              <Typography variant="h5" className="profile-name">
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" className="profile-email">
                {user?.email || 'user@example.com'}
              </Typography>
            </div>
          </div>
          
          <Divider className="divider" />
          
          <div className="profile-form">
            <div className="form-group">
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                margin="normal"
                defaultValue={user?.name || 'User'}
                className="form-field"
              />
            </div>
            <div className="form-group">
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                margin="normal"
                defaultValue={user?.email || 'user@example.com'}
                className="form-field"
              />
            </div>
            <div className="form-group">
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                defaultValue="+91 12345 67890"
                className="form-field"
              />
            </div>
            <div className="form-group">
              <TextField
                label="Date of Birth"
                variant="outlined"
                fullWidth
                margin="normal"
                defaultValue="01/01/1990"
                className="form-field"
              />
            </div>
            
            <div className="form-actions">
              <Button variant="contained" className="save-button">
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render accounts tab
  const renderAccountsTab = () => (
    <div className="tab-content accounts-tab">
      <div className="tab-header">
        <Typography variant="h6" className="tab-title">
          Connected Accounts
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add fontSize="small" />}
          onClick={() => setShowAddAccountForm(!showAddAccountForm)}
          className="add-account-button"
        >
          Add Account
        </Button>
      </div>

      {showAddAccountForm && (
        <Card className="add-account-card">
          <CardContent>
            <Typography variant="subtitle1" className="form-title">
              Connect New Account
            </Typography>
            <div className="account-form">
              <div className="form-group">
                <TextField
                  label="Account Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  placeholder="e.g. Savings Account"
                  className="form-field"
                />
              </div>
              <div className="form-group">
                <FormControl fullWidth margin="normal" className="form-field">
                  <InputLabel>Account Type</InputLabel>
                  <Select label="Account Type">
                    <MenuItem value="bank">Bank Account</MenuItem>
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                    <MenuItem value="wallet">Digital Wallet</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="form-group">
                <TextField
                  label="Financial Institution"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  placeholder="e.g. HDFC Bank"
                  className="form-field"
                />
              </div>
              <div className="form-actions">
                <Button variant="outlined" onClick={() => setShowAddAccountForm(false)}>
                  Cancel
                </Button>
                <Button variant="contained" className="connect-button">
                  Connect Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="accounts-list">
        {accounts.map(account => (
          <Card key={account.id} className="account-card">
            <CardContent className="account-content">
              <div className="account-header">
                <div className="account-icon-section">
                  {getAccountIcon(account.type)}
                </div>
                <div className="account-info">
                  <Typography variant="subtitle1" className="account-name">
                    {account.name}
                  </Typography>
                  <Typography variant="body2" className="account-type">
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1).replace('_', ' ')}
                  </Typography>
                </div>
                <div className="account-status">
                  {getStatusBadge(account.status)}
                </div>
              </div>
              
              <Divider className="divider" />
              
              <div className="account-details">
                {account.balance !== undefined && (
                  <div className="balance-section">
                    <Typography variant="body2" className="balance-label">
                      Balance
                    </Typography>
                    <Typography variant="h6" className={`balance-amount ${account.balance < 0 ? 'negative' : 'positive'}`}>
                      ₹{Math.abs(account.balance).toLocaleString()}
                    </Typography>
                  </div>
                )}
                
                <div className="last-updated">
                  <CalendarToday fontSize="small" className="update-icon" />
                  <Typography variant="body2" className="update-text">
                    Last Updated: {formatLastUpdated(account.lastUpdated)}
                  </Typography>
                </div>
              </div>
              
              <div className="account-actions">
                {account.status !== 'pending' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={account.status === 'active'}
                        onChange={() => handleAccountStatusToggle(account.id)}
                        color="primary"
                      />
                    }
                    label={account.status === 'active' ? 'Active' : 'Inactive'}
                  />
                )}
                <Button 
                  variant="outlined" 
                  size="small"
                  className="action-button"
                  disabled={account.status === 'pending'}
                >
                  <Edit fontSize="small" />
                  Edit
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className="action-button danger"
                  disabled={account.status === 'pending'}
                >
                  <Delete fontSize="small" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render notifications tab
  const renderNotificationsTab = () => (
    <div className="tab-content notifications-tab">
      <Card className="notification-settings-card">
        <CardContent>
          <Typography variant="h6" className="section-title">
            Notification Preferences
          </Typography>
          <Typography variant="body2" className="section-description">
            Customize how and when you receive notifications about your financial activities.
          </Typography>
          
          <Divider className="divider" />
          
          <div className="notification-options">
            <FormControlLabel
              control={
                <Switch
                  checked={notificationPreferences.some(n => n.enabled)}
                  onChange={() => {
                    const allEnabled = notificationPreferences.every(n => n.enabled);
                    setNotificationPreferences(notificationPreferences.map(n => 
                      ({ ...n, enabled: !allEnabled })
                    ));
                  }}
                  color="primary"
                />
              }
              label={
                <Typography variant="subtitle1">
                  {notificationPreferences.every(n => n.enabled) ? 'Disable All Notifications' : 'Enable All Notifications'}
                </Typography>
              }
              className="all-notifications-toggle"
            />
          </div>
          
          <Divider className="divider" />
          
          <div className="notification-list">
            {notificationPreferences.map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-header">
                  <div className="notification-info">
                    <Typography variant="subtitle1" className="notification-type">
                      {notification.type}
                    </Typography>
                  </div>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notification.enabled}
                        onChange={() => handleNotificationToggle(notification.id)}
                        color="primary"
                      />
                    }
                    label={notification.enabled ? 'On' : 'Off'}
                  />
                </div>
                
                {notification.enabled && notification.frequency && (
                  <div className="notification-frequency">
                    <Typography variant="body2" className="frequency-label">
                      Frequency
                    </Typography>
                    <FormControl variant="outlined" size="small" className="frequency-select">
                      <Select
                        value={notification.frequency}
                        onChange={(e) => handleFrequencyChange(notification.id, e.target.value as NotificationPreference['frequency'])}
                        label="Frequency"
                      >
                        <MenuItem value="realtime">Real-time</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render security tab
  const renderSecurityTab = () => (
    <div className="tab-content security-tab">
      <Card className="password-card">
        <CardContent>
          <Typography variant="h6" className="section-title">
            Change Password
          </Typography>
          
          {passwordChangeSuccess && (
            <Alert severity="success" className="success-alert">
              Password changed successfully!
            </Alert>
          )}
          
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <TextField
                label="Current Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-field"
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff fontSize="medium" /> : <Visibility fontSize="medium" />}
                    </IconButton>
                  )
                }}
              />
            </div>
            <div className="form-group">
              <TextField
                label="New Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-field"
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff fontSize="medium" /> : <Visibility fontSize="medium" />}
                    </IconButton>
                  )
                }}
              />
            </div>
            <div className="form-group">
              <TextField
                label="Confirm New Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-field"
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff fontSize="medium" /> : <Visibility fontSize="medium" />}
                    </IconButton>
                  )
                }}
              />
            </div>
            <div className="form-actions">
              <Button variant="contained" type="submit" className="change-password-button">
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="two-factor-card">
        <CardContent>
          <Typography variant="h6" className="section-title">
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" className="section-description">
            Add an extra layer of security to your account.
          </Typography>
          
          <div className="two-factor-status">
            <div className="status-info">
              <Typography variant="subtitle1" className="status-title">
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" className="status-description">
                Currently disabled
              </Typography>
            </div>
            <Button variant="outlined" className="setup-button">
              Set Up
              <ArrowRight fontSize="small" className="setup-icon" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="account-access-card">
        <CardContent>
          <Typography variant="h6" className="section-title">
            Account Access
          </Typography>
          
          <div className="session-list">
            <div className="session-item active">
              <div className="session-info">
                <div className="session-device">
                  <Typography variant="subtitle1" className="device-name">
                    Current Device
                  </Typography>
                  <Typography variant="body2" className="device-details">
                    Windows 10 • Chrome 98.0.4758.102 • Mumbai, India
                  </Typography>
                </div>
                <Typography variant="body2" className="session-time">
                  Active now
                </Typography>
              </div>
              <div className="session-actions">
                <Button variant="text" className="session-button">
                  Details
                </Button>
              </div>
            </div>
            
            <div className="session-item">
              <div className="session-info">
                <div className="session-device">
                  <Typography variant="subtitle1" className="device-name">
                    Mobile Device
                  </Typography>
                  <Typography variant="body2" className="device-details">
                    Android 12 • Chrome Mobile 98.0.4758.101 • Delhi, India
                  </Typography>
                </div>
                <Typography variant="body2" className="session-time">
                  2 hours ago
                </Typography>
              </div>
              <div className="session-actions">
                <Button variant="text" className="session-button danger">
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="delete-account-card">
        <CardContent>
          <Typography variant="h6" className="section-title">
            Delete Account
          </Typography>
          <Typography variant="body2" className="section-description">
            This will permanently delete your account and all associated data.
          </Typography>
          
          <div className="delete-warning">
            <Warning fontSize="medium" className="warning-icon" />
            <Typography variant="body2" className="warning-text">
              Warning: This action cannot be undone. All your financial data will be permanently deleted.
            </Typography>
          </div>
          
          <div className="delete-actions">
            <Button 
              variant="outlined" 
              className="delete-button danger"
              onClick={() => setShowDeleteAccountDialog(true)}
            >
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {showDeleteAccountDialog && (
        <div className="dialog-overlay">
          <div className="delete-dialog">
            <div className="dialog-header">
              <Typography variant="h6" className="dialog-title">
                Delete Account
              </Typography>
              <IconButton onClick={() => setShowDeleteAccountDialog(false)} className="close-button">
                <X fontSize="medium" />
              </IconButton>
            </div>
            
            <div className="dialog-content">
              <div className="dialog-warning">
                <Warning fontSize="large" className="dialog-warning-icon" />
                <Typography variant="body1" className="dialog-warning-text">
                  Are you sure you want to delete your account? This action cannot be undone.
                </Typography>
              </div>
              
              <div className="dialog-notes">
                <Typography variant="body2" className="dialog-note">
                  • All your financial data will be permanently deleted
                </Typography>
                <Typography variant="body2" className="dialog-note">
                  • You will lose access to all connected accounts
                </Typography>
                <Typography variant="body2" className="dialog-note">
                  • Your subscription, if any, will be canceled
                </Typography>
              </div>
              
              <TextField
                label="Type 'DELETE' to confirm"
                variant="outlined"
                fullWidth
                margin="normal"
                className="confirmation-field"
              />
            </div>
            
            <div className="dialog-actions">
              <Button 
                variant="outlined" 
                onClick={() => setShowDeleteAccountDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                className="confirm-delete-button danger"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render categories tab
  const renderCategoriesTab = () => (
    <div className="tab-content categories-tab">
      <div className="tab-header">
        <Typography variant="h6" className="tab-title">
          Category Rules
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add fontSize="small" />}
          className="add-rule-button"
        >
          Add Rule
        </Button>
      </div>

      <div className="category-rules-list">
        {categoryRules.map(rule => (
          <Card key={rule.id} className="category-rule-card">
            <CardContent className="category-rule-content">
              <div className="rule-header">
                <div className="rule-info">
                  <Typography variant="subtitle1" className="rule-pattern">
                    {rule.merchantPattern}
                  </Typography>
                  <Typography variant="body2" className="rule-category">
                    {rule.category}
                  </Typography>
                </div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rule.enabled}
                      onChange={() => handleCategoryRuleToggle(rule.id)}
                      color="primary"
                    />
                  }
                  label={rule.enabled ? 'Active' : 'Inactive'}
                />
              </div>
              
              <div className="rule-actions">
                <Button 
                  variant="outlined" 
                  size="small"
                  className="rule-action-button"
                >
                  <Edit fontSize="small" />
                  Edit
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className="rule-action-button danger"
                >
                  <Delete fontSize="small" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render preferences tab
  const renderPreferencesTab = () => (
    <div className="tab-content preferences-tab">
      <Card className="theme-card">
        <CardContent>
          <Typography variant="h6" className="section-title">
            Theme
          </Typography>
          
          <div className="theme-options">
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label="Dark Mode"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="language-card">
        <CardContent>
          <Typography variant="h6" className="section-title">
            Language & Region
          </Typography>
          
          <div className="language-options">
            <div className="form-group">
              <FormControl fullWidth margin="normal" className="form-field">
                <InputLabel>Language</InputLabel>
                <Select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="mr">Marathi</MenuItem>
                  <MenuItem value="ta">Tamil</MenuItem>
                  <MenuItem value="te">Telugu</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className="form-group">
              <FormControl fullWidth margin="normal" className="form-field">
                <InputLabel>Time Format</InputLabel>
                <Select 
                  value={timeFormat} 
                  onChange={(e) => setTimeFormat(e.target.value)}
                  label="Time Format"
                >
                  <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                  <MenuItem value="24h">24-hour</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="logout-card">
        <CardContent>
          <Button 
            variant="outlined" 
            fullWidth
            startIcon={<Logout fontSize="medium" />}
            onClick={handleLogout}
            className="logout-button"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'accounts':
        return renderAccountsTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'categories':
        return renderCategoriesTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="settings-container">
      {/* Page Header */}
      <div className="page-header">
        <Typography variant="h4" component="h1" className="page-title">
          Settings
        </Typography>
        <Typography variant="subtitle1" className="page-subtitle">
          Manage your account preferences and security settings
        </Typography>
      </div>

      {/* Main Content */}
      <div className="settings-content">
        {/* Tabs */}
        {renderTabs()}
        
        {/* Tab Content */}
        <div className="tab-content-wrapper">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;