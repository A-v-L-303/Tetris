# Startet Frontend- und Backend-Dev-Server in separaten Terminals

$root = $PSScriptRoot

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; npm run dev"

Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:3001"
