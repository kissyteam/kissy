@echo off
pushd "%~dp0"
set ANT="%~dp0..\..\kissy-tools\ant\bin\ant.bat"
call %ANT% -buildfile run.xml build-all
pause
exit