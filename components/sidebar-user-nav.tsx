'use client';

import {
  ChevronRight,
  Settings,
  Moon,
  Sun,
  User,
  LogOut,
  LogIn,
  Palette,
  Bell,
  HelpCircle,
  Shield,
  Download,
  // Trash2 is imported but not used, so it's removed.
} from 'lucide-react';
import Image from 'next/image';
import type { User as NextAuthUser } from 'next-auth';
import { signOut } from 'next-auth/react'; // Removed useSession as 'user' is passed via props
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react'; // Added useCallback for memoization

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
// import { toast } from './toast'; // Removed toast as it's not used in the provided code
import { LoaderIcon } from './icons'; // Assuming LoaderIcon has an animate-spin class or similar
import { guestRegex } from '@/lib/constants';
import { useSidebar } from '@/components/ui/sidebar';

// --- Helper Component for User Info Display ---
// This component centralizes the logic for displaying user avatar, name, and email,
// reducing redundancy and making the main component cleaner.
function UserInfoDisplay({ user, className }: { user: NextAuthUser; className?: string }) {
  const getAvatarUrl = useCallback((email: string) => {
    // Using a reliable avatar service. 'user' as fallback for seed.
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email || 'user')}`;
  }, []); // Memoize getAvatarUrl as it doesn't depend on props

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex aspect-square size-8 rounded-full items-center justify-center text-sidebar-primary-foreground">
        <Image
          src={getAvatarUrl(user.email || 'user')}
          alt={user.name || 'User Avatar'} // Improved alt text
          width={30}
          height={30}
          className="rounded-full"
          unoptimized // Good for external images
        />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate font-semibold">
          {user.name || 'User'}
        </span>
        <span className="truncate text-xs text-muted-foreground"> {/* Added text-muted-foreground for softer secondary text */}
          {user.email}
        </span>
      </div>
    </div>
  );
}

// --- Main SmartSidebarUserNav Component ---
export function SmartSidebarUserNav({ user }: { user: NextAuthUser }) {
  const { setTheme } = useTheme(); // 'theme' is not directly used, so removed from destructuring
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isGuest = user.email && guestRegex.test(user.email);
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  // Memoized callback for signing out
  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      // Close the sidebar after signing out
      if (isMobile) {
        setOpenMobile(false);
      } else {
        setOpen(false);
      }
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      // Optionally, integrate a toast notification here if 'toast' was kept
      // toast({ title: 'Sign out failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSigningOut(false);
    }
  }, [isMobile, setOpen, setOpenMobile, router]); // Dependencies for useCallback

  // Memoized callback for navigation
  const navigateTo = useCallback((path: string) => {
    router.push(path);
    // Close sidebar on navigation, especially useful for mobile
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false); // Also close for desktop for consistent behavior
    }
  }, [isMobile, setOpen, setOpenMobile, router]); // Dependencies for useCallback

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-2 px-3" // Adjusted px for better visual padding
            >
              <UserInfoDisplay user={user} />
              <ChevronRight className="ml-auto size-4 text-muted-foreground" /> {/* Softer color for the icon */}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 border border-token-border-default rounded-2xl p-1" // Added p-1 for internal padding
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-2 font-normal"> {/* Adjusted padding for the label */}
              <UserInfoDisplay user={user} className="px-1" /> {/* Consistent padding */}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" /> {/* Added vertical margin for better separation */}

            {/* Profile & Settings */}
            <DropdownMenuItem onClick={() => navigateTo('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigateTo('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            {/* Theme Selector */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="border border-token-border-default rounded-xl p-1"> {/* Consistent styling for sub-menu */}
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Settings className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="my-1" />

            {/* Help & Notifications */}
            <DropdownMenuItem onClick={() => navigateTo('/help')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigateTo('/notifications')}>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>

            {!isGuest && (
              <>
                <DropdownMenuSeparator className="my-1" />
                {/* Privacy & Data Export */}
                <DropdownMenuItem onClick={() => navigateTo('/privacy')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigateTo('/export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="my-1" />

            {/* Authentication Actions */}
            {isGuest ? (
              <>
                <DropdownMenuItem
                  onClick={() => navigateTo('/login')}
                  className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-950"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigateTo('/register')}
                  className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950"
                >
                  <User className="mr-2 h-4 w-4" /> {/* Using User icon for Sign Up */}
                  Sign Up
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                {isSigningOut ? (
                  <LoaderIcon />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Export the component with the expected name for backward compatibility
export { SmartSidebarUserNav as SidebarUserNav };
