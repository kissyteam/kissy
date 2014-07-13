var cwd = process.cwd();
var fs = require('fs');
var prefix = '/kissy/src/';

function getModName(t) {
    t = t.slice(prefix.length);
    t = t.replace(/\/tests.+/, '');
    t = t.replace(/\/-(\/|$)/g, '$1');
    return t;
}

function endsWith(str, suffix) {
    var ind = str.length - suffix.length;
    return ind >= 0 && str.indexOf(suffix, ind) === ind;
}

module.exports = function () {
    var tc = require('../../common/gen-tc').getData({
        build: 0,
        coverage: 0
    });
    var testsData = [];
    var configData = {
        group: 'KISSY',
        notice: 1,
        tests: testsData
    };
    var email = ['yiminghe@gmail.com'];
    var server = 'http://dev.kissyui.com';
    var trace = {};
    tc.forEach(function (t) {
        if (endsWith(t, '?build') || endsWith(t, '?coverage') || t.indexOf('send-to-coveralls') !== -1) {
            return;
        }
        var mod = getModName(t);
        if (trace[mod]) {
            trace[mod]++;
            mod += trace[mod];
        } else {
            trace[mod] = 1;
        }
        testsData.push({
            name: mod,
            runner: server + t,
            email: email
        });
    });
    return JSON.stringify(configData, undefined, 4);
};