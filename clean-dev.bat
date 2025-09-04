@echo off
echo 🧹 Cleaning Next.js development environment...

echo 🔄 Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️  No Node.js processes found
)

echo 🗑️  Removing .next directory...
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ .next directory removed
) else (
    echo ℹ️  .next directory not found
)

echo 🧽 Cleaning npm cache...
npm cache clean --force
echo ✅ npm cache cleaned

echo 🎉 Environment cleaned successfully!
echo 💡 You can now run 'npm run dev' to start the development server
pause
