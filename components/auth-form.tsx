// components/auth-form.tsx
'use client';

import Form from 'next/form';
import { useState } from 'react';
import { AvatarSelector } from './avatar-selector';

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
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {/* Avatar Selection (Only for Register) */}
      {isRegister && (
        <div className="flex flex-col gap-2">
          <Label className="text-zinc-600 font-normal dark:text-zinc-400">
            Choose Avatar
          </Label>
          <AvatarSelector 
            selectedAvatar={selectedAvatar}
            onAvatarSelect={setSelectedAvatar}
          />
          <input type="hidden" name="avatar" value={selectedAvatar} />
        </div>
      )}

      {/* First Name & Last Name (Only for Register) */}
      {isRegister && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="firstName"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              className="bg-muted text-md md:text-sm"
              type="text"
              placeholder="John"
              required
              autoComplete="given-name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="lastName"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              className="bg-muted text-md md:text-sm"
              type="text"
              placeholder="Doe"
              required
              autoComplete="family-name"
            />
          </div>
        </div>
      )}

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
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@gmail.com"
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
          Password
        </Label>
        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
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
