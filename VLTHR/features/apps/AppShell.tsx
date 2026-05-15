'use client';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col h-full w-full relative z-10 animate-in fade-in zoom-in duration-300">
      {/* Content Area - Designed to fit inside AppWindow */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-10">
        {children}
      </div>
    </div>
  );
}
