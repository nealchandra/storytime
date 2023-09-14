'use client';

import React from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
  responsiveFontSizes,
} from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';

import { ThemeProvider } from '@/components/theme-provider';

var theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Merriweather, serif',
    },
    button: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export const Providers: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <MUIThemeProvider theme={theme}>
        <CssBaseline>
          {children}
          <Analytics />
        </CssBaseline>
      </MUIThemeProvider>
    </ThemeProvider>
  );
};
