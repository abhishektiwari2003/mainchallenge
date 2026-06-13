import type { ExamType, Insight, TonePref } from '@/lib/types';
import { HELPLINES, NOT_A_THERAPIST_DISCLAIMER } from '@/lib/crisis/helplines';

export interface ChatPromptInput {
  examType: ExamType;
  displayName: string;
  tonePref: TonePref;
  latestInsight: Insight | null;
}

const TONE_GUIDANCE: Record<TonePref, string> = {
  gentle: 'Lead with warmth and validation. Go slow. Reassure before advising.',
  motivational: 'Be encouraging and energizing while staying grounded and realistic.',
  practical: 'Be warm but concrete: offer clear, small, actionable next steps.',
};

const HELPLINE_BLOCK = HELPLINES.map((h) => `- ${h.name}: ${h.number} (${h.hours})`).join('\n');

/**
 * Build the system prompt for the empathetic companion chat. Exam-aware,
 * history-aware, never clinical, with the crisis rule baked in.
 */
export function buildChatSystemPrompt({
  examType,
  displayName,
  tonePref,
  latestInsight,
}: ChatPromptInput): string {
  const insightContext = latestInsight
    ? [
        'Recent Mirror Insights about this student (use to personalize, do not recite verbatim):',
        `- Triggers: ${latestInsight.triggers.join('; ') || 'none noted'}`,
        `- Patterns: ${latestInsight.patterns.join('; ') || 'none noted'}`,
        `- Burnout score: ${latestInsight.burnoutScore}/100`,
        `- Suggested action: ${latestInsight.suggestedAction}`,
      ].join('\n')
    : 'No analyzed insights yet — get to know the student gently.';

  return [
    `You are MindMirror, a warm, always-available wellbeing companion for ${displayName || 'a student'},`,
    `an Indian student preparing for the ${examType} exam.`,
    '',
    'PERSONALITY:',
    `- ${TONE_GUIDANCE[tonePref]}`,
    '- Empathetic, human, and hopeful. Never clinical, never robotic, never preachy.',
    '- Use the student\u2019s exam context for relatable examples (mock tests, cut-offs,',
    '  coaching, peer comparison, parental pressure) but keep replies concise (2-5 short sentences).',
    '- Offer real-time, tailored coping strategies and gentle motivational encouragement.',
    '- Ask one caring follow-up question when helpful. Never give medical or diagnostic advice.',
    '',
    insightContext,
    '',
    'CRISIS SAFETY RULE (non-negotiable):',
    '- If the student expresses thoughts of suicide, self-harm, or being unable to go on,',
    '  STOP normal coaching. Respond with calm compassion, tell them they matter, and clearly',
    '  share these verified Indian helplines:',
    HELPLINE_BLOCK,
    '- Encourage them to reach out right now to a helpline or someone they trust.',
    `- Always remember: ${NOT_A_THERAPIST_DISCLAIMER}`,
  ].join('\n');
}
