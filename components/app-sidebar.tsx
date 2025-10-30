'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { NoteIcon, PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SmartSidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarToggle } from './sidebar-toggle';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { CheckboxIcon } from '@/components/icons';
import { SidebarToggleButton } from './sidebar-toggle-button';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, state, isMobile, openMobile, toggleSidebar, isAnimating } = useSidebar();
  const isExpanded = isMobile ? openMobile : state !== 'collapsed';

  return (
    <Sidebar
      collapsible="icon" // ✅ This makes collapsed width = 3.5rem instead of 0
      className="
        group-data-[side=left]:border-r-0
        transition-[width] duration-200 motion-safe:ease-in-out
        bg-sidebar text-sidebar-foreground
      "
    >
      <SidebarHeader>
        <SidebarMenu>
          {!isMobile ? (
            <div className="h-header-height flex items-center justify-between w-full">
              <SidebarToggleButton 
                expanded={isExpanded} 
                onClick={toggleSidebar}
              />
            </div>
          ) : (
            <div className="flex w-full items-center justify-between">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
                className="flex flex-row gap-3 items-center"
              >
                <span className="text-2xl font-medium px-2 hover:bg-muted rounded-md cursor-pointer">
                  <CheckboxIcon />
                </span>
              </Link>
              <SidebarToggleButton 
                expanded={isExpanded} 
                onClick={toggleSidebar}
              />
            </div>
          )}
        </SidebarMenu>
      </SidebarHeader>

      {/* ===== NEW CHAT BUTTON ===== */}
      {!isMobile && (
        <div className="px-2 py-2 mt-2">
          <div className="flex flex-col items-start">
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className={
                      state === 'expanded'
                        ? 'h-10 w-full flex items-center justify-start gap-2 group relative rounded-xl'
                        : 'flex items-center justify-start gap-1.5'
                    }
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <NoteIcon />
                  {state === 'expanded' && (
                    <span className="text-sm font-medium">New Chat</span>
                  )}
                </Button>
              </TooltipTrigger>
              
            </Tooltip>
          </div>
        </div>
      )}

      {/* ===== HISTORY ===== */}
      <SidebarContent className="px-2 py-2">
        {/* Only mount history when expanded and not in the middle of the width animation.
            For mobile, rely on openMobile to show content. */}
        {(isMobile && openMobile) || (!isMobile && state === 'expanded' && !isAnimating) ? (
          <SidebarHistory user={user} />
        ) : null}
      </SidebarContent>

      {/* ===== FOOTER ===== */}
      <SidebarFooter className="">
        {user && <SmartSidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
