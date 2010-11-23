<?php
//sleep(5);

//测试数据
$data = array('name' => 'test', 'birth' => '2010/11/23', 'email' => 'test@gmail.com');

if ($_GET['t'] == 'get') {
    $dataStr = json_encode($data + $_GET);
    if (isset($_GET['callback'])) {
        $dataStr = $_GET['callback'] . '(' . $dataStr . ');';
    }
    echo $dataStr;
}
else if ($_GET['t'] == 'post') {
    echo json_encode($_POST);
}

?>
