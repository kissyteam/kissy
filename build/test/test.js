/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  单元测试
 * @author  玉伯<lifesinger@gmail.com>
 */
var KISSY = window.KISSY || {};

(function(win, S, undefined) {

    var doc = win.document,
        PASSED = 'passed',
        get = function(id) {
            return typeof id === 'string' ? doc.getElementById(id) : id;
        },
        now = function() {
            return new Date().getTime();
        },
        fix = function(val) {
            return val < 10 ? '0' + val : val;
        },
        timeStamp = function() {
            var d = new Date();
            return fix(d.getHours()) + ':' + fix(d.getMinutes()) + ':' + fix(d.getSeconds());
        },
        tests = [],
        log, hidepasses, times, wl, scrollTimer,
        konsole = {
            init: function() {
                log = get('log');
                hidepasses = get('hidepasses').checked;
                times = get('times').value;
                wl = get('wl').value;
            },
            time: function (test) {
                test.startTime = now();
            },
            timeEnd: function (test) {
                test.tookTime = now() - test.startTime;
            },
            echo: function(msg, br, prefix) {
                if (br === undefined) br = '<br />';
                if (prefix === undefined) prefix = timeStamp() + ' ';

                log.innerHTML += prefix + msg + br;
                konsole.scrollToEnd();
            },
            scrollToEnd: function() {
                if (scrollTimer) return;
                scrollTimer = setTimeout(function() {
                    log.scrollTop = log.scrollHeight;
                    scrollTimer = null;
                }, 5);
            },
            log: function (test) {
                var msg = '';

                msg += '<span class="' + test.status + '">';
                msg += '[' + test.status.toUpperCase() + '] ';
                msg += test.name + ': ';
                msg += test.tookTime + 'ms ';
                if (test.extraMsg) msg += test.extraMsg;
                msg += '</span>';

                if (test.status === 'sep') {
                    this.echo('', '<hr />', '');
                } else {
                    this.echo(msg);
                }
            }
        };

    // Adds test case
    tests.add = function(n, func) {
        tests.push({
            name: n,
            fn: function() {
                func.call(win, this);
            },
            fail: function(msg) {
                this.status = 'failed';
                if (msg) this.extraMsg = msg;
            },
            status: PASSED,
            extraMsg: '',
            echo: konsole.echo
        });
    };

    // Resets tests
    tests.reset = function() {
        for (var i = 0, n = tests.length; i < n; i++) {
            tests[i].status = PASSED;
            tests[i].extraMsg = '';
        }
    };

    S.Test = {

        Config: { },

        init: function() {

            // set config
            var c = this.Config;
            if (c.times) get('times').value = c.times;
            if (c.hidepasses) get('hidepasses').checked = c.hidepasses;
            if (c.wl) get('wl').value = c.wl;

            // get config
            konsole.init();

            this.__findTests();
        },
        __findTests:function() {
            // add test cases
            var prefix = 'test_',
                global =  win;
            for (var p in global) {
                if (p.indexOf('test_') === 0 && typeof win[p] === 'function') {
                    tests.add(p, win[p]);
                }
            }
            if (tests.length == 0) {
                setTimeout(arguments.callee, 100);
                //console.log("xunhuan");
                return;
            }
            //alert(tests.length);
            // adjust for firefox
            if (navigator.userAgent.indexOf('Firefox') !== -1) {
                tests.reverse();
            }

            // set inited flag
            inited = true;
        },

        render: function() {
            var scripts = doc.getElementsByTagName('script'),
                currentScript = scripts[scripts.length - 1],
                cssUrl = currentScript.src.replace('.js', '.css'),
                tmpl = '<link rel="stylesheet" href="' + cssUrl + '" />' +
                    '<form onsubmit="return false" action="" class="ks-test-form">' +
                    '<button type="button" onclick="KISSY.Test.start()">Start</button>' +
                    '<div id="konsole">' +
                    '<div id="log"></div>' +
                    '</div>' +
                    '<div class="settings">' +
                    'Settings:<br/>' +
                    '<input type="checkbox" id="hidepasses" name="hidepasses"/>' +
                    '<label for="hidepasses">Hide passes</label><br/>' +
                    '<input type="text" value="1" id="times" size="4"/>' +
                    '<label for="times">Iteration times for each test function</label><br/>' +
                    '<input type="text" value="" id="wl" size="12"/>' +
                    '<label for="wl">The whitelist of test names</label>' +
                    '</div>' +
                    '</form>';
            doc.body.className += ' ks-test';
            doc.write(tmpl);
        },

        start: function() {

            // get latest settings
            konsole.init();

            // reset
            tests.reset();

            var len = tests.length, test, i, j;
            times = times || 1;
            wl = wl || '';

            konsole.echo('[START]');
            for (i = 0; i < len; i++) {
                test = tests[i];
                if (wl && wl.indexOf(test.name) === -1) continue;

                j = times;
                konsole.time(test);
                while (j--) test.fn();
                konsole.timeEnd(test);

                if (hidepasses && test.status === PASSED) continue;
                konsole.log(test);
            }
            konsole.echo('[DONE]', '<hr />');
        },

        echo: konsole.echo
    };

    // render markup immediately
    S.Test.render();

    // attach load event
    var inited = false;

    function initTest() {
        if (!inited) {
            S.Test.init();
        }
    }

    if (win.attachEvent) {
        win.attachEvent('onload', initTest);
    } else {
        win.addEventListener('load', initTest, false);
    }

})(window, KISSY);
