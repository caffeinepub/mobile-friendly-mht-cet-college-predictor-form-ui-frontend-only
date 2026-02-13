import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, MessageCircle, AlertCircle } from 'lucide-react';

export default function ContactSupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Contact & Support
          </h2>
          <p className="text-lg text-muted-foreground">
            Need help? We're here to assist you with any questions or issues.
          </p>
        </div>

        {/* Support Guidelines */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Getting Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-base">
              When reaching out for support, please include the following information to help us assist you quickly:
            </CardDescription>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
              <li>A clear description of the issue you're experiencing</li>
              <li>The steps you took before encountering the problem</li>
              <li>Any error messages you received (if applicable)</li>
              <li>Your browser type and version</li>
              <li>Screenshots (if relevant)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base text-muted-foreground">
              For support inquiries, technical issues, or general questions about the MHT-CET College Predictor, 
              please contact our team.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Support Email:</strong> Contact information will be provided soon.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Alert className="border-primary/30 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Common Issues</AlertTitle>
          <AlertDescription className="space-y-2 text-sm">
            <p>
              <strong>Predictions not working?</strong> Make sure cutoff data has been uploaded via the CSV import section on the Predictor page.
            </p>
            <p>
              <strong>Connection errors?</strong> Try refreshing the page. If the issue persists, check your internet connection.
            </p>
            <p>
              <strong>Invalid input errors?</strong> Ensure your percentile is between 0-100 and that you've selected a category.
            </p>
          </AlertDescription>
        </Alert>

        {/* Additional Resources */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base text-muted-foreground">
              Visit the <strong>How it Works</strong> page to learn more about how predictions are calculated and what the results mean.
            </p>
            <p className="text-sm text-muted-foreground">
              This tool is developed by COEP students to help MHT-CET candidates make informed college admission decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
