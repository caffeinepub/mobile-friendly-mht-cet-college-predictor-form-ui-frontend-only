import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface GoLiveRetryCardProps {
  onRetry: () => void;
  isRetrying?: boolean;
  errorMessage?: string;
}

export function GoLiveRetryCard({ onRetry, isRetrying = false, errorMessage }: GoLiveRetryCardProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Connection Failed
        </CardTitle>
        <CardDescription>
          Unable to establish connection to the backend service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>What happened?</AlertTitle>
          <AlertDescription>
            {errorMessage || 'The connection to the backend timed out or failed to initialize. This can happen due to network issues or if the service is temporarily unavailable.'}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>What you can do:</strong>
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Click the retry button below to attempt reconnection</li>
          </ul>
        </div>

        <Button 
          onClick={onRetry} 
          disabled={isRetrying}
          className="w-full"
          size="lg"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
