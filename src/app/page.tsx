'use client';

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/main-layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Login } from '@/components/auth/login';

function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }
  
  return null;
}

export default function HomePage() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}
