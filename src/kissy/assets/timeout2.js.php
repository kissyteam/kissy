<?php
	sleep(2);
?>

KISSY.add('timeout2', function(S) {
    S.log('timeout2.js is attached.');
});

S.log('timeout2.js is loaded, parsed and executed.')
