@echo off
echo Stopping Vue Client...
taskkill /FI "WINDOWTITLE eq npm" /F /T
echo:
echo Stopping Nodemon Server...
taskkill /FI "WINDOWTITLE eq NodemonServer - nodemon   server" /F /T
echo:
echo Success!
pause
