<?php
header("Content-Type:text/html;");
header("Expires:Mon, 20 Jun 2011 13:31:42 GMT");
sleep(1);
echo "{" .
     (isset($_POST["test"]) ? "\"test\":" . json_encode($_POST["test"]) : "") .
     (isset($_POST["test2"]) ? ",\"test2\":" . json_encode($_POST["test2"]) : "") .
     (isset($_POST["test3"]) ? ",\"test3\":" . json_encode($_POST["test3"]) : "") .
     (isset($_POST["test4"]) ? ",\"test4\":" . json_encode($_POST["test4"]) : "") .
     (isset($_POST["test5"]) ? ",\"test5\":" . json_encode($_POST["test5"]) : "") .
     "}";
?>
