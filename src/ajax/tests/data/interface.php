<?php
//sleep(10);
if (isset($_GET['contype'])) {
    header("Content-type: " . $_GET['contype'] . "; charset=utf-8");
} else {
    header("Content-type: text/html; charset=utf-8");
}

//测试数据
$data = array('name' => 'test', 'birth' => '2010/11/23', 'email' => 'test@gmail.com');

$dataStr = json_encode($data + $_POST + $_GET);
if (isset($_GET['sleep'])) {
    sleep($_GET['sleep']);
}

if (isset($_GET['customCallback'])) {
    $dataStr = $_GET['customCallback'] . '(' . $dataStr . ');';
} else if (isset($_GET['callback'])) {
    $dataStr = $_GET['callback'] . '(' . $dataStr . ');';
} else if (isset($_GET['type'])
           && $_GET['type'] == 'post'
           && isset($_GET['dataType'])
           && $_GET['dataType'] == 'script'
) {
    $dataStr = 'var global_script_test = 500;';
} else if (isset($_GET['dataType'])
           && $_GET['dataType'] == 'script'
) {
    $dataStr = 'var global_script_test = 200;';
}
echo $dataStr;
?>
