<?php
    $code = $_POST["code"];
?>
<!doctype html>
<html>
<head>
<title>Editor Preview</title>
<meta charset="gbk">
<link rel="stylesheet" href="../cssreset/reset.css" />
<link rel="stylesheet" href="themes/default/post.css" />
</head>
<head>
<body class="ks-editor-post">
<?php
    echo(stripslashes($code));
?>
</body>
</html>