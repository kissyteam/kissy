<?php
    header("Content-Type:text/html; charset=utf-8");
header("Expires:-1");
header("Cache-Control:private, max-age=0, must-revalidate");
?>
<html>
<head>
<script src="../build/kissy.js"></script>
</head>
<h1>KISSY 集成化测试</h1>
<button id='retry'>retry</button>
<iframe id="test" src=''
        style="width:100%;height:600px;border:1px solid red;"></iframe>
<script src='test.js'></script>
<script >
<?php

    $baseDir = "./";
    $fso = opendir($baseDir);
    while ($file = readdir($fso)) {
        if (is_dir($file) && $file != "." && $file != "..") {
            $testdir=$file . "/tests/runner/";
            if (is_dir($testdir)) {
                $fso2 = opendir($testdir);
                while ($file2 = readdir($fso2)) {
                    if ($file2 != "." && $file2 != "..") {
                        echo "tests.push('" . $testdir.$file2. "');\n";
                    }
                }
            }
        }
    }
    closedir($fso);
?>
    window.onload = function() {
        kissyNext();
    };
    document.writeln(tests.join("<br>"));
</script>
</html>

