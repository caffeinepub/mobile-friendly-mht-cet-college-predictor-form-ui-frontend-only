import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import MhtCetPredictorFormPage from './MhtCetPredictorFormPage';

export default function PredictorPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Intro Section */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            College Admission Predictor
          </h2>
          <p className="text-muted-foreground text-base">
            Enter your MHT-CET percentile and preferences to discover eligible colleges and branches.
          </p>
        </div>

        {/* Data Upload Guidance */}
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Cutoff Data Required</AlertTitle>
          <AlertDescription>
            Predictions require historical cutoff data. You can upload a CSV file with cutoff records below. 
            Once uploaded, the predictor will be fully functional.
          </AlertDescription>
        </Alert>

        {/* Predictor Form */}
        <MhtCetPredictorFormPage />
      </div>
    </div>
  );
}
