<?php
	sleep(2);
?>

KISSY.add('large-async', function(S) {
    S.log('large-async.js is attached.');
});

S.log('large-async.js is loaded, parsed and executed.')
