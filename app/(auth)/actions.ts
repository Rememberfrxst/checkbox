'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  const email = formData.get('email');
  const password = formData.get('password');

  // Quick validation before schema parsing
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return { status: 'invalid_data' };
  }

  try {
    const validatedData = authFormSchema.parse({ email, password });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  const email = formData.get('email');
  const password = formData.get('password');

  // Quick validation before schema parsing
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return { status: 'invalid_data' };
  }

  try {
    const validatedData = authFormSchema.parse({ email, password });

    // Check user existence and create user in parallel
    const [user] = await getUser(validatedData.email);
    if (user) {
      return { status: 'user_exists' };
    }

    // Create user and sign in concurrently
    await Promise.all([
      createUser(validatedData.email, validatedData.password),
      signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      })
    ]);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};
