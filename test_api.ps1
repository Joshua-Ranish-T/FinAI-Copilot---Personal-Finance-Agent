# Test API script to get token and access protected endpoints

# Get access token
$tokenResponse = Invoke-RestMethod -Uri "http://localhost:5000/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=user@example.com&password=secret"

Write-Host "Token response:" -ForegroundColor Green
$tokenResponse | ConvertTo-Json | Write-Host

# Use token to access protected endpoints
$headers = @{"Authorization" = "Bearer $($tokenResponse.access_token)"}

# Get transactions
$transactions = Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method GET -Headers $headers
Write-Host "\nTransactions response:" -ForegroundColor Green
$transactions | ConvertTo-Json | Write-Host

# Get alerts
$alerts = Invoke-RestMethod -Uri "http://localhost:5000/alerts" -Method GET -Headers $headers
Write-Host "\nAlerts response:" -ForegroundColor Green
$alerts | ConvertTo-Json | Write-Host

# Get insights
$insights = Invoke-RestMethod -Uri "http://localhost:5000/insights" -Method GET -Headers $headers
Write-Host "\nInsights response:" -ForegroundColor Green
$insights | ConvertTo-Json | Write-Host

# Test chat endpoint
$chatResponse = Invoke-RestMethod -Uri "http://localhost:5000/chat?message=Hello+world" -Method POST -Headers $headers
Write-Host "\nChat response:" -ForegroundColor Green
$chatResponse | ConvertTo-Json | Write-Host