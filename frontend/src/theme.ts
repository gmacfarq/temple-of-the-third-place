import { createTheme } from '@mantine/core';

export const templeTheme = createTheme({
  primaryColor: 'dark',
  colors: {
    // Adding a custom color palette that's more monochromatic
    brand: [
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
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
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
        radius: 'xs',
        variant: 'filled',
      },
      styles: (theme) => ({
        root: {
          fontWeight: 600,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: theme.shadows.sm,
          },
        },
      }),
    },
    Paper: {
      defaultProps: {
        shadow: 'xs',
        radius: 'xs',
        p: 'xl',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'xs',
      },
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
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }
      }
    }
  },
});
});