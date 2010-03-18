@echo off
pushd "%~dp0"
set ANT="%~dp0ant\bin\ant.bat"

cd ../src
for /F %%f in ('dir build.xml /b /s') do (
	cd %%~pf
	call %ANT%
)
popd

cd ../build
for /F %%f in ('dir build.xml /b /s') do (
	cd %%~pf
	call %ANT%
)
popd

pause
exit
