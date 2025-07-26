'use client';

import { AppHeader } from '@/components/header';
import { MainLayout } from '@/components/main-layout';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center">Loading...</div>;
  }
  
  return (
     <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
            <MainLayout />
        </main>
    </div>
  )
}


export default function DashboardPage() {
    return (
        <AuthProvider>
            <Dashboard />
        </AuthProvider>
    )
}
