'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookHeart, LayoutDashboard, MessageCircleHeart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MoodOrb } from '@/components/mood-orb';
import { Button } from '@/components/ui/button';
import { useDeleteAll, useProfile } from '@/lib/hooks/queries';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookHeart },
  { href: '/chat', label: 'Companion', icon: MessageCircleHeart },
] as const;

/**
 * Shared chrome for authenticated pages: header nav, onboarding guard, and a
 * privacy "delete all data" control.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const deleteAll = useDeleteAll();

  React.useEffect(() => {
    if (!isLoading && !profile) router.replace('/onboarding');
  }, [isLoading, profile, router]);

  async function handleDeleteAll() {
    const confirmed = window.confirm(
      'This permanently deletes all your journal entries, insights, and chats. Continue?',
    );
    if (!confirmed) return;
    await deleteAll.mutateAsync();
    router.replace('/onboarding');
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-md">
            <MoodOrb size={32} mood={4} />
            <span className="text-lg font-semibold tracking-tight">MindMirror</span>
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main id="main" className="container py-8">
        {children}
      </main>

      <footer className="border-t border-border py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            MindMirror is a supportive companion, not a therapist. In a crisis, call Tele-MANAS{' '}
            <a href="tel:14416" className="font-medium text-foreground underline">
              14416
            </a>
            .
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAll}
            disabled={deleteAll.isPending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete all my data
          </Button>
        </div>
      </footer>
    </div>
  );
}
