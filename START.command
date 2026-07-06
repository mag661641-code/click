#!/bin/bash
# Click launcher for macOS / Linux

cd "$(dirname "$0")"

echo ""
echo "  ==============================================="
echo "    Click - Yandex.Business poster"
echo "  ==============================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed."
  echo ""
  echo "  Please install Node.js from:"
  echo "  https://nodejs.org/"
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi

echo "[OK] Node.js detected: $(node --version)"
echo ""

# Install npm dependencies if missing
if [ ! -d "node_modules/puppeteer" ]; then
  echo "[INFO] First run - installing dependencies..."
  echo "       This will take 1-2 minutes. Please wait."
  echo ""
  npm install
  if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to install dependencies."
    read -p "Press Enter to exit..."
    exit 1
  fi
  echo ""
  echo "[OK] Dependencies installed."
  echo ""
fi

# Install Chrome browser for Puppeteer if missing
CHROME_CACHE="$HOME/.cache/puppeteer/chrome"
if [ ! -d "$CHROME_CACHE" ] || [ -z "$(ls -A "$CHROME_CACHE" 2>/dev/null)" ]; then
  echo "[INFO] Installing Chrome browser for Puppeteer..."
  echo "       This will take 1-3 minutes (downloading ~170 MB)."
  echo ""
  npx puppeteer browsers install chrome
  if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to install Chrome."
    read -p "Press Enter to exit..."
    exit 1
  fi
  echo ""
  echo "[OK] Chrome installed."
  echo ""
fi

echo "[INFO] Starting Click on http://localhost:3847"
echo "[INFO] To stop - close this window or press Ctrl+C."
echo ""
echo "--------------------------------------------------"
echo ""

node app.js

echo ""
echo "--------------------------------------------------"
echo "[INFO] Click has stopped."
read -p "Press Enter to exit..."
