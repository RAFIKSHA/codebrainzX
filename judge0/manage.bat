@echo off
SETLOCAL EnableDelayedExpansion

SET SERVICE_NAME=Judge0 Local CE
SET DOCKER_COMPOSE_CMD=docker-compose

:: Check if docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not installed or not in your PATH.
    echo Please install Docker Desktop on Windows: https://www.docker.com/products/docker-desktop
    exit /b 1
)

:: Validate action arg
if "%~1"=="" goto help
if "%~1"=="start" goto start
if "%~1"=="stop" goto stop
if "%~1"=="restart" goto restart
if "%~1"=="status" goto status
if "%~1"=="verify" goto verify

:help
echo ===================================================
echo %SERVICE_NAME% Controller Script
echo ===================================================
echo Usage: manage.bat [action]
echo.
echo Actions:
echo   start     Starts the local Judge0 server and worker containers
echo   stop      Stops and removes the Judge0 containers
echo   restart   Restarts Judge0 containers
echo   status    Shows current status of Docker containers
echo   verify    Runs execution test check on the compiler instance
echo.
exit /b 0

:start
echo [INFO] Starting Postgres DB and Redis services first...
%DOCKER_COMPOSE_CMD% up -d db redis
echo [INFO] Waiting 10 seconds for database initialization...
timeout /t 10 /nobreak >nul
echo [INFO] Starting remaining Judge0 server and worker services...
%DOCKER_COMPOSE_CMD% up -d
echo [INFO] Judge0 services successfully started!
echo [INFO] Access compiler health page: http://localhost:2358/languages
exit /b 0

:stop
echo [INFO] Stopping and cleaning up local Judge0 containers...
%DOCKER_COMPOSE_CMD% down
echo [INFO] Judge0 services successfully stopped.
exit /b 0

:restart
call :stop
call :start
exit /b 0

:status
echo [INFO] Current Judge0 Docker containers state:
%DOCKER_COMPOSE_CMD% ps
exit /b 0

:verify
echo [INFO] Querying supported languages on http://localhost:2358/languages ...
curl -s http://localhost:2358/languages
exit /b 0
