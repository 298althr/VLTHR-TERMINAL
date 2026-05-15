'use client';

import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import { ReactNode } from 'react';

// Define the Glass Theme for MUI
const glassTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007AFF', // Apple Blue
    },
    success: {
      main: '#34C759', // iOS Green
    },
    error: {
      main: '#FF3B30', // iOS Red
    },
    warning: {
      main: '#FF9500', // iOS Orange
    },
    info: {
      main: '#5856D6', // iOS Indigo
    },
    background: {
      default: 'transparent',
      paper: 'rgba(28, 28, 30, 0.7)', // macOS dark mode surface
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.55)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(28, 28, 30, 0.7)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '0.5px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '6px 16px',
          fontSize: '0.875rem',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:active': {
            transform: 'scale(0.96)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.2)',
          '&.Mui-checked': {
            color: '#007AFF',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.2)',
          '&.Mui-checked': {
            color: '#007AFF',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          '&.MuiAlert-standardSuccess': {
            backgroundColor: 'rgba(52, 199, 89, 0.15)',
            borderColor: 'rgba(52, 199, 89, 0.3)',
          },
          '&.MuiAlert-standardError': {
            backgroundColor: 'rgba(255, 59, 48, 0.15)',
            borderColor: 'rgba(255, 59, 48, 0.3)',
          },
          '&.MuiAlert-standardInfo': {
            backgroundColor: 'rgba(0, 122, 255, 0.15)',
            borderColor: 'rgba(0, 122, 255, 0.3)',
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: 'rgba(255, 149, 0, 0.15)',
            borderColor: 'rgba(255, 149, 0, 0.3)',
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#007AFF',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#007AFF',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 24,
          padding: 0,
          display: 'flex',
          '& .MuiSwitch-switchBase': {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: '#34C759', // iOS Green
                border: 0,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 20,
            height: 20,
            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 24 / 2,
            opacity: 1,
            backgroundColor: 'rgba(120, 120, 128, 0.32)',
            boxSizing: 'border-box',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#ffffff', // White level
          height: 6,
          padding: '15px 0',
          transition: 'all 0.1s ease',
          '& .MuiSlider-track': {
            border: 'none',
            height: 6,
            transition: 'height 0.1s ease',
            backgroundColor: '#ffffff',
          },
          '& .MuiSlider-rail': {
            opacity: 1,
            backgroundColor: 'rgb(82, 82, 82)',
            height: 6,
            borderRadius: 999,
            transition: 'height 0.1s ease',
          },
          '& .MuiSlider-thumb': {
            height: 20,
            width: 20,
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
            },
            '&::before': {
              display: 'none',
            },
          },
          '&:hover': {
            '& .MuiSlider-track, & .MuiSlider-rail': {
              height: 10,
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007AFF',
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '&:before, &:after': {
            display: 'none',
          },
        },
        select: {
          padding: '10px 14px',
        },
      },
    },
  },
});

export function MuiGlassProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={glassTheme}>
      {children}
    </ThemeProvider>
  );
}
