import { useState, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GraduationCap, Loader2, AlertCircle, Upload, CheckCircle2, Database } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import type { Prediction, ImportResult } from '@/backend';
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

  const { actor } = useActor();

  const handlePercentileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPercentile(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!actor) {
      setError('Backend connection not available. Please try again.');
      return;
    }

    const percentileValue = parseFloat(percentile);
    if (isNaN(percentileValue) || percentileValue < 0 || percentileValue > 100) {
      setError('Please enter a valid percentile between 0 and 100.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions(null);
    setEstimatedRank(null);

    try {
      // Pass percentile as string to backend (backend expects Text/string)
      const results = await actor.predictAdmission(percentile);
      
      // Calculate estimated rank from percentile
      // Truncate decimal percentile to integer first, then apply formula
      // Formula: rank = (100 - integer_percentile) * 2000
      const integerPercentile = Math.trunc(percentileValue);
      const calculatedRank = (100 - integerPercentile) * 2000;
      
      setPredictions(results);
      setEstimatedRank(calculatedRank);
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
                {/* CET Percentile */}
                <div className="space-y-2">
                  <Label htmlFor="percentile" className="text-base font-medium">
                    CET Percentile <span className="text-destructive">*</span>
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
                      TFWS (Tuition Fee Waiver Scheme)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Are you applying under TFWS?
                    </p>
                  </div>
                  <Switch
                    id="tfws"
                    checked={tfws}
                    onCheckedChange={setTfws}
                    className="data-[state=checked]:bg-primary"
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    'Predict My Colleges'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {predictions && predictions.length > 0 && estimatedRank !== null && (
            <Card className="mt-6 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Your Prediction Results</CardTitle>
                <CardDescription className="text-base">
                  Based on your percentile of {percentile}%, your estimated rank is approximately{' '}
                  <span className="font-semibold text-foreground">
                    {estimatedRank.toLocaleString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">College Name</TableHead>
                        <TableHead className="font-semibold">Branch</TableHead>
                        <TableHead className="font-semibold text-right">Closing Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.map((prediction, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{prediction.college_name}</TableCell>
                          <TableCell>{prediction.branch_name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {prediction.closing_rank.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {predictions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-base">
                      No colleges found matching your criteria. Try adjusting your filters or upload more cutoff data.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {predictions && predictions.length === 0 && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Results Found</AlertTitle>
              <AlertDescription>
                No colleges match your current criteria. This could mean your rank is very competitive, or there may not be enough cutoff data available. Try uploading more historical cutoff data using the CSV import feature above.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} MHT-CET College Predictor v2. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
