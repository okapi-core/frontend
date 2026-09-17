import {
  ButtonProps,
  ColorSchemeScript,
  MantineColorsTuple,
  MantineProvider,
  MantineTheme,
  createTheme,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import './globals.css';
import { AppServicesProvider } from './lib/app-services';
import AppRouter from './router';

const antdBlue: MantineColorsTuple = [
  '#eef6ff',
  '#d4e8ff',
  '#abd4ff',
  '#80beff',
  '#57a7ff',
  '#2f8fff',
  '#1f75e6',
  '#165bbf',
  '#0f4199',
  '#092b66',
];

const theme = createTheme({
  colors: {
    antdBlue,
  },
  primaryColor: 'antdBlue',
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  headings: {
    fontFamily: 'Helvetica Neue, Arial, sans-serif',
    fontWeight: '600',
  },
  fontSizes: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
  },
  radius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.06)',
    sm: '0 2px 6px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
      styles: (_theme: MantineTheme, props: ButtonProps) => {
        const variant = props?.variant ?? 'filled';
        let boxShadow = 'none';

        if (variant === 'default') {
          boxShadow = '0 2px 0px rgba(145, 145, 145, 0.25)';
        } else if (variant === 'light') {
          boxShadow = '0 2px 0px rgba(105, 176, 255, 0.25)';
        } else if (variant === 'filled') {
          boxShadow = '0 2px 0px rgba(64, 153, 255, 0.35)';
        }

        return {
          root: {
            fontWeight: 500,
            height: '32px',
            paddingLeft: '14px',
            paddingRight: '14px',
            boxShadow,
          },
        };
      },
    },
    Input: {
      defaultProps: {
        size: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    PasswordInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    NumberInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
      },
    },
    MultiSelect: {
      defaultProps: {
        size: 'sm',
      },
    },
    Autocomplete: {
      defaultProps: {
        size: 'sm',
      },
      styles: (theme: MantineTheme) => ({
        input: {
          height: '32px',
          borderRadius: '6px',
          fontSize: '14px',
          borderColor: 'var(--mantine-color-gray-4)',
          '&:focus': {
            // borderColor: theme.colors[theme.primaryColor][5],
            borderColor: antdBlue[4],
          },
          '&:focus-within': {
            borderColor: theme.colors[theme.primaryColor][5],
          },
        },
      }),
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
        withBorder: true,
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
      },
    },
    Menu: {
      defaultProps: {
        shadow: 'sm',
      },
    },
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <Toaster position="top-center" closeButton />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppServicesProvider>
            <AppRouter />
          </AppServicesProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
