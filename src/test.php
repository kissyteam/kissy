<?php
    header("Content-Type:text/html; charset=utf-8");
header("Expires:-1");
header("Cache-Control:private, max-age=0, must-revalidate");
?>
<html>
<head>
</head>
<h1>KISSY 集成化测试</h1>
<iframe id="test" src=''
        style="width:100%;height:100%;border:1px solid red;"></iframe>
<script type="text/javascript">
    var index = 0;
    var tests = [];

    var jasmine = {};
    jasmine.kissyNext = function(failedCount) {
        if (!failedCount) {
            index++;
            if (tests[index]) {
                document.getElementById("test").src = tests[index] + "?" + (+new Date());
            }
        }
    };

<?php

    $baseDir = "./";
    $fso = opendir($baseDir);
    while ($file = readdir($fso)) {
        if (is_dir($file) && $file != "." && $file != "..") {
            $testfile = $file . "/tests/test.html";
            if (file_exists($testfile)) {
                echo "tests.push('" . ($testfile) . "');\n";
            }
        }
    }

    closedir($fso);
    ?>

    window.onload = function() {
        document.getElementById("test").src = tests[0] + "?" + (+new Date());
    }
    document.writeln(tests.join("<br>"));
</script>


</html>

