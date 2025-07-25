import { MainLayout } from '@/components/main-layout';
import { Suspense } from 'react';
import { AppHeader } from '@/components/header';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
        <Suspense fallback={<div className="text-center">Loading VoltVision...</div>}>
          <MainLayout />
        </Suspense>
      </main>
    </div>
  );
}
