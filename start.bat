@echo off
echo ========================================================
echo   Starting Aura Atelier Luxury Jewellery Platform...
echo ========================================================
echo.

:: Launch FastAPI Backend in a new window
start "Aura Atelier Backend (Port 8000)" cmd /k "cd /d e:\Jewelleryweb\backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Launch Vite Frontend in a new window
start "Aura Atelier Frontend (Port 5173)" cmd /k "cd /d e:\Jewelleryweb\frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo Backend URL:  http://127.0.0.1:8000
echo Frontend URL: http://127.0.0.1:5173
echo Admin Login:  http://127.0.0.1:5173/admin/login
echo.
echo Both servers have been launched in separate windows!
pause

