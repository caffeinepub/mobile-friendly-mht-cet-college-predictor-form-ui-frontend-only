/**
 * Validates and normalizes WhatsApp phone numbers
 */

export interface WhatsAppValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

/**
 * Validates a WhatsApp number
 * Accepts 10-digit Indian mobile numbers
 */
export function validateWhatsApp(whatsapp: string): WhatsAppValidationResult {
  // Remove all non-digit characters
  const normalized = whatsapp.replace(/\D/g, '');

  // Check if empty
  if (!normalized) {
    return {
      isValid: false,
      error: 'WhatsApp number is required',
    };
  }

  // Check if it's a valid 10-digit number
  if (normalized.length !== 10) {
    return {
      isValid: false,
      error: 'WhatsApp number must be 10 digits',
    };
  }

  // Check if it starts with a valid Indian mobile prefix (6-9)
  if (!/^[6-9]/.test(normalized)) {
    return {
      isValid: false,
      error: 'WhatsApp number must start with 6, 7, 8, or 9',
    };
  }

  return {
    isValid: true,
    normalized,
  };
}
