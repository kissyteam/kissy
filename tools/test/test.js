/**
 * unit test framework for S
 * @author yiminghe@gmail.com
 */

(function () {

    var index = -1;
    var S = KISSY;
    var $ = S.all;
    window.tests = [];
    var testIframe;
    var uri = new S.Uri(location.href);

    if (!uri.getQuery().has('once')) {
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
        testIframe.height = 600;
        testIframe.style.cssText = 'width:100%;' +
            'height:600px;' +
            '-webkit-overflow-scrolling: touch;' +
            'border:1px solid red;';
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
})();