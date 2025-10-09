# Скрипт установки зависимостей для PizzaCalk

Write-Host "🍕 Установка зависимостей для PizzaCalk..." -ForegroundColor Green

# Установка корневых зависимостей
Write-Host "📦 Установка корневых зависимостей..." -ForegroundColor Yellow
npm install

# Установка зависимостей frontend
Write-Host "🎨 Установка зависимостей frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Установка зависимостей backend
Write-Host "⚙️ Установка зависимостей backend..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

Write-Host "✅ Все зависимости установлены!" -ForegroundColor Green
Write-Host ""
Write-Host "Для запуска проекта выполните:" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Или запустите отдельно:" -ForegroundColor Cyan
Write-Host "Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "Backend: cd backend && npm run dev" -ForegroundColor White





