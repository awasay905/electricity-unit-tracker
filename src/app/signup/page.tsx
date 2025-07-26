'use client';

import { Signup } from '@/components/auth/signup';
import { AuthProvider } from '@/hooks/use-auth';

export default function SignupPage() {
    return (
        <AuthProvider>
            <Signup />
        </AuthProvider>
    )
}
