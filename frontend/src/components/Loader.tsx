import React from 'react';
import { CircularProgress, Backdrop, Box, Typography } from '@mui/material';
import './Loader.css';

interface LoaderProps {
  open: boolean;
  message?: string;
  backdrop?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit' | 'error' | 'info' | 'success' | 'warning';
}

const Loader: React.FC<LoaderProps> = ({
  open,
  message,
  backdrop = false,
  size = 'medium',
  color = 'primary'
}) => {
  if (!open) return null;

  if (backdrop) {
    return (
      <Backdrop
        open={open}
        className="loader-backdrop"
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Box className="loader-container">
          <CircularProgress size={size === 'small' ? 40 : size === 'medium' ? 60 : 80} color={color} />
          {message && (
            <Typography variant="body1" className="loader-message">
              {message}
            </Typography>
          )}
        </Box>
      </Backdrop>
    );
  }

  return (
    <Box className={`loader ${size}`}>
      <CircularProgress size={size === 'small' ? 24 : size === 'medium' ? 40 : 60} color={color} />
      {message && (
        <Typography variant={size === 'small' ? 'body2' : 'body1'} className="loader-message">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loader;