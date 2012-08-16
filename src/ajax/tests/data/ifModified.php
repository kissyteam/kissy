<?php
$last=0;
$headers=apache_request_headers();
foreach ($headers as $header=>$value) {
   //echo $header.' : '.$value.'<br>\n';
   if($header=="If-Modified-Since"){
    $last= 1;
   }
}

if($last==1){
    header("HTTP/1.1 304 Not Modified");
    header("Expires:Thu, 16 Aug 2012 01:50:40 GMT");
    return;
}

header("Content-Type:text/html");
header("Last-Modified: Thu, 18 Jul 2002 15:48:32 GMT");
header("Expires:Thu, 16 Aug 2012 00:50:40 GMT");
echo $last;
?>