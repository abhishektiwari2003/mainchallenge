import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  HeartPulse,
  LineChart,
  MessageCircleHeart,
  ShieldCheck,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoodOrb } from '@/components/mood-orb';

const FEATURES = [
  {
    icon: Brain,
    title: 'Mirror Insights',
    body: 'AI reads between the lines of your journal to reveal hidden triggers a 1-5 tracker would miss.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Adaptive companion',
    body: 'An empathetic, exam-aware chat that offers real-time, personalized coping strategies.',
  },
  {
    icon: LineChart,
    title: 'Burnout Radar',
    body: 'A calm trend dashboard that flags burnout risk early — before it becomes a crisis.',
  },
  {
    icon: HeartPulse,
    title: 'Micro-mindfulness',
    body: 'Breathing and grounding exercises that adapt to your detected distress level.',
  },
] as const;

export default function LandingPage() {
  return (
    <main id="main" className="container flex flex-col items-center py-16 text-center">
      <MoodOrb size={120} mood={4} label="MindMirror companion orb" />
      <h1 className="mt-8 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        Understand the stress behind the studying.
      </h1>
      <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
        MindMirror is a reflective wellbeing companion for students preparing for NEET, JEE, CUET,
        CAT, GATE and UPSC. Journal freely — the AI surfaces the patterns you can&rsquo;t see
        yourself.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/onboarding" className={buttonVariants({ size: 'lg' })}>
          Get started
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <Link href="/dashboard" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          Open the app
        </Link>
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />
        Private by design. Crisis-aware. Not a substitute for professional care.
      </p>

      <section aria-label="Features" className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="text-left">
              <CardContent className="space-y-2 p-6">
                <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="text-sm text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
