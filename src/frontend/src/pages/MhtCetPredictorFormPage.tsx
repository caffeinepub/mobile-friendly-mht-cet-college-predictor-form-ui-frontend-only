import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import type { Prediction } from '@/backend';

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

  const { actor } = useActor();

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
      const results = await actor.predictAdmission(percentileValue);
      
      // Calculate estimated rank from percentile
      // Formula: approxRank = (100 - percentile) * 100,000
      const calculatedRank = Math.round((100 - percentileValue) * 100000);
      
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

  const getChanceBadgeColor = (chance: string) => {
    switch (chance.toLowerCase()) {
      case 'dream':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'probable':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'safe':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
                MHT-CET College Predictor
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
        <div className="max-w-2xl mx-auto">
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
                    placeholder="Enter your percentile (0-100)"
                    value={percentile}
                    onChange={(e) => setPercentile(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
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
                        <TableHead className="font-semibold">College</TableHead>
                        <TableHead className="font-semibold">Branch</TableHead>
                        <TableHead className="font-semibold">Chance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.map((prediction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{prediction.college}</TableCell>
                          <TableCell>{prediction.branch}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getChanceBadgeColor(
                                prediction.chance
                              )}`}
                            >
                              {prediction.chance}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="mt-6 border-border/50 bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                This predictor uses previous year CAP round cutoff data to estimate your college options.
                Results are indicative and actual admissions may vary.
              </p>
            </CardContent>
          </Card>
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
              className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
