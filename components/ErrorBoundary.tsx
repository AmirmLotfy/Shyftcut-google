import React, { Component, ErrorInfo, ReactNode } from 'react';
import GenericErrorPage from '../pages/GenericErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: The class property syntax for `state` was causing an issue with props type inference
  // in this specific environment. Using a constructor ensures `this.props` is correctly
  // initialized via `super(props)` before the state is set, resolving the error.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You could also log the error to an error reporting service here
  }

  // Use an arrow function for the event handler to automatically bind 'this'.
  private handleReset = () => {
    // A full page reload is a simple way to reset the entire application's state.
    window.location.reload();
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
