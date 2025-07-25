'use client';

import { Bolt } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Bolt className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary">VoltVision</h1>
        </div>
        <div className="flex items-center gap-4">
            {/* In a real app, user info and a logout button would go here */}
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
