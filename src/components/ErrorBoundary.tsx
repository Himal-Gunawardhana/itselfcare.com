import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred. This might be due to:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
                <li>AWS Cognito not being configured yet</li>
                <li>Google OAuth credentials missing</li>
                <li>Network connection issues</li>
              </ul>

              {this.state.error && (
                <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={this.handleReset} className="w-full">
                  Go to Homepage
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                To enable authentication, see{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  QUICK_START_AUTH.md
                </code>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
