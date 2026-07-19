@echo off
title CV Editor — Starting...
color 0A
cls

echo.
echo  ============================================
echo       CV Editor  ^|  AI-Powered  ^|  v1.0.0
echo  ============================================
echo.

:: Navigate to project directory
cd /d "D:\PERSONAL PROJECT\CV Maker"

:: Check if node_modules exists
if not exist "node_modules" (
    echo  [INFO] Pertama kali dijalankan. Menginstall dependencies...
    echo         Ini mungkin memerlukan beberapa menit.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [ERROR] npm install gagal. Pastikan Node.js sudah terinstall.
        echo          Download: https://nodejs.org
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies berhasil diinstall!
    echo.
)

:: Open browser after short delay (non-blocking)
echo  [INFO] Membuka browser dalam 3 detik...
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

echo  [INFO] Menjalankan dev server...
echo  [INFO] Tekan Ctrl+C untuk menghentikan server.
echo.
echo  ============================================
echo.

call npm run dev

:: Pause if server exits unexpectedly
echo.
echo  [INFO] Server dihentikan.
pause
