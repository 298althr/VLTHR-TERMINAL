# VLTHR Docker Sync Script
# Run this after any frontend code change: .\sync.ps1

Write-Host "Syncing frontend files to Docker..." -ForegroundColor Cyan

$files = @(
    "features/home/HomeScreen.tsx",
    "features/desktop/DesktopGrid.tsx",
    "features/desktop/Dock.tsx",
    "features/desktop/AppContentRouter.tsx",
    "features/desktop/Desktop.tsx",
    "features/desktop/WindowManager.tsx",
    "features/desktop/AppWindow.tsx",
    "features/desktop/MenuBar.tsx",
    "features/desktop/ControlCentre.tsx",
    "features/apps/CryptoPage.tsx",
    "features/apps/ForexPage.tsx",
    "features/apps/EquitiesPage.tsx",
    "features/apps/NewsPage.tsx",
    "features/apps/MacroPage.tsx",
    "features/apps/SignalsPage.tsx",
    "features/apps/PortfolioPage.tsx",
    "features/apps/SettingsPage.tsx",
    "features/apps/CalendarPage.tsx",
    "features/apps/OptionsPage.tsx",
    "features/apps/WatchlistPage.tsx",
    "features/apps/ScreenerPage.tsx",
    "features/apps/RiskLabPage.tsx",
    "features/apps/ConciergePage.tsx",
    "features/apps/ReportsPage.tsx",
    "features/lockscreen/SlideToUnlock.tsx",
    "features/lockscreen/PinPad.tsx",
    "features/lockscreen/LockScreen.tsx",
    "store/useAppStore.ts",
    "lib/api.ts",
    "lib/adapters/catalog.ts",
    "features/dynamic-island/Island.tsx",
    "public/assets/dynamic-island-bg.png",
    "features/desktop/DockCards.tsx",
    "components/MuiGlassProvider.tsx",
    "components/AppleToggle.tsx",
    "components/LoadingOverlay.tsx",
    "app/layout.tsx",
    "app/globals.css",
    "public/favicon.svg",
    "public/logo.svg",
    "public/icons",
    "package.json",
    "package-lock.json"
)

$backendFiles = @(
    "server.js",
    "services/auth.js",
    "services/equities.js"
)

foreach ($file in $files) {
    $src = "VLTHR/$file"
    $dst = "vlthr-frontend:/app/$file"
    if (Test-Path $src) {
        docker cp $src $dst | Out-Null
        Write-Host "  copied frontend $file" -ForegroundColor Green
    }
}

foreach ($file in $backendFiles) {
    $src = "Backend/$file"
    $dst = "vlthr-backend:/app/$file"
    if (Test-Path $src) {
        docker cp $src $dst | Out-Null
        Write-Host "  copied backend $file" -ForegroundColor Green
    }
}

Write-Host "Restarting containers..." -ForegroundColor Cyan
docker restart vlthr-frontend | Out-Null
docker restart vlthr-backend | Out-Null
Start-Sleep -Seconds 8
Write-Host "Done. Services are live." -ForegroundColor Yellow
