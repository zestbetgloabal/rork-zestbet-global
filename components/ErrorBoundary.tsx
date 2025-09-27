import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import colors from '@/constants/colors';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = (error as { message?: string })?.message ?? 'Unknown error';
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.log('[ErrorBoundary] Caught error:', error);
    console.log('[ErrorBoundary] Info:', info);
  }

  handleReset = () => {
    console.log('[ErrorBoundary] Reset pressed');
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="errorBoundary">
          <AlertTriangle size={48} color={colors.error} style={styles.icon} />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.errorMessage ?? 'An unexpected error occurred. The app will continue with mock data.'}
          </Text>
          <TouchableOpacity onPress={this.handleReset} style={styles.button} testID="errorBoundary-reset">
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 16,
  },
});

export default ErrorBoundary;
