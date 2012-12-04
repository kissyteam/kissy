<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="viewport" content="width = device-width,initial-scale = 1.0">
    <title>KISSY Editor Test</title>
    <link href="/kissy/build/css/dpl/base.css" rel="stylesheet"/>
    <link href="/kissy/build/editor/theme/cool/editor.css" rel="stylesheet"/>
    <link href="http://ata.alacner.com/css/shCoreDefault.css" rel="stylesheet"/>
</head>
<body>
<h1 style="font-size: 2em;text-align: center;margin: 2em;">KISSY Editor Content</h1>


<div class="ks-editor-post" style="margin: 10px 30px;border:1px solid red;">
   <?php
       echo ($_POST['content']);
       ?>
</div>
<script src='http://ata.alacner.com/js/shCore.js'></script>
<script>
    SyntaxHighlighter.highlight();
</script>
<form action='edit.php' method='post' style='margin:30px;'>
    <textarea name='content' style='position:absolute;left:-9999px;top:-9999px;'>
         <?php
               echo htmlspecialchars($_POST['content']);
               ?>
    </textarea>
    <input type='submit' value='编辑' />
</form>
</body>
</html>