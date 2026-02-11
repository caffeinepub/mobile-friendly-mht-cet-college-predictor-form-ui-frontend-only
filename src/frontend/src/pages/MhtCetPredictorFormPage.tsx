import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Loader2, AlertCircle, Upload, CheckCircle2, Database, Info } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import { Candidature, type Prediction, type ImportResult } from '@/backend';
import { Separator } from '@/components/ui/separator';

export default function MhtCetPredictorFormPage() {
  const [percentile, setPercentile] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [candidature, setCandidature] = useState<string>('');
  const [homeUniversity, setHomeUniversity] = useState<string>('');
  const [tfws, setTfws] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [estimatedRank, setEstimatedRank] = useState<number | null>(null);

  // CSV Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [cutoffsCount, setCutoffsCount] = useState<bigint | null>(null);
  const [isCheckingCutoffs, setIsCheckingCutoffs] = useState<boolean>(true);

  const { actor } = useActor();

  // Check cutoffs count on mount
  useEffect(() => {
    const checkCutoffsCount = async () => {
      if (!actor) return;
      
      try {
        const count = await actor.getCutoffsCount();
        setCutoffsCount(count);
      } catch (err) {
        console.error('Failed to fetch cutoffs count:', err);
      } finally {
        setIsCheckingCutoffs(false);
      }
    };

    checkCutoffsCount();
  }, [actor]);

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
    if (cutoffsCount === null || cutoffsCount === BigInt(0)) {
      setError('No cutoff data available. Please import cutoff data using the CSV upload section above before running predictions.');
      return;
    }

    const percentileValue = parseFloat(percentile);
    if (isNaN(percentileValue) || percentileValue < 0 || percentileValue > 100) {
      setError('Please enter a valid percentile between 0 and 100.');
      return;
    }

    if (!candidature) {
      setError('Please select a candidature type (Maharashtra or All India).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions(null);
    setEstimatedRank(null);

    try {
      // Map UI candidature value to backend enum
      const candidatureEnum = candidature === 'Maharashtra' 
        ? Candidature.maharashtra 
        : Candidature.allIndia;

      // Pass percentile and candidature to backend
      const results = await actor.predictAdmission(percentile, candidatureEnum);
      
      // Calculate estimated rank based on candidature
      // Maharashtra: rank = (100 - CET_percentile) * 2000
      // All India: rank = (100 - JEE_percentile) * 10000
      let predicted_rank: number | null = null;
      if (candidature === 'Maharashtra') {
        predicted_rank = Math.round((100 - percentileValue) * 2000);
      } else if (candidature === 'All India') {
        predicted_rank = Math.round((100 - percentileValue) * 10000);
      }
      
      setPredictions(results);
      setEstimatedRank(predicted_rank);
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

  const universities = [
    'Mumbai University',
    'Savitribai Phule Pune University',
    'Shivaji University Kolhapur',
    'RTM Nagpur University',
    'North Maharashtra University (Jalgaon)',
    'Dr. BAMU Aurangabad',
    'Sant Gadge Baba Amravati University',
    'Solapur University',
    'SNDT Women\'s University',
  ];

  // Dynamic percentile label based on candidature
  const percentileLabel = candidature === 'Maharashtra' ? 'CET Percentile' : 'JEE Percentile';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                MHT-CET College Predictor v2
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Find your best college matches
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Cutoff Data Status Alert */}
          {!isCheckingCutoffs && cutoffsCount !== null && cutoffsCount === BigInt(0) && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-300">No Cutoff Data Available</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Please import cutoff data using the CSV upload section below to enable predictions.
              </AlertDescription>
            </Alert>
          )}

          {/* CSV Upload Section */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl sm:text-2xl">Import Cutoff Data</CardTitle>
              </div>
              <CardDescription className="text-base">
                Upload a CSV file containing historical cutoff records to improve predictions
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
                    disabled={isUploading}
                    className="h-11 text-base cursor-pointer"
                  />
                  <Button
                    onClick={handleCsvUpload}
                    disabled={!selectedFile || isUploading}
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

          {/* Predictor Form */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl sm:text-3xl">Enter Your Details</CardTitle>
              <CardDescription className="text-base">
                Fill in your MHT-CET exam details to predict your college options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Percentile - Dynamic label based on candidature */}
                <div className="space-y-2">
                  <Label htmlFor="percentile" className="text-base font-medium">
                    {candidature ? percentileLabel : 'Percentile'} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="percentile"
                    type="number"
                    step={0.01}
                    min={0}
                    max={100}
                    placeholder="Enter your percentile (0-100)"
                    value={percentile}
                    onChange={handlePercentileChange}
                    className="h-11 text-base"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory} required disabled={isLoading}>
                    <SelectTrigger id="category" className="h-11 text-base">
                      <SelectValue placeholder="Select your category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">OPEN</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="EWS">EWS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-base font-medium">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select value={gender} onValueChange={setGender} required disabled={isLoading}>
                    <SelectTrigger id="gender" className="h-11 text-base">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Candidature */}
                <div className="space-y-2">
                  <Label htmlFor="candidature" className="text-base font-medium">
                    Candidature <span className="text-destructive">*</span>
                  </Label>
                  <Select value={candidature} onValueChange={setCandidature} required disabled={isLoading}>
                    <SelectTrigger id="candidature" className="h-11 text-base">
                      <SelectValue placeholder="Select candidature type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="All India">All India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Home University */}
                <div className="space-y-2">
                  <Label htmlFor="homeUniversity" className="text-base font-medium">
                    Home University <span className="text-destructive">*</span>
                  </Label>
                  <Select value={homeUniversity} onValueChange={setHomeUniversity} required disabled={isLoading}>
                    <SelectTrigger id="homeUniversity" className="h-11 text-base">
                      <SelectValue placeholder="Select your home university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem key={university} value={university}>
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* TFWS */}
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="tfws" className="text-base font-medium cursor-pointer">
                      Tuition Fee Waiver Scheme (TFWS)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Are you eligible for TFWS?
                    </p>
                  </div>
                  <Switch
                    id="tfws"
                    checked={tfws}
                    onCheckedChange={setTfws}
                    disabled={isLoading}
                  />
                </div>

                {/* Error Alert */}
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
                  className="w-full text-base font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    'Get Predictions'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          {predictions !== null && (
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl sm:text-3xl">Eligible College Options</CardTitle>
                <CardDescription className="text-base">
                  Based on your predicted rank of <strong>{estimatedRank?.toLocaleString()}</strong>, here are the colleges where you are eligible for admission (predicted rank ≤ closing rank)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictions.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Eligible Colleges Found</AlertTitle>
                    <AlertDescription>
                      Based on your predicted rank, no colleges in the current dataset meet the eligibility criteria. This may be due to limited cutoff data or a lower percentile. Try importing more cutoff records or adjusting your inputs.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>{predictions.length}</strong> eligible college option{predictions.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold">College Name</TableHead>
                              <TableHead className="font-semibold">Branch</TableHead>
                              <TableHead className="font-semibold text-right">Your Rank</TableHead>
                              <TableHead className="font-semibold text-right">Closing Rank</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {predictions.map((prediction, index) => (
                              <TableRow key={index} className="hover:bg-muted/30">
                                <TableCell className="font-medium">
                                  {prediction.college_name}
                                </TableCell>
                                <TableCell>{prediction.branch_name}</TableCell>
                                <TableCell className="text-right font-mono">
                                  {Number(prediction.predicted_rank).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {Number(prediction.closing_rank).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'mht-cet-predictor'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
