<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-touch-fullscreen" content="yes">
<title>KISSY cssreset Demo</title>
<style>
    #wrap {
        width:950px;
        margin: 10px auto;
    }
</style>
</head>
<body>
<div id="wrap">
    <h1>KISSY cssreset</h1>
    <a target="_blank" href="./reset/demo.html">all demo</a>
    <br>

    <?php
        $i=0;
        $baseDir = "./reset/";
        $fso = opendir($baseDir);
        while ($file = readdir($fso)) {
            if ( $file != "." && $file != ".." && $file !="demo.html") {
                if($i%2==0){
                    echo '<br/>';
                }
                $i++;
                echo '<a target="_blank" href="' . $baseDir.$file. '">'.substr($file,0,strrpos($file, '.')).'</a>'."\n";
                echo '<br/>';
            }
        }
        closedir($fso);
    ?>

</div>
</body>
</html>