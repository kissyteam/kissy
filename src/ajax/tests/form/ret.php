<?php
header("Content-Type:text/xml;");
echo '<?xml version="1.0"?>';
echo '<cross-domain-policy>';
echo '    <allow-access-from domain="*.taobao.com" />';
    echo '<allow-access-from domain="*.taobao.net" />';
    echo '<allow-access-from domain="*.etao.com" />';
    echo '<allow-access-from domain="*.etao.net" />';
   echo ' <allow-access-from domain="*.taobaocdn.com" />';
    echo '<allow-access-from domain="*.tbcdn.cn" />';
   echo ' <allow-access-from domain="*.koubei.com" />';
   echo ' <allow-access-from domain="*.koubei.net" />';
   echo '</cross-domain-policy>';
?>