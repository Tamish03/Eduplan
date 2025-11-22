@echo off
echo Restarting backend server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *server.js*" 2>nul
timeout /t 2 /nobreak >nul
cd backend
start "Backend Server" node server.js
echo Backend server restarted!
