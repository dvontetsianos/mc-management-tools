@echo off
cd /d "C:\MC Management Tools"

echo Backing up the database...
call .venv\Scripts\python backup_db.py --before-update
if errorlevel 1 (
    echo.
    echo BACKUP FAILED - the update was stopped, nothing was changed.
    echo See logs\backup_log.txt for the reason
    pause
    exit /b 1
)

echo Pulling latest code...
git pull

echo Installing backend dependencies...
call .venv\Scripts\pip install -r requirements.txt

echo Installing and building frontend
cd frontend
call npm install
call npm run build
cd ..

echo Restarting Service...
"C:\nssm-2.24\win64\nssm.exe" restart MCManagementTools

echo Done.
pause