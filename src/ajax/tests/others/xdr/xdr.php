<?php
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Cache-Control: no-cache");
    header("Pragma: no-cache");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Origin: http://chengyu.taobao.ali.com");
    header("Access-Control-Allow-Headers: Content-Type, *");
  
    echo '{"'.$_REQUEST["action"].'":1}';
  

?>