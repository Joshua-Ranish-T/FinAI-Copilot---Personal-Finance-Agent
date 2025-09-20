import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Typography, Card, CardContent, 
  Divider, Avatar, IconButton, FormControlLabel, Checkbox, 
  Link, Alert, Tooltip, Paper, Box
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, ArrowRight, Mail, Password, Person, Facebook, Twitter, GitHub, Google } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Toggle between login and registration forms
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // In a real implementation, this would call the login API
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // In a real implementation, this would call the registration API
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to register. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter' | 'github') => {
    setLoading(true);
    try {
      console.log(`Logging in with ${provider}`);
      // In a real application, this would integrate with the respective social login API
      // For now, we'll just simulate a successful social login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful social login, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Social login failed. Please try again.');
      console.error(`Social login with ${provider} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Paper elevation={0} className="login-paper">
        <Card className="login-card">
          <CardContent className="login-content">
          {/* Logo and Header */}
          <div className="login-header">
            <Avatar className="app-logo">
              <Lock className="logo-icon" />
            </Avatar>
            <Typography variant="h5" className="login-title">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </Typography>
            <Typography variant="body2" className="login-subtitle">
              {isRegistering 
                ? 'Sign up to start managing your finances' 
                : 'Log in to access your financial assistant'}
            </Typography>
          </div>

          {/* Error Message */}
          {error && (
            <Alert severity="error" className="error-alert">
              {error}
            </Alert>
          )}

          {/* Form */}
          <form 
            onSubmit={isRegistering ? handleRegister : handleLogin} 
            className="login-form"
          >
            {/* Name Field (for Registration) */}
            {isRegistering && (
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-field"
                InputProps={{
                  startAdornment: <Person fontSize="small" className="input-icon" />,
                }}
              />
            )}

            {/* Email Field */}
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-field"
              InputProps={{
                startAdornment: <Mail fontSize="small" className="input-icon" />
              }}
            />

            {/* Password Field */}
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-field"
              InputProps={{
                startAdornment: <Password fontSize="small" className="input-icon" />,
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                ),
              }}
            />

            {/* Confirm Password (for Registration) */}
            {isRegistering && (
              <TextField
                label="Confirm Password"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-field"
                InputProps={{
                  startAdornment: <Password fontSize="small" className="input-icon" />,
                }}
              />
            )}

            {/* Remember Me (for Login) */}
            {!isRegistering && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
                className="remember-me"
              />
            )}

            {/* Forgot Password (for Login) */}
            {!isRegistering && (
              <div className="forgot-password">
                <Link href="#" variant="body2" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : isRegistering ? 'Register' : 'Login'}
              <ArrowRight fontSize="small" className="submit-icon" />
            </Button>
          </form>

          {/* Toggle Form Link */}
          <div className="toggle-form">
            <Typography variant="body2" className="toggle-text">
              {isRegistering 
                ? 'Already have an account? ' 
                : 'Don\'t have an account? '}
              <Link 
                href="#" 
                variant="body2" 
                className="toggle-link"
                onClick={(e) => {
                  e.preventDefault();
                  toggleForm();
                }}
              >
                {isRegistering ? 'Login' : 'Register'}
              </Link>
            </Typography>
          </div>

          {/* Divider */}
          <div className="divider-container">
            <Divider className="divider" />
            <Typography variant="body2" className="divider-text">
              or
            </Typography>
            <Divider className="divider" />
          </div>

          {/* Social Login */}
          <div className="social-login">
            <Tooltip title="Login with Google">
              <IconButton onClick={() => handleSocialLogin('google')} className="social-icon" disabled={loading}>
                <Google fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Login with Facebook">
              <IconButton onClick={() => handleSocialLogin('facebook')} className="social-icon" disabled={loading}>
                <Facebook fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Login with Twitter">
              <IconButton onClick={() => handleSocialLogin('twitter')} className="social-icon" disabled={loading}>
                <Twitter fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Login with GitHub">
              <IconButton onClick={() => handleSocialLogin('github')} className="social-icon" disabled={loading}>
                <GitHub fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>

          {/* Terms and Privacy */}
          {isRegistering && (
            <div className="terms-privacy">
              <Typography variant="body2" className="terms-text">
                By registering, you agree to our
                <Link href="#" variant="body2" className="terms-link"> Terms of Service </Link>
                and
                <Link href="#" variant="body2" className="terms-link"> Privacy Policy</Link>.
              </Typography>
            </div>
          )}
    </CardContent>
        </Card>
      </Paper>
    </div>);
};

export default Login;