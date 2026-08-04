@echo off
cd /d "%~dp0.."
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
)
if not exist .env (
  echo Copiando .env.example para .env...
  copy .env.example .env
  echo Edite .env com suas chaves e rode novamente.
  pause
  exit /b 1
)
echo.
echo  Prompt Atelier — http://localhost:3456
echo.
call npm run dev
