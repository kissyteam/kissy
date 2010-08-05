@echo off
pushd "%~dp0"
set ANT="%~dp0..\..\kissy-tools\ant\bin\ant.bat"

cd ../src
for /F %%f in ('dir build.xml /b /s') do (
    cd %%~pf
    call %ANT%
)
popd

cd build-xml
copy /y "cssbase-build.xml" "../../build/cssbase/build.xml"
copy /y "cssreset-grids-build.xml" "../../build/cssreset-grids/build.xml"
copy /y "packages-build.xml" "../../build/packages/build.xml"

cd ../../build
for /F %%f in ('dir build.xml /b /s') do (
    cd %%~pf
    call %ANT%
)

pause
exit
