'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';
import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { login, type LoginActionState } from '../actions';
import { useSession } from 'next-auth/react';
import BlurredBackground from '@/components/BlurredBackground';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [state, formAction] = useActionState<LoginActionState, FormData>(login, { status: 'idle' });
  const { update: updateSession } = useSession();

  // Prefetch the main page for faster navigation after login
  useEffect(() => {
    router.prefetch('/');
  }, []);

  useEffect(() => {
    if (state.status === 'success') {
      setIsSuccessful(true);
      updateSession();
      router.push('/'); // Directly push to main page instead of refresh
      return;
    }
    
    const errors = {
      failed: 'Invalid credentials!',
      invalid_data: 'Failed validating your submission!'
    };
    
    if (errors[state.status as keyof typeof errors]) {
      toast({ type: 'error', description: errors[state.status as keyof typeof errors] });
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '100%', position: 'relative', zIndex: 10 }} className="flex flex-col w-screen items-center justify-center bg-frost_token md:w-1/2">
        <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-[32px] font-semibold text-foreground">
            Login Checkbox
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            You’ll get smarter responses and can upload files, images, and more.
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Continue</SubmitButton>
          <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
          </p>
        </AuthForm>
        </div>
      </div>
      <div className="hidden md:block" style={{ width: '100%', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <BlurredBackground />
      </div>
    </div>
  );
}
