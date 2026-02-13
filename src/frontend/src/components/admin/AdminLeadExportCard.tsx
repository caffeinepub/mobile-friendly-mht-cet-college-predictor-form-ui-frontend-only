import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Copy, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

export function AdminLeadExportCard() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const isAuthenticated = !!identity;

  // Check admin status when component mounts or actor changes
  const checkAdminStatus = async () => {
    if (!actor || !isAuthenticated) {
      setIsAdmin(false);
      return;
    }

    setIsCheckingAdmin(true);
    try {
      const adminStatus = await actor.isCallerAdmin();
      setIsAdmin(adminStatus);
    } catch (err) {
      console.error('Failed to check admin status:', err);
      setIsAdmin(false);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  // Check admin status on mount and when dependencies change
  useState(() => {
    checkAdminStatus();
  });

  const handleExport = async () => {
    if (!actor) {
      setExportError('Backend connection not available. Please try again.');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setCsvData(null);
    setCopySuccess(false);

    try {
      const csv = await actor.exportLeadsAsCsv();
      setCsvData(csv);
    } catch (err) {
      console.error('Export error:', err);
      
      // Handle authorization errors specifically
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only admins')) {
        setExportError('Access denied: You do not have permission to export leads. Only administrators can perform this action.');
      } else {
        setExportError('Failed to export leads. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!csvData) return;

    try {
      await navigator.clipboard.writeText(csvData);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setExportError('Failed to copy to clipboard. Please try the download option instead.');
    }
  };

  const handleDownload = () => {
    if (!csvData) return;

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Show nothing if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state while checking admin status
  if (isCheckingAdmin) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Admin: Export Leads</CardTitle>
          <CardDescription>Checking permissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show access denied if not admin
  if (isAdmin === false) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Admin: Export Leads</CardTitle>
          <CardDescription>Administrator access required</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access this feature. Only administrators can export lead data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show admin export UI
  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-xl sm:text-2xl">Admin: Export Leads</CardTitle>
        <CardDescription className="text-base">
          Export all stored lead data as CSV for analysis and follow-up
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            size="lg"
            className="flex-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Leads
              </>
            )}
          </Button>
        </div>

        {/* Export Error */}
        {exportError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Export Failed</AlertTitle>
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}

        {/* Export Success with Actions */}
        {csvData && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Export Successful</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Lead data has been exported successfully. You can now copy to clipboard or download as a CSV file.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>

            {/* Copy Success Message */}
            {copySuccess && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                CSV data copied to clipboard successfully!
              </p>
            )}

            {/* Preview */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Preview:</p>
              <div className="bg-muted/50 rounded-md p-3 max-h-48 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {csvData.split('\n').slice(0, 10).join('\n')}
                  {csvData.split('\n').length > 10 && '\n...'}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Showing first 10 rows. Total rows: {csvData.split('\n').length}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
