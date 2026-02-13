import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Database, Filter, CheckCircle } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How the Predictor Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Understand the prediction process and what the results mean for your college admission journey.
          </p>
        </div>

        <Separator />

        {/* Step 1: Input Your Details */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Step 1: Enter Your Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-base">
              Provide your MHT-CET percentile (required) and category (required). You can optionally specify gender and branch preferences to narrow down results.
            </CardDescription>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li><strong>Percentile:</strong> Your MHT-CET score percentile (0-100)</li>
              <li><strong>Category:</strong> Your admission category (e.g., OPEN, OBC, SC, ST)</li>
              <li><strong>Gender (optional):</strong> Filter results by gender-specific seats</li>
              <li><strong>Branch (optional):</strong> Focus on specific engineering branches</li>
            </ul>
          </CardContent>
        </Card>

        {/* Step 2: Rank Calculation */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Step 2: Rank Calculation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-base">
              Your percentile is converted to an estimated rank based on the candidature type (Maharashtra or All India). 
              This rank is used to match you with eligible colleges.
            </CardDescription>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Maharashtra State:</strong> Rank ≈ (100 - Percentile) × 2,000</p>
              <p><strong>All India:</strong> Rank ≈ (100 - Percentile) × 10,000</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Cutoff Data Matching */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Step 3: Cutoff Data Matching</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-base">
              Your predicted rank is compared against historical cutoff data. Colleges where your rank is equal to or better than 
              the closing rank are shown as eligible options.
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Cutoff data must be uploaded via CSV before predictions can be generated. 
              Without this data, the predictor cannot match your rank to colleges.
            </p>
          </CardContent>
        </Card>

        {/* Step 4: Results */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Step 4: View Your Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-base">
              You'll see a list of colleges and branches where you're eligible for admission, along with:
            </CardDescription>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li>College name and branch</li>
              <li>Historical closing rank for that seat</li>
              <li>Your predicted rank</li>
              <li>Eligibility status</li>
            </ul>
            <p className="text-sm text-muted-foreground pt-2">
              Results are sorted to help you identify the best matches based on your profile.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Important Notes */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-lg text-amber-800 dark:text-amber-300">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
            <p>
              • Predictions are based on historical data and may not reflect current year cutoffs.
            </p>
            <p>
              • Always verify eligibility with official admission authorities.
            </p>
            <p>
              • Cutoff ranks can vary each year based on seat availability and candidate performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
