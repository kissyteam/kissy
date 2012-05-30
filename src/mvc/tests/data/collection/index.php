<?php
//header("Content-Type:application/json;");
?>
<?php if ($_REQUEST["_method"] == "read") { ?>
[{"x":11,"y":22,"id":9}]
<?php } ?>

<?php if ($_REQUEST["_method"] == "save") { ?>
{"x":5,"y":2,"id":9}
<?php } ?>


<?php if ($_REQUEST["_method"] == "create") { ?>
{"x":11,"y":22,"id":9}
<?php } ?>