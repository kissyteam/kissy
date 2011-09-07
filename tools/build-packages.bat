@echo off
pushd "%~dp0"
set ANT="%~dp0..\..\kissy-tools\ant\bin\ant.bat"
call %ANT%
pause
exit
