import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Paper, Title, Text, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Show notification for uncaught errors
    notifications.show({
      title: 'Application Error',
      message: 'Something went wrong. Please try again or contact support.',
      color: 'red',
      autoClose: false
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Paper p="xl" shadow="md" style={{ maxWidth: 500, margin: '100px auto' }}>
          <Title order={2} mb="md">Something went wrong</Title>
          <Text mb="lg">
            We're sorry, but there was an error in the application. Please reload the page.
          </Text>
          <Group justify="flex-end">
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Group>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;