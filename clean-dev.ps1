# PowerShell script to clean Next.js development environment
# This script fixes the recurring webpack module resolution errors

Write-Host "Cleaning Next.js development environment..." -ForegroundColor Yellow

# Kill all Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Blue
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "No Node.js processes found" -ForegroundColor Gray
}

# Remove .next directory
Write-Host "Removing .next directory..." -ForegroundColor Blue
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host ".next directory removed" -ForegroundColor Green
} else {
    Write-Host ".next directory not found" -ForegroundColor Gray
}

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Blue
npm cache clean --force
Write-Host "npm cache cleaned" -ForegroundColor Green

# Clean any other potential cache directories
$cacheDirs = @("node_modules\.cache", ".turbo", ".swc")
foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "Removing $dir..." -ForegroundColor Blue
        Remove-Item -Recurse -Force $dir
        Write-Host "$dir removed" -ForegroundColor Green
    }
}

Write-Host "Environment cleaned successfully!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' to start the development server" -ForegroundColor Cyan