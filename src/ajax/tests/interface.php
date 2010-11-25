<?php
//sleep(5);

//测试数据
$data = array('name' => 'test', 'birth' => '2010/11/23', 'email' => 'test@gmail.com');
$type = $_GET['t'];

if ($type == 'get') {
    $dataStr = json_encode($data + $_GET);
    if (isset($_GET['callback'])) {
        $dataStr = $_GET['callback'] . '(' . $dataStr . ');';
    } else if($_GET['dataType'] == 'script') {
        $dataStr = 'var global_script_test = 200;';
    }
    echo $dataStr;
}
else if ($type == 'post') {
    echo json_encode($_POST);
}

?>
