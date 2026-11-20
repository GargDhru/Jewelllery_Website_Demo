Write-Host "========================================================" -ForegroundColor Gold
Write-Host "  Starting Aura Atelier Luxury Jewellery Platform...   " -ForegroundColor Gold
Write-Host "========================================================" -ForegroundColor Gold

# Start Backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\Jewelleryweb\backend; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# Start Frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\Jewelleryweb\frontend; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "`n✓ Backend running on: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "✓ Frontend running on: http://127.0.0.1:5173" -ForegroundColor Green
Write-Host "✓ Admin Login URL:     http://127.0.0.1:5173/admin/login" -ForegroundColor Cyan
Write-Host "`nAdmin Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    dhrugar@gmail.com" -ForegroundColor White
Write-Host "  Password: Dragonp@72" -ForegroundColor White

