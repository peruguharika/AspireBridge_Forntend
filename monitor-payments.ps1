# Payment Monitoring Script
# Run this script periodically to check for unprocessed payments

Write-Host "Starting Payment Monitoring..." -ForegroundColor Green
Write-Host "Time: $(Get-Date)" -ForegroundColor Gray

# Change to backend directory
Set-Location backend

# Run payment monitor
Write-Host "`nRunning Payment Monitor..." -ForegroundColor Yellow
node payment-monitor.js

# Return to original directory
Set-Location ..

Write-Host "`nPayment monitoring complete!" -ForegroundColor Green
Write-Host "To run this automatically, set up a scheduled task:" -ForegroundColor Cyan
Write-Host "   - Windows: Task Scheduler" -ForegroundColor Gray
Write-Host "   - Linux/Mac: Cron job" -ForegroundColor Gray
Write-Host "   - Recommended frequency: Every 30 minutes" -ForegroundColor Gray