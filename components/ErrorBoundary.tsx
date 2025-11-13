import React, { Component, ErrorInfo, ReactNode } from 'react';
import GenericErrorPage from '../pages/GenericErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: Changed to extend from the imported `Component` class directly.
// This resolves type errors where `setState` and `props` were not being recognized on the class instance.
class ErrorBoundary extends Component<Props, State> {
  // Initialize state using modern class property syntax.
  state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You could also log the error to an error reporting service here
  }

  private handleReset = () => {
    // A full page reload is a simple way to reset the entire application's state.
    this.setState({ hasError: false }, () => {
        window.location.reload();
    });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // If an error was caught, render the fallback UI with a reset option.
      return <GenericErrorPage onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
