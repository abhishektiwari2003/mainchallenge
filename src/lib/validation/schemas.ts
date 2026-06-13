import { z } from 'zod';
import { EXAM_TYPES, TONE_PREFS } from '@/lib/types';

/** Onboarding / profile input. */
export const profileSchema = z.object({
  examType: z.enum(EXAM_TYPES),
  displayName: z.string().trim().min(1, 'Please enter a name').max(60),
  tonePref: z.enum(TONE_PREFS),
  consent: z.literal(true, { message: 'Consent is required to continue' }),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** A single journal entry submission. */
export const journalEntrySchema = z.object({
  body: z.string().trim().min(1, 'Write a little before saving').max(5000),
  moodScore: z.number().int().min(1).max(5),
});
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;

const entryPayloadSchema = z.object({
  body: z.string().min(1).max(5000),
  moodScore: z.number().int().min(1).max(5),
  createdAt: z.string().min(1),
});

/** Body for POST /api/insights. The user's own entries are sent for analysis. */
export const insightRequestSchema = z.object({
  examType: z.enum(EXAM_TYPES),
  entries: z.array(entryPayloadSchema).min(1, 'Add an entry first').max(120),
});
export type InsightRequestInput = z.infer<typeof insightRequestSchema>;

const insightSummarySchema = z.object({
  triggers: z.array(z.string()).max(8),
  patterns: z.array(z.string()).max(8),
  burnoutScore: z.number().min(0).max(100),
  suggestedAction: z.string().max(600),
  distressLevel: z.enum(['none', 'mild', 'moderate', 'acute']),
});

const chatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});

/** Body for POST /api/chat. Context is sent so the route can stay stateless. */
export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
  examType: z.enum(EXAM_TYPES),
  displayName: z.string().max(60).default(''),
  tonePref: z.enum(TONE_PREFS),
  history: z.array(chatHistoryItemSchema).max(40).default([]),
  latestInsight: insightSummarySchema.nullable().default(null),
});
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
