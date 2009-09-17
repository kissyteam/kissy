<?php
    $code = $_POST["code"];
?>
<!doctype html>
<html>
<head>
<title>Editor Preview</title>
<meta http-equiv="Content-Type" content="text/html; charset=gb18030">
<link rel="stylesheet" href="themes/default/content.css" type="text/css"/>
</head>
<head>
<body>
<?php
    echo(stripslashes($code));
?>
</body>
</html>