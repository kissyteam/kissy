@echo off
REM yubo@taobao.com 2008/10/15 

color 03
setlocal enabledelayedexpansion
echo.
echo  ~ Starting ...

set CONFIG_FILE=make.config
set enable=false
set base_dir=
set output_file=
set cmd_string=

for /f "eol=; tokens=1,2,3,4* delims=[:,]" %%i in (%CONFIG_FILE%) do (
	if "%%j" NEQ "" (
		if "%%i" EQU "-" (
			set enable=false
		) else (
			set enable=true
		)
	)

	if "!enable!" EQU "true" (
		if "%%j" EQU "" (
			set cmd_string=!cmd_string! + "!base_dir!\%%i"
		) else (
			if "!output_file!" NEQ "" (
				set cmd_string=!cmd_string:~2!
				echo.
				copy /Y !cmd_string! "!output_file!" /B
				echo.
				echo  ~ Successfully generated !output_file!
				echo.
				set cmd_string=
			)
			set base_dir=%%l
			set output_file=%%j
		)
	)
)

endlocal

pause
