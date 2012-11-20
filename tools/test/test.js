/**
 * unit test framework for KISSY
 * @author yiminghe@gmail.com
 */

// document.domain='ali.com';
var index = -1;
var $ = KISSY.all;
var tests = [];
var loc = window.location.href.replace(/test.php/, "");
var testIframe = document.getElementById("test");
location.hash = '';

$('#retry').on('click', function () {
    if (tests[index]) {
        testIframe.src = tests[index] + "?" + (+new Date());
    }
});

if ('onmessage' in window) {
    KISSY.log('using onmessage');
    KISSY.Event.on(window, "message", function (e) {
        if (e.originalEvent.data == "next") {
            kissyNext();
        }
    });
} else {
    KISSY.log('window.name');
    setInterval(function () {
        if (window.name == 'next') {
            kissyNext();
            window.name = '';
        }
    }, 1000);
}
function kissyNext() {
    // event hash change ,ie error
    index++;
    if (tests[index]) {
        KISSY.log('run: ' + tests[index]);
        window.scrollTo(0, 0);
        setTimeout(function () {
            testIframe.src = tests[index] + "?" + (+new Date());
        }, 50);
    }
}