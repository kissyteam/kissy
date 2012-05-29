<?php
header("Content-Type:text/plain; charset=utf-8");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);

$q = $_GET["q"];
$code = $_GET["code"];
$callback = $_GET["callback"];

$out = "";
$handle = fopen ("http://suggest.taobao.com/sug?q=".$q."&code=".$code, "r");
while (!feof($handle)) {
  $out .= fread($handle, 8192);
}
fclose($handle);

if(!empty($callback)) $out = $callback.'('.$out.')';
sleep(2); // 模拟低速
echo $out;
?>
