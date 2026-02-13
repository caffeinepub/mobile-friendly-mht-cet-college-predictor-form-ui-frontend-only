import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Upload, CheckCircle2, Database, Info } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import { Candidature, type Prediction, type ImportResult } from '@/backend';
import { Separator } from '@/components/ui/separator';
import { LeadCaptureForm } from '@/components/lead-capture/LeadCaptureForm';
import { predictorDefaults } from '@/utils/predictorDefaults';
import { AdminLeadExportCard } from '@/components/admin/AdminLeadExportCard';

export default function MhtCetPredictorFormPage() {
  // Step 1 inputs: percentile (required), category (required), gender (optional), branch preference (optional)
  const [percentile, setPercentile] = useState<string>('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [branchPreference, setBranchPreference] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [estimatedRank, setEstimatedRank] = useState<number | null>(null);

  // Lead capture states
  const [showLeadCapture, setShowLeadCapture] = useState<boolean>(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [pendingPredictions, setPendingPredictions] = useState<Prediction[] | null>(null);
  const [pendingEstimatedRank, setPendingEstimatedRank] = useState<number | null>(null);

  // CSV Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [cutoffsCount, setCutoffsCount] = useState<bigint | null>(null);
  const [isCheckingCutoffs, setIsCheckingCutoffs] = useState<boolean>(false);

  // Maximum closing rank state
  const [maxClosingRank, setMaxClosingRank] = useState<bigint | null>(null);

  const { actor, isFetching: actorFetching } = useActor();

  // Actor initialization state
  const [actorInitError, setActorInitError] = useState<boolean>(false);

  // Check cutoffs count on mount - only when actor is ready
  useEffect(() => {
    if (!actor || actorFetching) {
      return;
    }

    const checkCutoffsCount = async () => {
      setIsCheckingCutoffs(true);
      setActorInitError(false);
      
      try {
        const count = await actor.getCutoffsCount();
        setCutoffsCount(count);
        
        // Fetch max closing rank if cutoffs exist
        if (count > BigInt(0)) {
          const maxRank = await actor.getMaxClosingRank();
          setMaxClosingRank(maxRank);
        }
      } catch (err) {
        console.error('Failed to fetch cutoffs count:', err);
        setActorInitError(true);
      } finally {
        setIsCheckingCutoffs(false);
      }
    };

    checkCutoffsCount();
  }, [actor, actorFetching]);

  const handlePercentileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPercentile(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!actor) {
      setError('Backend connection not available. Please try again.');
      return;
    }

    // Check if cutoff data has been imported
    const hasCutoffData = cutoffsCount !== null && cutoffsCount > BigInt(0);
    if (!hasCutoffData) {
      setError('No cutoff data available. Please upload cutoff data using the CSV upload section above before running predictions.');
      return;
    }

    // Step 5 validation: percentile and category are required
    const percentileValue = parseFloat(percentile);
    if (isNaN(percentileValue) || percentileValue < 0 || percentileValue > 100) {
      setError('Please enter a valid percentile between 0 and 100.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Clear any previously displayed results before starting new prediction
    setPredictions(null);
    setEstimatedRank(null);

    try {
      // Use internal default candidature for rank calculation
      const candidatureEnum = predictorDefaults.candidature;

      // Build PredictStep1 object with category (required) and optional gender/branchName
      const step1Params = {
        category: category,
        // Only include gender if provided (not undefined)
        ...(gender && { gender: gender }),
        // Only include branchName if provided (not undefined)
        ...(branchPreference && { branchName: branchPreference }),
      };

      // Call predictAdmissionStep1 with percentile, step1 filters, and candidature
      const results: Prediction[] = await actor.predictAdmissionStep1(
        percentile,
        step1Params,
        candidatureEnum
      );
      
      // Extract predicted_rank from first result (all have same predicted_rank)
      const predicted_rank = results.length > 0 ? Number(results[0].predicted_rank) : Math.round((100 - percentileValue) * 2000);
      
      // Store predictions in pending state and show lead capture modal
      setPendingPredictions(results);
      setPendingEstimatedRank(predicted_rank);
      setShowLeadCapture(true);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to get predictions. Please check your input and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (leadData: { name: string; mobile: string; whatsapp: string; telegram: boolean; email?: string }) => {
    if (!actor) {
      throw new Error('Backend connection not available');
    }

    setIsSubmittingLead(true);

    try {
      // Submit lead to backend with correct signature: name, mobile, whatsapp, telegram, email
      // Pass null for email if not provided (not empty string)
      await actor.addLead(
        leadData.name,
        leadData.mobile,
        leadData.whatsapp,
        leadData.telegram,
        leadData.email ? leadData.email : null
      );
      
      // On success: move pending predictions to displayed predictions and close modal
      setPredictions(pendingPredictions);
      setEstimatedRank(pendingEstimatedRank);
      setShowLeadCapture(false);
      
      // Clear pending data
      setPendingPredictions(null);
      setPendingEstimatedRank(null);
    } catch (err) {
      console.error('Lead submission error:', err);
      // Throw error with English message so modal stays open and results stay hidden
      throw new Error('Failed to submit your details. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setUploadError('Please select a valid CSV file.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
      setImportResult(null);
    }
  };

  const handleCsvUpload = async () => {
    if (!selectedFile || !actor) {
      setUploadError('Please select a CSV file and ensure backend connection is available.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setImportResult(null);

    try {
      // Read file contents as text
      const fileText = await selectedFile.text();
      
      // Call backend import method
      const result = await actor.importCutoffsCsv(fileText);
      
      setImportResult(result);
      
      // Fetch updated cutoffs count
      const count = await actor.getCutoffsCount();
      setCutoffsCount(count);
      
      // Fetch updated max closing rank
      if (count > BigInt(0)) {
        const maxRank = await actor.getMaxClosingRank();
        setMaxClosingRank(maxRank);
      }
      
      // Clear file selection on success
      setSelectedFile(null);
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('CSV upload error:', err);
      setUploadError(
        err instanceof Error 
          ? err.message 
          : 'Failed to upload CSV. Please check the file format and try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Show connecting state while actor is initializing
  const isConnecting = actorFetching || (!actor && !actorInitError);
  const hasCutoffData = cutoffsCount !== null && cutoffsCount > BigInt(0);

  return (
    <div className="space-y-6">
      {/* Connecting State */}
      {isConnecting && (
        <Alert className="border-muted bg-muted/30">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <AlertTitle className="text-foreground">Connecting...</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Establishing connection to the backend. Please wait a moment.
          </AlertDescription>
        </Alert>
      )}

      {/* Actor Initialization Error */}
      {actorInitError && !isConnecting && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Failed to connect to the backend. Please refresh the page and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Cutoff Data Status Alert */}
      {!isCheckingCutoffs && !isConnecting && !hasCutoffData && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Upload Cutoff Data When Ready</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            To enable predictions, upload a CSV file with historical cutoff records using the section below. 
            You can browse the site and return to upload data later.
          </AlertDescription>
        </Alert>
      )}

      {/* CSV Upload Section */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl sm:text-2xl">Import Cutoff Data (Optional)</CardTitle>
          </div>
          <CardDescription className="text-base">
            Upload a CSV file containing historical cutoff records when you're ready to enable predictions
          </CardDescription>
          {cutoffsCount !== null && cutoffsCount > BigInt(0) && (
            <p className="text-sm text-muted-foreground pt-2">
              <strong>Current cutoff records:</strong> {cutoffsCount.toString()}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file" className="text-base font-medium">
              Select CSV File
            </Label>
            <div className="flex gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading || !actor}
                className="h-11 text-base cursor-pointer"
              />
              <Button
                onClick={handleCsvUpload}
                disabled={!selectedFile || isUploading || !actor}
                size="lg"
                className="shrink-0"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              CSV should contain columns: closing_rank, college_name, branch_name, category, gender, seat_type, percentile
            </p>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Import Success */}
          {importResult && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Import Successful</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                <div className="space-y-1 mt-2">
                  <p>
                    <strong>Total rows processed:</strong> {importResult.total_rows.toString()}
                  </p>
                  <p>
                    <strong>Records imported:</strong> {importResult.records_imported.toString()}
                  </p>
                  {cutoffsCount !== null && (
                    <p>
                      <strong>Current total cutoffs:</strong> {cutoffsCount.toString()}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Row-level Errors */}
          {importResult && importResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Errors ({importResult.errors.length})</AlertTitle>
              <AlertDescription>
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {importResult.errors.map(([rowNum, errMsg], idx) => (
                    <div key={idx} className="text-sm">
                      <strong>Row {rowNum.toString()}:</strong> {errMsg}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Admin Lead Export Section */}
      <AdminLeadExportCard />

      <Separator className="my-8" />

      {/* Predictor Form */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl sm:text-2xl">Enter Your Details</CardTitle>
          <CardDescription className="text-base">
            Provide your MHT-CET percentile and preferences to get college predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Percentile Input */}
            <div className="space-y-2">
              <Label htmlFor="percentile" className="text-base font-medium">
                Percentile <span className="text-destructive">*</span>
              </Label>
              <Input
                id="percentile"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="Enter your MHT-CET percentile (0-100)"
                value={percentile}
                onChange={handlePercentileChange}
                disabled={!actor || isLoading}
                className="h-11 text-base"
                required
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
                disabled={!actor || isLoading}
                required
              >
                <SelectTrigger id="category" className="h-11 text-base">
                  <SelectValue placeholder="Select your category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">OPEN</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                  <SelectItem value="EWS">EWS</SelectItem>
                  <SelectItem value="TFWS">TFWS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender Select (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-base font-medium">
                Gender <span className="text-muted-foreground text-sm">(Optional)</span>
              </Label>
              <Select
                value={gender}
                onValueChange={(value) => setGender(value)}
                disabled={!actor || isLoading}
              >
                <SelectTrigger id="gender" className="h-11 text-base">
                  <SelectValue placeholder="Select gender (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="ANY">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Preference Input (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-base font-medium">
                Branch Preference <span className="text-muted-foreground text-sm">(Optional)</span>
              </Label>
              <Input
                id="branch"
                type="text"
                placeholder="e.g., Computer Engineering (optional)"
                value={branchPreference || ''}
                onChange={(e) => setBranchPreference(e.target.value || undefined)}
                disabled={!actor || isLoading}
                className="h-11 text-base"
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={!actor || isLoading || !hasCutoffData}
              className="w-full text-base h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Predictions...
                </>
              ) : (
                'Get Predictions'
              )}
            </Button>

            {!hasCutoffData && !isConnecting && (
              <p className="text-sm text-muted-foreground text-center">
                Upload cutoff data above to enable predictions
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {predictions && predictions.length > 0 && estimatedRank !== null && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-xl sm:text-2xl">Your Predictions</CardTitle>
            <CardDescription className="text-base">
              Based on your percentile of <strong>{percentile}</strong>, your estimated rank is{' '}
              <Badge variant="secondary" className="text-base px-3 py-1">
                {estimatedRank.toLocaleString()}
              </Badge>
            </CardDescription>
            {maxClosingRank !== null && (
              <p className="text-sm text-muted-foreground">
                Maximum closing rank in dataset: {maxClosingRank.toString()}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">College</TableHead>
                    <TableHead className="font-semibold">Branch</TableHead>
                    <TableHead className="font-semibold text-right">Closing Rank</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((pred, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{pred.college_name}</TableCell>
                      <TableCell>{pred.branch_name}</TableCell>
                      <TableCell className="text-right">{Number(pred.closing_rank).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {pred.eligible ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            Eligible
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Eligible</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {predictions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No eligible colleges found for your criteria. Try adjusting your filters.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureForm
        isOpen={showLeadCapture}
        onSubmit={handleLeadSubmit}
        isSubmitting={isSubmittingLead}
      />
    </div>
  );
}
