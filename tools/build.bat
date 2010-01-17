@echo off

cd ../src
for /F %%f in ('dir build.xml /b /s') do (
	echo %%~pf
	REM call c:\ourtools\ant\bin\ant.bat
)

pause
exit