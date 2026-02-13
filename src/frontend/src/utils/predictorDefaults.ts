/**
 * Internal default values for backend calls during Step 4.
 * These defaults are used for rank calculation when not collected from user.
 * Gender and branch are now optional and only sent when provided by the user.
 */

import { Candidature } from '@/backend';

export const predictorDefaults = {
  // Default candidature for rank calculation (Maharashtra)
  candidature: Candidature.maharashtra,
} as const;
