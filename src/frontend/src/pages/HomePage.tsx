import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Shield, Lightbulb } from 'lucide-react';

interface HomePageProps {
  onNavigateToPredictor: () => void;
}

export default function HomePage({ onNavigateToPredictor }: HomePageProps) {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Banner Image */}
        <section className="w-full -mt-8 sm:-mt-12 md:-mt-16 mb-8">
          <div className="w-full max-w-5xl mx-auto">
            <img
              src="/assets/photo_2026-02-13_15-36-18-1.jpg"
              alt="Concept Delta banner"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Find Your Perfect Engineering College
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized college predictions based on your MHT-CET percentile, category, and preferences. 
            Make informed decisions about your engineering education journey.
          </p>
          <Button
            size="lg"
            onClick={onNavigateToPredictor}
            className="text-base px-8 py-6 h-auto"
          >
            Start Predicting
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        {/* Features Section */}
        <section className="grid sm:grid-cols-3 gap-6">
          <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Accurate Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get predictions based on historical cutoff data and your academic profile to find colleges that match your rank.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Transparent Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Understand how predictions work with clear explanations of rank calculations and eligibility criteria.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your data is secure and used only to provide you with personalized college predictions.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4 pt-8">
          <h3 className="text-2xl sm:text-3xl font-bold">Ready to Find Your College?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enter your MHT-CET percentile and preferences to discover which engineering colleges you're eligible for.
          </p>
          <Button
            size="lg"
            onClick={onNavigateToPredictor}
            variant="outline"
            className="text-base px-8 py-6 h-auto"
          >
            Go to Predictor
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </div>
    </div>
  );
}
