#!/usr/local/bin/phantomjs

/**
 * run jasmine in phantomjs
 * @author yiminghe@gmail.com
 */

var page = require('webpage').create();

page.onConsoleMessage = function (m) {
    console.log(m);
    var match;
    if (match = m.match(/specs?, (\d+) failures? in/)) {
        if (!t && match[1] == '0') {
            setTimeout(next, 100);
        } else {
            phantom.exit(1);
        }
    }
};

//page.onResourceRequested = function (request) {
//    console.log('Request ' + JSON.stringify(request, undefined, 4));
//};
//page.onResourceReceived = function (response) {
//    console.log('Receive ' + JSON.stringify(response, undefined, 4));
//};

var tests = require('./tc.js')(), index = -1;
var start = Date.now();
function next(url) {
    if (!url) {
        index++;
        if (index == tests.length) {
            var d = (Date.now() - start);
            console.log('all run success! consume time: ' + d + ' ms / ' +
                (d / 1000) + ' s / ' +
                (d / 60000) + ' m ' +
                ':)');
            phantom.exit(0);
            return;
        }
    }
    if (!url) {
        url = tests[index];
    }
    console.log('\n' + 'run test: ' + url);
    // batch run in separated window, it is better than iframe!
    page.open('http://localhost:8888' + url, function (s) {
        if (s != 'success') {
            console.log('can\'t load the address! :(');
            phantom.exit(1);
        }
    });
}
var t = '';
// t = '/kissy/src/xtemplate/tests/runner/test.html';
// t='/src/seed/tests/specs/package-raw/test-combo.html';
//t='/kissy/src/dd/sub-modules/constrain/tests/runner/test.html';
next(t);
