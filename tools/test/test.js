/**
 * unit test framework for S
 * @author yiminghe@gmail.com
 */
(function () {
    var index = -1;
    var S = KISSY;
    window.tests = [];
    var testIframe;
    var uri = new S.Uri(location.href);
    var testBuild = uri.getQuery().has('build');

    if (!uri.getQuery().has('once')) {
        if (('onmessage' in window) && window.addEventListener) {
            S.log('using onmessage');

            window.addEventListener("message", function (e) {
                if (e.data == "next") {
                    SNext();
                }
            }, false);

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
                testIframe.src = tests[index] + "?" + (+new Date())
                    + (testBuild ? '&build' : '');
            }, 50);
        }
    }

    window.onload = function () {
        testIframe = document.createElement('iframe');
        testIframe.height = 600;
        testIframe.frameborder = 'none';
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