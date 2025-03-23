// ToastNotification.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Snackbar, Alert, LinearProgress } from '@mui/material';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const SnackbarContext = createContext(null);
const NOTIFICATION_DURATION = 5000; // 5 seconds

const snackbarStyles = {
  success: {
    icon: <CheckCircle size={24} strokeWidth={2.5} />,
    color: '#34C759',
    lightColor: 'rgba(52, 199, 89, 0.95)'
  },
  error: {
    icon: <AlertCircle size={24} strokeWidth={2.5} />,
    color: '#FF3B30',
    lightColor: 'rgba(255, 59, 48, 0.95)'
  },
  info: {
    icon: <Info size={24} strokeWidth={2.5} />,
    color: '#007AFF',
    lightColor: 'rgba(0, 122, 255, 0.95)'
  },
  warning: {
    icon: <AlertTriangle size={24} strokeWidth={2.5} />,
    color: '#FF9500',
    lightColor: 'rgba(255, 149, 0, 0.95)'
  }
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentSnackbar, setCurrentSnackbar] = useState(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let timer;
    let progressTimer;

    if (open && progress > 0) {
      // Start the progress bar countdown
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (NOTIFICATION_DURATION / 100));
          return Math.max(newProgress, 0);
        });
      }, 100);

      // Set timer to auto-close
      timer = setTimeout(() => {
        setOpen(false);
      }, NOTIFICATION_DURATION);
    }

    return () => {
      clearInterval(progressTimer);
      clearTimeout(timer);
    };
  }, [open]);

  const enqueueSnackbar = (message, type, position = { vertical: 'top', horizontal: 'center' }) => {
    setQueue(prev => [...prev, { message, type, position }]);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleExited = () => {
    setCurrentSnackbar(null);
    setProgress(100);
  };

  useEffect(() => {
    if (queue.length && !currentSnackbar) {
      setCurrentSnackbar(queue[0]);
      setQueue(prev => prev.slice(1));
      setOpen(true);
      setProgress(100);
    } else if (queue.length && currentSnackbar && open) {
      setOpen(false);
    }
  }, [queue, currentSnackbar, open]);

  // Helper to safely parse position string
  const parsePosition = (positionStr) => {
    // Default position
    const defaultPosition = { vertical: 'top', horizontal: 'center' };
    
    // If position is not a string, return default
    if (typeof positionStr !== 'string') {
      return defaultPosition;
    }
    
    const vertical = positionStr.includes('bottom') ? 'bottom' : 'top';
    const horizontal = positionStr.includes('left') ? 'left' : 
                      positionStr.includes('right') ? 'right' : 'center';
    
    return { vertical, horizontal };
  };

  const toast = {
    success: (message, position) => {
      enqueueSnackbar(message, 'success', parsePosition(position));
    },
    error: (message, position) => {
      enqueueSnackbar(message, 'error', parsePosition(position));
    },
    info: (message, position) => {
      enqueueSnackbar(message, 'info', parsePosition(position));
    },
    warning: (message, position) => {
      enqueueSnackbar(message, 'warning', parsePosition(position));
    }
  };

  return (
    <SnackbarContext.Provider value={toast}>
      {children}
      {currentSnackbar && (
        <Snackbar
          open={open}
          autoHideDuration={NOTIFICATION_DURATION}
          onClose={handleClose}
          TransitionProps={{ onExited: handleExited }}
          anchorOrigin={currentSnackbar.position}
          sx={{
            '& .MuiPaper-root': {
              width: '100%',
              maxWidth: '420px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <div style={{ width: '100%' }}>
            <Alert
              onClose={handleClose}
              severity={currentSnackbar.type}
              variant="filled"
              icon={snackbarStyles[currentSnackbar.type].icon}
              sx={{
                width: '100%',
                backgroundColor: snackbarStyles[currentSnackbar.type].lightColor,
                '& .MuiAlert-icon': { 
                  color: 'white',
                  marginRight: '16px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                },
                '& .MuiAlert-message': { 
                  color: 'white',
                  padding: '6px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  lineHeight: '1.5'
                },
                '& .MuiAlert-action': { 
                  color: 'white',
                  padding: '0 8px',
                  alignItems: 'center'
                },
                borderRadius: '12px',
                padding: '16px 24px',
                minHeight: '64px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {currentSnackbar.message}
            </Alert>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  transition: 'transform .1s linear'
                },
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: '0 0 12px 12px'
              }}
            />
          </div>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;