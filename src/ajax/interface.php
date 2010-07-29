<?php

//测试数据
$data = array('type'=>'get','xm'=>'name','xb'=>'sex','mz'=>'nation','cs'=>'birth');
$data_str = json_encode($data);

if($_GET['t'] == 'get'){
	echo $data_str;
}else if($_GET['t'] == 'post'){
	echo json_encode($_POST);
}else if (isset($_GET['my_callback'])){
	echo $_GET['my_callback'].'('.$data_str.');';
}else if (isset($_GET['callback'])){
	echo $_GET['callback'].'('.$data_str.');';
}

?>
