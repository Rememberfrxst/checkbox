'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import BlurredBackground from '@/components/BlurredBackground';

import { register, type RegisterActionState } from '../actions';
import { toast } from '@/components/toast';
import { useSession } from 'next-auth/react';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [state, formAction] = useActionState<RegisterActionState, FormData>(register, { status: 'idle' });
  const { update: updateSession } = useSession();

  // Prefetch the main page for faster navigation after registration
  useEffect(() => {
    router.prefetch('/');
  }, []);

  useEffect(() => {
    if (state.status === 'success') {
      toast({ type: 'success', description: 'Account created successfully!' });
      setIsSuccessful(true);
      updateSession();
      router.push('/'); // Directly push to main page
      return;
    }
    
    const errors = {
      user_exists: 'Account already exists!',
      failed: 'Failed to create account!',
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
      <div style={{ width: '100%', position: 'relative', zIndex: 10 }} className="flex flex-col w-screen items-center justify-center bg-frost_token">
        <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-[32px] font-semibold dark:text-zinc-50">Sign Up Checkbox</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              You’ll get smarter responses and can upload files, images, and more.
            </p>
          </div>
          <AuthForm action={handleSubmit} defaultEmail={email}>
            <SubmitButton isSuccessful={isSuccessful}>Sign Up</SubmitButton>
            <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
              {'Already have an account? '}
              <Link
                href="/login"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Login
              </Link>
            </p>
          </AuthForm>
        </div>
      </div>
      <div className='hidden md:block' style={{ width: '100%', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <BlurredBackground />
      </div>
    </div>
  );
}
