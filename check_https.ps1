$domain = "https://xbasians.org"

while ($true) {
    Write-Host "Checking $domain ..."
    try {
        $response = Invoke-WebRequest -Uri $domain -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ HTTPS is working!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "❌ Not ready yet. Retrying in 30s..." -ForegroundColor Red
    }
    Start-Sleep -Seconds 30
}

Read-Host "Нажмите Enter для продолжения..."