import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleClearStorage = () => {
    try {
      // Clear localStorage to free up space
      const keysToKeep = ['mock_branches', 'mock_tables', 'mock_orders', 'mock_staff', 'mock_brands', 'mock_users'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key) && !key.startsWith('img_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear old image data
      const imageKeys = Object.keys(localStorage).filter(key => key.startsWith('img_'));
      imageKeys.forEach(key => localStorage.removeItem(key));
      
      console.log('Storage cleared successfully');
      this.handleReset();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                The application encountered an unexpected error. This might be due to storage issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleClearStorage} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear Storage & Retry
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                If the problem persists, please refresh the page or contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

