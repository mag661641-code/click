@echo off
rem ============================================================
rem  Click launcher for Windows
rem  Uses only ASCII in control flow to avoid encoding issues.
rem ============================================================

title Click

chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo.
echo   ===============================================
echo     Click - Yandex.Business poster
echo   ===============================================
echo.

rem ---------- Check Node.js ----------
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo.
    echo   Please install Node.js from:
    echo   https://nodejs.org/
    echo.
    echo   After install, RESTART your computer and try again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node --version
echo.

rem ---------- Install npm dependencies if missing ----------
if not exist "node_modules\puppeteer\package.json" (
    echo [INFO] First run - installing dependencies...
    echo        This will take 1-2 minutes. Please wait.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies.
        echo        Check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed.
    echo.
)

rem ---------- Install Chrome browser for Puppeteer if missing ----------
rem Puppeteer needs a Chrome binary. It's stored in %USERPROFILE%\.cache\puppeteer
rem We detect it by checking if folder exists and contains files.
set "CHROME_CACHE=%USERPROFILE%\.cache\puppeteer\chrome"
if not exist "%CHROME_CACHE%" goto install_chrome
dir /b "%CHROME_CACHE%" 2>nul | findstr "." >nul
if errorlevel 1 goto install_chrome
goto chrome_ok

:install_chrome
echo [INFO] Installing Chrome browser for Puppeteer...
echo        This will take 1-3 minutes (downloading ~170 MB).
echo        Please wait, do NOT close this window.
echo.
call npx puppeteer browsers install chrome
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install Chrome.
    echo        Possible reasons:
    echo          - No internet connection
    echo          - Corporate firewall blocking download
    echo          - Antivirus blocking
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Chrome installed.
echo.

:chrome_ok

rem ---------- Start the app ----------
echo [INFO] Starting Click on http://localhost:3847
echo [INFO] To stop - close this window or press Ctrl+C.
echo.
echo --------------------------------------------------
echo.

rem Browser will be opened by app.js automatically when the server is ready.

node app.js

echo.
echo --------------------------------------------------
echo [INFO] Click has stopped.
pause
