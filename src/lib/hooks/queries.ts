'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRepo } from '@/lib/data/repo';
import { seedDemoData } from '@/lib/data/seed';
import { requestInsight } from '@/lib/api';
import type { MoodScore, Profile } from '@/lib/types';

const keys = {
  profile: ['profile'] as const,
  entries: ['entries'] as const,
  insights: ['insights'] as const,
  messages: ['messages'] as const,
};

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: () => getRepo().getProfile() });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Profile, 'id' | 'consentAt'> & { consent: boolean }) =>
      getRepo().saveProfile(input),
    onSuccess: (profile) => qc.setQueryData(keys.profile, profile),
  });
}

export function useEntries() {
  return useQuery({ queryKey: keys.entries, queryFn: () => getRepo().listEntries() });
}

export function useAddEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; moodScore: MoodScore }) => getRepo().addEntry(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.entries }),
  });
}

export function useInsights() {
  return useQuery({ queryKey: keys.insights, queryFn: () => getRepo().listInsights() });
}

/** Run AI analysis on all entries and persist the resulting insight. */
export function useGenerateInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const repo = getRepo();
      const [profile, entries] = await Promise.all([repo.getProfile(), repo.listEntries()]);
      if (!profile) throw new Error('Complete onboarding first.');
      if (entries.length === 0) throw new Error('Write a journal entry first.');
      const insight = await requestInsight(profile.examType, entries);
      return repo.saveInsight(insight);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.insights }),
  });
}

export function useMessages() {
  return useQuery({ queryKey: keys.messages, queryFn: () => getRepo().listMessages() });
}

export function useSeedDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => seedDemoData(getRepo()),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.entries }),
  });
}

export function useDeleteAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => getRepo().deleteAll(),
    onSuccess: () => qc.clear(),
  });
}

export { keys as queryKeys };
