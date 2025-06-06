@echo off
REM This script calls the ps1 file in the same directory

REM Load configuration from separate file
call "%~dp0config.bat"

cd "%OPENAI_DIR%"
set "scriptPath=%~dp0setAiBackground.ps1"
if exist "%scriptPath%" (
    powershell -ExecutionPolicy Bypass -File "%scriptPath%"
    exit /b 0
) else (
    echo Script not found: %scriptPath%
    exit /b 1
)