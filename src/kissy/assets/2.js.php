<?php
	sleep(1.2);
?>

KISSY.add('2', function(S) {
    S.log('2.js is attached.');
});

S.log('2.js is loaded, parsed and executed.')
