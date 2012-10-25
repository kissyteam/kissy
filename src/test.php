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

<script src='test.js'></script>

<iframe id="test" src=''
        style="width:100%;height:600px;border:1px solid red;"></iframe>

<script>

    testIframe = document.getElementById('test');

<?php

    $baseDir = "./";

    function collectTc($baseDir){
        $fso = opendir($baseDir);
        $ts="tests/runner";
        $tl = strlen($ts);
        while ($file = readdir($fso)) {
            $full= $baseDir.$file;
            if (is_dir($full) && $file != "." && $file != "..") {
                 if(substr($full, -$tl)==$ts){
                      $fso2 = opendir($full);
                      while ($file2 = readdir($fso2)) {
                          if ($file2 != "." && $file2 != "..") {
                              echo "tests.push('" . $full.'/'.$file2. "');\n";
                          }
                      }
                      closedir($fso2);
                 }else{
                    collectTc($full."/");
                 }
            }
        }
        closedir($fso);
    }

    collectTc($baseDir);

?>
    window.onload = function() {
        kissyNext();
    };
    document.writeln(tests.join("<br>"));
</script>


</html>

