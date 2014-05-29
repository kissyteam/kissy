#!/usr/local/bin/phantomjs

/**
 * run jasmine in phantomjs
 * @author yiminghe@gmail.com
 */

/*global phantom*/
var page = require('webpage').create();
var specified = '';
var tests = require('./tc.js')(), index = -1;
var start = Date.now();
var args = require('system').args;
var srcMode = 0;
var coverageMode = 0;
if (args.length > 1 && args[1] === 'src') {
    srcMode = 1;
}
if (args.length > 1 && args[1] === 'coverage') {
    coverageMode = 1;
}

page.onConsoleMessage = function (m) {
    console.log(m);
};

// https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage
page.onCallback = function (data) {
    if (data.type === 'report') {
        var failedCount = data.failedCount;
        if (!specified && failedCount === 0) {
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

function next(url) {
    if (!url) {
        index++;
        if (index === tests.length) {
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
        if (coverageMode) {
            if (url.indexOf('?coverage') === -1) {
                next();
                return;
            }
        }
        if (url.indexOf('?build') !== -1 || url.indexOf('?coverage') !== -1) {
            if (srcMode) {
                next();
                return;
            }
        }
    }
    console.log('\n' + 'run test: ' + url);
    // batch run in separated window, it is better than iframe!
    page.open('http://localhost:8888' + url, function (s) {
        if (s !== 'success') {
            console.log('can\'t load the address! :(');
            phantom.exit(1);
        }
    });
}

// specified = '/kissy/src/color/tests/runner/test.jss?coverage';
// specified = '/src/seed/tests/specs/package-raw/test-combo.html';
// specified = '/kissy/src/dd/tests/runner/test.jss?coverage';
next(specified);
