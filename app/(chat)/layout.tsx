import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const [session, cookieStore] = await Promise.all([auth(), cookies()]);
    const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

    // Treat missing session or a user explicitly typed as 'guest' as guest mode.
    const isGuest = !session || (session && session.user?.type === 'guest');

  return (
      <>
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
          strategy="beforeInteractive"
        />
        {/* Keep the SidebarProvider so child components that consume the sidebar
            context don't crash, but don't render the visual Sidebar for guests. */}
        <SidebarProvider defaultOpen={!isCollapsed && !isGuest}>
          {!isGuest && <AppSidebar user={session?.user} />}
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </>
    );
  } catch (error) {
    console.error('Layout error:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600">Please refresh the page</p>
        </div>
      </div>
    );
  }
}
