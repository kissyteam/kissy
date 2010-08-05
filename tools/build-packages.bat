@echo off
pushd "%~dp0"
set ANT="%~dp0..\..\kissy-tools\ant\bin\ant.bat"

cd build-xml
copy /y "packages-build.xml" "../../build/packages/build.xml"
popd

cd ../build/packages
call %ANT%

pause
exit
