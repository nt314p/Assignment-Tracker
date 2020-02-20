@echo off
start npm run serve
timeout /t 6
cd api
start "NodemonServer" nodemon server
timeout /t 3
start http://localhost:8080