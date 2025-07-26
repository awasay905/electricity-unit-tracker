'use client';

import { Bolt, LogOut } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';

export function AppHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Bolt className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary">Unitrack</h1>
        </div>
        <div className="flex items-center gap-4">
            {user && (
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            )}
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
