<?php
header("Content-Type:application/json;");

?>
<?php if ($_REQUEST["_method"] == "read") { ?>
{"x":1,"y":2,"id":9}
<?php } ?>

<?php if ($_REQUEST["_method"] == "update") {
if(isset($_REQUEST["model"])){
?>
{"x":5,"y":2,"id":9}
<?php }
else{
?>
{"x":566,"y":6662,"id":9}
<?php }
} ?>


<?php if ($_REQUEST["_method"] == "delete") { ?>
{"x":-1,"y":2,"id":-1}
<?php } ?>