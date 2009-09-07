@echo off

for /F %%f in ('dir build.xml /b /s') do (
	cd %%~pf
	call c:\ourtools\ant\bin\ant.bat
)

cd ..
pause
