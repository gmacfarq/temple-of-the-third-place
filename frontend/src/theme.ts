import { createTheme } from '@mantine/core';

export const templeTheme = createTheme({
  primaryColor: 'dark',
  colors: {
    // Monochromatic palette
    dark: [
      '#f8f9fa',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529',
      '#000000',
    ],
  },
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  headings: {
    fontFamily: 'Helvetica Neue, Arial, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.3' },
      h3: { fontSize: '1.5rem', lineHeight: '1.4' },
    }
  },
  components: {
    Button: {
      defaultProps: {
        radius: 0,
        variant: 'filled',
      },
      styles: (theme) => ({
        root: {
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: theme.shadows.sm,
            backgroundColor: theme.colors.dark[9],
          },
        },
      }),
    },
    Paper: {
      defaultProps: {
        shadow: 'xs',
        radius: 0,
        p: 'xl',
      },
    },
    Badge: {
      defaultProps: {
        radius: 0,
      },
      styles: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
        }
      }
    },
    Text: {
      styles: {
        root: {
          letterSpacing: '0.01em',
        }
      }
    },
    Title: {
      styles: {
        root: {
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }
      }
    },
    Image: {
      styles: {
        root: {
          maxWidth: '100%',
        }
      }
    }
  },
});