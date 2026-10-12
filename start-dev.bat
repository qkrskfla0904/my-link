@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================
echo   Starting MyLink Dev Server (Port 3000)
echo ========================================
npm run dev
pause
