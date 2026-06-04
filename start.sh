#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 OpsPulse başlatılıyor..."

# Docker (veritabanı)
echo "📦 Veritabanı başlatılıyor..."
docker compose up -d db
sleep 2

# ADB reverse (Android geliştirme)
ADB="$HOME/Library/Android/sdk/platform-tools/adb"
if [ -f "$ADB" ]; then
  echo "📱 ADB reverse kuruluyor..."
  "$ADB" reverse tcp:3000 tcp:3000 2>/dev/null || true
fi

# AI servisi
echo "🤖 AI servisi başlatılıyor..."
cd "$ROOT/ai-service"
uvicorn main:app --port 8000 > /tmp/opspulse-ai.log 2>&1 &
AI_PID=$!

# Backend
echo "⚙️  Backend başlatılıyor..."
cd "$ROOT/backend"
npm run dev > /tmp/opspulse-backend.log 2>&1 &
BACKEND_PID=$!

# Web
echo "🌐 Web arayüzü başlatılıyor..."
cd "$ROOT/web"
npm run dev > /tmp/opspulse-web.log 2>&1 &
WEB_PID=$!

echo ""
echo "✅ Tüm servisler başlatıldı!"
echo "   Web:     http://localhost:5173"
echo "   Backend: http://localhost:3000"
echo "   AI:      http://localhost:8000"
echo ""
echo "Durdurmak için Ctrl+C"

# Ctrl+C ile hepsini kapat
cleanup() {
  echo ""
  echo "🛑 Servisler durduruluyor..."
  kill $AI_PID $BACKEND_PID $WEB_PID 2>/dev/null
  exit 0
}
trap cleanup INT

# ADB reverse her 15 saniyede yenile
while true; do
  if [ -f "$ADB" ]; then
    "$ADB" reverse tcp:3000 tcp:3000 2>/dev/null || true
  fi
  sleep 15
done
