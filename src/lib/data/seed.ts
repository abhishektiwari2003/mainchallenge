import type { MoodScore } from '@/lib/types';
import type { Repo } from '@/lib/data/repo';

interface SeedEntry {
  daysAgo: number;
  hour: number;
  moodScore: MoodScore;
  body: string;
}

/**
 * 8 days of realistic entries for a NEET/JEE-style aspirant. The data hides a
 * pattern the Pattern Engine reveals live: mood and calm collapse the *night
 * before* mock tests, then recover on the day of / after the test.
 */
const SEED_ENTRIES: SeedEntry[] = [
  {
    daysAgo: 8,
    hour: 21,
    moodScore: 4,
    body: 'Good study day. Finished organic chemistry revision and felt on top of it. Went for a short walk with friends in the evening, which helped me reset. Feeling capable today.',
  },
  {
    daysAgo: 7,
    hour: 22,
    moodScore: 2,
    body: 'There is a full mock test tomorrow morning. I could not sleep, kept lying awake worrying that I will blank out and waste another attempt. My chest felt tight and I kept checking the time. Everyone in my batch seems more prepared than me.',
  },
  {
    daysAgo: 7,
    hour: 14,
    moodScore: 4,
    body: 'Actually the mock test was fine once I started. Scored better than last time in physics. Funny how the test itself was calmer than the night before it.',
  },
  {
    daysAgo: 5,
    hour: 20,
    moodScore: 3,
    body: 'Normal day. Did some maths practice. A bit tired but okay. Mum asked about my rank prediction and I changed the topic.',
  },
  {
    daysAgo: 4,
    hour: 23,
    moodScore: 2,
    body: 'Another mock scheduled for tomorrow. Same feeling again, stomach in knots, scared I will disappoint everyone. I keep imagining the worst score. I feel so much pressure and I am exhausted.',
  },
  {
    daysAgo: 4,
    hour: 15,
    moodScore: 3,
    body: 'Got through the mock. Not my best but not a disaster. The anxiety always seems to peak the night before, not during.',
  },
  {
    daysAgo: 2,
    hour: 19,
    moodScore: 4,
    body: 'Relaxed study session, revised biology diagrams. Felt focused and even enjoyed it. Slept well last night.',
  },
  {
    daysAgo: 1,
    hour: 22,
    moodScore: 2,
    body: 'Big mock test tomorrow that the whole coaching ranks publicly. I am overwhelmed and worried, cannot focus, just doom-scrolling. Why does the night before always feel like this.',
  },
];

function isoDaysAgo(daysAgo: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

/**
 * Seed the demo journal so the Pattern Engine has something real to analyze.
 * Idempotent-ish: only seeds when there are no existing entries.
 */
export async function seedDemoData(repo: Repo): Promise<number> {
  const existing = await repo.listEntries();
  if (existing.length > 0) return 0;

  for (const entry of SEED_ENTRIES) {
    await repo.addEntry({
      body: entry.body,
      moodScore: entry.moodScore,
      createdAt: isoDaysAgo(entry.daysAgo, entry.hour),
    });
  }
  return SEED_ENTRIES.length;
}
