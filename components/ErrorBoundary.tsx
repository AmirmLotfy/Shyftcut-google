import React, { ErrorInfo, ReactNode } from 'react';
import GenericErrorPage from '../pages/GenericErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: The ErrorBoundary class must extend React.Component to function correctly as a class component,
// giving it access to state, props, and lifecycle methods required for error handling.
// FIX: The ErrorBoundary class must extend React.Component to be a valid class component with access to state and props.
class ErrorBoundary extends React.Component<Props, State> {
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