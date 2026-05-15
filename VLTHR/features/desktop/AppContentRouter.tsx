'use client';

import { CryptoPage } from '@/features/apps/CryptoPage';
import { ForexPage } from '@/features/apps/ForexPage';
import { NewsPage } from '@/features/apps/NewsPage';
import { MacroPage } from '@/features/apps/MacroPage';
import { EquitiesPage } from '@/features/apps/EquitiesPage';
import { SignalsPage } from '@/features/apps/SignalsPage';
import { PortfolioPage } from '@/features/apps/PortfolioPage';
import { SettingsPage } from '@/features/apps/SettingsPage';
import { CalendarPage } from '@/features/apps/CalendarPage';
import { OptionsPage } from '@/features/apps/OptionsPage';
import { WatchlistPage } from '@/features/apps/WatchlistPage';
import { ScreenerPage } from '@/features/apps/ScreenerPage';
import { RiskLabPage } from '@/features/apps/RiskLabPage';
import { ConciergePage } from '@/features/apps/ConciergePage';
import { ReportsPage } from '@/features/apps/ReportsPage';

export function AppContentRouter({ appId }: { appId: string }) {
  switch(appId) {
    case 'crypto':    return <CryptoPage />;
    case 'forex':     return <ForexPage />;
    case 'equities':  return <EquitiesPage />;
    case 'news':      return <NewsPage />;
    case 'macro':     return <MacroPage />;
    case 'signals':   return <SignalsPage />;
    case 'portfolio': return <PortfolioPage />;
    case 'settings':  return <SettingsPage />;
    case 'calendar':  return <CalendarPage />;
    case 'options':   return <OptionsPage />;
    case 'watchlist': return <WatchlistPage />;
    case 'screener':  return <ScreenerPage />;
    case 'risklab':   return <RiskLabPage />;
    case 'concierge': return <ConciergePage />;
    case 'reports':   return <ReportsPage />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-white/40 italic text-sm p-10 text-center">
          <p>Application "{appId}" is currently in development.</p>
          <p className="mt-2 text-xs opacity-60">This module will be published in a future system update.</p>
        </div>
      );
  }
}
