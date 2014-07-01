/**
 * unit test framework
 * @author yiminghe@gmail.com
 */
(function () {
    var index = -1;
    var testIframe;
    var tests = window.tests;
    var testBuild = location.search.indexOf('build') !== -1;

    function indexOf(one, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === one) {
                return i;
            }
        }
        return -1;
    }

    if (location.search.indexOf('once') === -1) {
        if (('onmessage' in window) && window.addEventListener) {
            window.addEventListener('message', function (e) {
                if (e.data === 'next') {
                    SNext();
                }
            }, false);

        } else {
            setInterval(function () {
                if (window.name === 'next') {
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
            window.scrollTo(0, 0);
            location.hash = tests[index];
            setTimeout(function () {
                testIframe.src = tests[index] + '?' + (+new Date())
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
            index = indexOf(hash, tests);
            if (index > 0) {
                index--;
            }
        }
        if (1) {
            SNext();
        }
    };
})();