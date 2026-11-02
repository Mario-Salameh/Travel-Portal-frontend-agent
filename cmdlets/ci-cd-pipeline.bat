@echo off
echo ========================================
echo Starting build and deployment process...
echo ========================================

set SERVER_USER=mainuser
set SERVER_HOST=10.10.110.3
set SERVER_PASSWORD=mainpoamert5

call ng build --base-href /agent/  || echo WARNING: Angular build failed, continuing...
echo Build step finished, moving on...

echo.
echo [2/4] Copying files to server...
echo Deleting old configurations
plink -batch -P 2255 -pw %SERVER_PASSWORD% %SERVER_USER%@%SERVER_HOST% "rm -r /var/www/agent/*"

echo Copying new flies
pscp -batch -P 2255 -r -pw %SERVER_PASSWORD% "%~dp0..\dist\test_project\browser\*" %SERVER_USER%@%SERVER_HOST%:/var/www/agent/
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: File copy failed!
    exit /b 1
)
echo Files copied successfully!

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================