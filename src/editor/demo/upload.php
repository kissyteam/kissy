<?php

 $HOST = $_SERVER['HTTP_HOST'];

 if(DIRECTORY_SEPARATOR=='\\') {
	 sleep(1); // 加延时，查看进度条效果
	 $uploaddir = 'e:\\web_root\\htdocs\\kissy\\src\\editor\\demo\\uploads\\';
 }

 $filename = basename($_FILES['imgFile']['name']);
 $uploadfile = $uploaddir . $filename;
 $uri = 'http://' . $HOST . '/kissy/src/editor/demo/uploads/';
 
 if (move_uploaded_file($_FILES['imgFile']['tmp_name'], $uploadfile)) {
    echo '{"status": "0", "imgUrl": "' . $uri . $filename . '"}';
 } else {
     echo '{"status": "1", "error": "上传过程中出错了"}';
 }

 //echo 'Here is some more debugging info:';
 //print_r($_FILES);
 //print_r($_POST);
?> 
