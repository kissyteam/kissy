<?php
    $head = "/**\n".
            "* parser for xtemplate from kison.\n".
            "* @author yiminghe@gmail.com\n".
            "*/\n".
           "KISSY.add('xtemplate/parser', function () {\n";
    $foot = '});';
    $code = $head.$_POST['data']."\n".$foot;
    $file = fopen("../src/parser.js","w");
    fwrite($file,$code);
    fclose($file);

    echo "{status:1}";
?>