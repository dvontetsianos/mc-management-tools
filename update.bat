@echo off
cd /d "C:\MC Management Tools"

echo Pulling latest code...
git pull

echo Installing backend dependencies...
call .venv\Scripts\pip install -r requirements.txt

echo Installing and building frontend
cd frontend
call npm install
call npm build
cd ..

echo Restarting Service...
"C:\Users\d.vontetsianos\Desktop\nssm-2.24\win64\nssm.exe" restart MCManagementTools

echo Done.
pause