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
<iframe id="test" src=''
        scrolling="no"
        style="width:100%;height:600px;border:1px solid red;"></iframe>
<script type="text/javascript">
    // document.domain='ali.com';
    var index = -1;
    var tests = [];
    var loc = window.location.href.replace(/test.php/, "");
    var testIframe=document.getElementById("test");
    location.hash='';
    setInterval(function(){
        if(location.hash=='#next'){
            kissyNext();
            location.hash='';
        }
    },1000);

    var kissyNext = function() {
        // event hash change ,ie error
        index++;

        if (false&&tests[index]) {
            if ((true || KISSY.UA.ie || KISSY.UA.webkit) && tests[index].match(/event|ajax\//)) {
                window.open(loc + tests[index] + "?" + (+new Date()));
                index++;
            }
        }
        if (tests[index]) {
            testIframe.src = tests[index] + "?" + (+new Date());
        }
    };

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

