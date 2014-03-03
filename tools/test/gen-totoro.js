var tc = require('./tc')();
var cwd = process.cwd();
var totoroConfig = cwd + '/.totoro.json';
var fs = require('fs');
var testsData = [];
var configData = {
    group: "KISSY",
    notice: 1,
    tests: testsData
};

var email = ['yiminghe@gmail.com'];
var prefix = '/kissy/src/';
var server = 'http://dev.kissyui.com';

function getModName(t) {
    t = t.slice(prefix.length);
    t = t.replace(/\/tests.+/, '');
    t = t.replace(/sub-modules\//g, '');
    return t;
}

function endsWith(str, suffix) {
    var ind = str.length - suffix.length;
    return ind >= 0 && str.indexOf(suffix, ind) === ind;
}

tc.forEach(function (t) {
    if (endsWith(t, '?build') || endsWith(t, '?coverage') || t.indexOf('send-to-coveralls') !== -1) {
        return;
    }
    var mod = getModName(t);
    testsData.push({
        name: mod,
        runner: server + t,
        email: email
    });
});

fs.writeFileSync(totoroConfig, JSON.stringify(configData, undefined, 4));
