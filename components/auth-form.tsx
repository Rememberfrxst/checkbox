// components/auth-form.tsx
'use client';

import Form from 'next/form';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  isRegister = false,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  isRegister?: boolean;
}) {

  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">

      {/* Username (Only for Register) */}
      {isRegister && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="username"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Username
          </Label>
          <Input
            id="username"
            name="username"
            className="bg-muted text-md md:text-sm"
            type="text"
            placeholder="johndoe123"
            required
            autoComplete="username"
          />
        </div>
      )}

      {/* Email Address */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          
        </Label>
        <Input
          id="email"
          name="email"
          className="w-full outline-none text-md md:text-sm rounded-full"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          autoFocus={!isRegister}
          defaultValue={defaultEmail}
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
        </Label>
        <Input
          id="password"
          name="password"
          className="text-md outline-none md:text-sm"
          type="password"
          placeholder={isRegister ? "Create a strong password" : "Enter your password"}
          required
          minLength={6}
          autoComplete={isRegister ? "new-password" : "current-password"}
        />
      </div>

      {children}
    </Form>
  );
}
