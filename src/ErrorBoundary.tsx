import React, { ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { captureException } from './services/sentryService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    captureException(error, { componentStack: errorInfo.componentStack });
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            Please restart the app or contact fleet support if this issue persists.
          </Text>
          {__DEV__ && this.state.error ? (
            <Text style={styles.debugText}>{this.state.error.toString()}</Text>
          ) : null}
          {__DEV__ && this.state.errorInfo?.componentStack ? (
            <Text style={styles.debugText}>{this.state.errorInfo.componentStack}</Text>
          ) : null}
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F1EC',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#171716',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#65635F',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  debugText: {
    color: '#B91C1C',
    fontSize: 12,
    marginTop: 12,
  },
});
