import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle } from 'lucide-react';
import { validateWhatsApp } from '@/utils/validation/whatsapp';

interface LeadCaptureFormProps {
  isOpen: boolean;
  onSubmit: (data: { name: string; mobile: string; whatsapp: string; telegram: boolean; email?: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function LeadCaptureForm({ isOpen, onSubmit, isSubmitting }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
    } else {
      const whatsappValidation = validateWhatsApp(whatsapp);
      if (!whatsappValidation.isValid) {
        newErrors.whatsapp = whatsappValidation.error || 'Invalid WhatsApp number';
      }
    }

    // Validate Telegram confirmation is checked (required)
    if (!telegram) {
      newErrors.telegram = 'Please confirm you will join our Telegram channel to proceed';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        mobile: mobile.trim(),
        whatsapp: whatsapp.trim(),
        telegram,
        email: email.trim() || undefined,
      });
      
      // Reset form on success
      setName('');
      setMobile('');
      setWhatsapp('');
      setTelegram(false);
      setEmail('');
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit. Please try again.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[500px]" 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Get Your Predictions</DialogTitle>
          <DialogDescription className="text-base">
            Please provide your contact details to view your college predictions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="lead-name" className="text-base font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className={`h-11 text-base ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="lead-mobile" className="text-base font-medium">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-mobile"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              disabled={isSubmitting}
              className={`h-11 text-base ${errors.mobile ? 'border-destructive' : ''}`}
            />
            {errors.mobile && (
              <p className="text-sm text-destructive">{errors.mobile}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="lead-whatsapp" className="text-base font-medium">
              WhatsApp Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-whatsapp"
              type="tel"
              placeholder="Enter WhatsApp number"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
              disabled={isSubmitting}
              className={`h-11 text-base ${errors.whatsapp ? 'border-destructive' : ''}`}
            />
            {errors.whatsapp && (
              <p className="text-sm text-destructive">{errors.whatsapp}</p>
            )}
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="lead-email" className="text-base font-medium">
              Email <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>

          {/* Telegram Join Confirmation (Required) */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3 py-2">
              <Checkbox
                id="lead-telegram"
                checked={telegram}
                onCheckedChange={(checked) => setTelegram(checked === true)}
                disabled={isSubmitting}
                className={`mt-1 ${errors.telegram ? 'border-destructive' : ''}`}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="lead-telegram"
                  className="text-base font-medium cursor-pointer"
                >
                  Join our Telegram channel for updates <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications about counseling and admissions
                </p>
              </div>
            </div>
            {errors.telegram && (
              <p className="text-sm text-destructive">{errors.telegram}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'View Predictions'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
