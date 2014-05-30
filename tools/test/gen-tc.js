/**
 * gen tc.js to share tests between phantomjs and nodejs
 * @author yiminghe@gmail.com
 */

/*jshint quotmark:false*/
var path = require('path');
var fs = require('fs');
var root = path.join(__dirname, '../../..');
var kissyDir = path.join(root, 'kissy');
var util = require(path.join(kissyDir, 'lib/util'));
var srcDir = path.join(kissyDir, 'src/');
var mark = '/tests/runner';

function normalizeSlash(str) {
    return str.replace(/[\\/]+/g, '/');
}

function collectTc(baseDir, codes) {
    var files = fs.readdirSync(baseDir);
    files.forEach(function (f) {
        f = normalizeSlash(baseDir + '/' + f);
        if (util.endsWith(f, mark)) {
            if (!fs.statSync(f).isDirectory()) {
                f = f.substring(root.length);
                codes.push("tests.push('" + f + "');");
                codes.push("tests.push('" + f + "?build');");
                codes.push("tests.push('" + f + "?coverage');");
            } else {
                var runners = fs.readdirSync(f);
                runners.forEach(function (r) {
                    r = normalizeSlash(f + '/' + r);
                    r = r.substring(root.length);
                    codes.push("tests.push('" + r + "');");
                    codes.push("tests.push('" + r + "?build');");
                    codes.push("tests.push('" + r + "?coverage');");
                });
            }
        } else if (fs.statSync(f).isDirectory()) {
            collectTc(f, codes);
        }
    });
}

var codes = [];
collectTc(srcDir, codes);
var finalCode = ['/**' ,
    'gen by gen-tc.js' ,
    '*/' ,
    'module.exports = function()' ,
    '{ var tests = [];' ,
    codes.join('\n') ,
        "tests.push('" + '/send-to-coveralls' + "');",
    ' return tests;   };'].join('\n');
fs.writeFileSync(path.join(__dirname, 'tc.js'), finalCode, 'utf-8');
require('./gen-totoro');
console.log('ok with gen-tc to tc.js!');

