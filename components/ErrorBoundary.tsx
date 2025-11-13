import React, { Component, ErrorInfo, ReactNode } from 'react';
import GenericErrorPage from '../pages/GenericErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix: The error "Property 'props' does not exist" suggests an initialization issue.
  // Using a constructor ensures the component is initialized correctly and `this.props` is available.
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
