@echo off
REM This script calls the ps1 file in the same directory
cd "T:\inetpub\wwwroot\tau\scripts\openAI\"
set "scriptPath=%~dp0setAiBackground.ps1"
if exist "%scriptPath%" (
    powershell -ExecutionPolicy Bypass -File "%scriptPath%"
) else (
    echo Script not found: %scriptPath%
    exit /b 1
)