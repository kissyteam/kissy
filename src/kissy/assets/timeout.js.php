<?php
	sleep(15);
?>

KISSY.add('timeout', function(S) {
    S.log('timeout.js is attached.');
});

S.log('timeout.js is loaded, parsed and executed.')
