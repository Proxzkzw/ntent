Write-Host "Building and Packaging Ntent..." -ForegroundColor Cyan
npm run deploy

Write-Host "Installing to VS Code..." -ForegroundColor Cyan
code --install-extension ntent-1.0.0.vsix --force

Write-Host "Done!" -ForegroundColor Green