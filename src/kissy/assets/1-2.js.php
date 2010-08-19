<?php
	sleep(2);
?>

KISSY.add('1-2', function(S) {
    S.log('1-2.js is attached.');
});

S.log('1-2.js is loaded, parsed and executed.')
