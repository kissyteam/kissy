<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width = device-width,initial-scale = 1.0">
    <title>KISSY Editor Test</title>
    <link href="../../../../../build/css/dpl/base.css" rel="stylesheet"/>
    <link href="../../../../../build/editor/theme/cool/editor.css" rel="stylesheet"/>
    <link href="http://www.alibabatech.org/css/shCoreDefault.css" rel="stylesheet"/>
</head>
<body>
<h1 style="font-size: 2em;text-align: center;margin: 2em;">KISSY Editor Content</h1>


<div class="ks-editor-post" style="margin: 10px 30px;">
    <?php
    echo $_POST['content'];
    ?>
</div>
<script src='http://www.alibabatech.org/js/shCore.js'></script>
<script>
    SyntaxHighlighter.highlight();
</script>
</body>
</html>