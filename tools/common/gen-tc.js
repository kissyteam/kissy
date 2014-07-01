/**
 * gen tc.js to share tests between phantomjs and nodejs
 * @author yiminghe@gmail.com
 */

/*jshint quotmark:false*/
var path = require('path');
var fs = require('fs');
var root = path.join(__dirname, '../../..');
var kissyDir = path.join(root, 'kissy');
var srcDir = path.join(kissyDir, 'src/');
var mark = '/tests/runner';

function endsWith(str, suffix) {
    var ind = str.length - suffix.length;
    return ind >= 0 && str.indexOf(suffix, ind) === ind;
}

function normalizeSlash(str) {
    return str.replace(/[\\/]+/g, '/');
}

function collectTc(baseDir, codes, config) {
    config = config || {build: 1, coverage: 1};
    var files = fs.readdirSync(baseDir);
    files.forEach(function (f) {
        f = normalizeSlash(baseDir + '/' + f);
        if (endsWith(f, mark)) {
            if (!fs.statSync(f).isDirectory()) {
                f = f.substring(root.length);
                codes.push(f);
                if (config.build) {
                    codes.push(f + "?build");
                }
                if (config.coverage) {
                    codes.push(f + "?coverage");
                }
            } else {
                var runners = fs.readdirSync(f);
                runners.forEach(function (r) {
                    r = normalizeSlash(f + '/' + r);
                    r = r.substring(root.length);
                    codes.push(r);
                    if (config.build) {
                        codes.push(r + "?build");
                    }
                    if (config.coverage) {
                        codes.push(r + "?coverage");
                    }
                });
            }
        } else if (fs.statSync(f).isDirectory()) {
            collectTc(f, codes, config);
        }
    });
}

exports.getData = function (cfg) {
    var codes = [];
    collectTc(srcDir, codes, cfg);
    return codes;
};

exports.getJsForWeb = function (cfg) {
    var data = exports.getData(cfg);
    var codes = [];
    data.forEach(function (c) {
        codes.push("tests.push('" + c + "');");
    });
    return ['/**' ,
        'gen by gen-tc.js' ,
        '*/' ,
        'window.tests = (function()' ,
        '{ var tests = [];' ,
        codes.join('\n') ,
        ' return tests;   })();'].join('\n');
};

exports.getJsForPhantom = function (cfg) {
    var data = exports.getData(cfg);
    data.push('/send-to-coveralls');
    var codes = [];
    data.forEach(function (c) {
        codes.push("tests.push('" + c + "');");
    });
    return ['/**' ,
        'gen by gen-tc.js' ,
        '*/' ,
        'module.exports = function()' ,
        '{ var tests = [];' ,
        codes.join('\n') ,
        ' return tests;   };'].join('\n');
};