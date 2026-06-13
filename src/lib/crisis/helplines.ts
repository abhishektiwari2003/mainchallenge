/**
 * Verified Indian mental-health helplines. These are surfaced whenever acute
 * distress is detected. Numbers are kept here as the single source of truth so
 * they can be audited and updated in one place.
 */
export interface Helpline {
  name: string;
  /** Display number. */
  number: string;
  /** Tel: href digits (no spaces). */
  dial: string;
  description: string;
  hours: string;
}

export const HELPLINES: readonly Helpline[] = [
  {
    name: 'Tele-MANAS (Govt. of India)',
    number: '14416 / 1-800-891-4416',
    dial: '14416',
    description: "India's national 24x7 mental health support program.",
    hours: '24x7, multilingual',
  },
  {
    name: 'iCall (TISS)',
    number: '9152987821',
    dial: '9152987821',
    description: 'Free, confidential counselling by trained professionals.',
    hours: 'Mon-Sat, 8am-10pm',
  },
  {
    name: 'AASRA',
    number: '9820466726',
    dial: '9820466726',
    description: 'Crisis intervention and suicide prevention support.',
    hours: '24x7',
  },
] as const;

/** Plain-language, non-clinical disclaimer shown across the app. */
export const NOT_A_THERAPIST_DISCLAIMER =
  'MindMirror is a supportive companion, not a therapist or medical service. ' +
  'It cannot provide diagnosis or treatment. If you are in distress or thinking ' +
  'about harming yourself, please reach out to a verified helpline or someone you trust.';
