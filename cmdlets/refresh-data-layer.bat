@echo off
echo ========================================
echo Refreshing Data Layer
echo ========================================
echo.

echo Select source:
echo   1 - Local  (localhost:5012)
echo   2 - Global (10.10.110.3:1229)
echo.
set /p "choice=Enter choice (1 or 2): "

if "%choice%"=="1" (
    set "BASE_URL=http://localhost:5012"
) else if "%choice%"=="2" (
    set "BASE_URL=http://10.10.110.3:1229"
) else (
    echo ERROR: Invalid choice. Please enter 1 or 2.
    pause
    exit /b 1
)

echo.
echo Step 1: Downloading swagger.json from %BASE_URL%...
curl -o swagger.json %BASE_URL%/swagger/v1/swagger.json

if %errorlevel% neq 0 (
    echo ERROR: Failed to download swagger.json
    exit /b 1
)

echo SUCCESS: swagger.json downloaded
echo.

echo Step 2: Generating data layer code...
call ng-openapi-gen --input swagger.json --output src/app/data

if %errorlevel% neq 0 (
    echo ERROR: Failed to generate data layer code
    exit /b 1
)

echo SUCCESS: Data layer code generated
echo.

echo Step 3: Cleaning up swagger.json...
del swagger.json

if %errorlevel% neq 0 (
    echo WARNING: Failed to delete swagger.json
) else (
    echo SUCCESS: swagger.json deleted
)

echo.
echo ========================================
echo Data Layer Refresh Complete!
echo ========================================
pause
