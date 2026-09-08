@echo off
title MORBUS // Helix of Empathy Server
echo ========================================================
echo  Launching MORBUS 3D WebGL Awareness Experience...
echo ========================================================
start "" "http://localhost:8080"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
