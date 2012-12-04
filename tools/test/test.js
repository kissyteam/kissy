/**
 * unit test framework for S
 * @author yiminghe@gmail.com
 */

var index = -1;
var S = KISSY;
var $ = S.all;
var tests = [];
var testIframe;


if ('onmessage' in window) {
    S.log('using onmessage');
    S.Event.on(window, "message", function (e) {
        if (e.originalEvent.data == "next") {
            SNext();
        }
    });
} else {
    S.log('window.name');
    setInterval(function () {
        if (window.name == 'next') {
            SNext();
            window.name = '';
        }
    }, 1000);
}
function SNext() {
    // event hash change ,ie error
    index++;
    if (tests[index]) {
        S.log('run: ' + tests[index]);
        window.scrollTo(0, 0);
        location.hash = tests[index];
        setTimeout(function () {
            testIframe.src = tests[index] + "?" + (+new Date());
        }, 50);
    }
}

window.onload = function () {
    testIframe = document.createElement('iframe');
    testIframe.style.cssText = 'width:100%;height:600px;border:1px solid red;';
    document.getElementById('iframe').appendChild(testIframe);
    var hash = location.hash.replace(/^#/, '');
    if (hash) {
        index = S.indexOf(hash, tests);
        if (index > 0) {
            index--;
        }
    }
    if (1) {
        SNext();
    }
};