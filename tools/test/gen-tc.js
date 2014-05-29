/**
 * gen tc.js to share tests between phantomjs and nodejs
 * @author yiminghe@gmail.com
 */

/*jshint quotmark:false*/
var path = require('path');
var fs = require('fs');
var walk = require('walk');
var root = path.join(__dirname, '../../..');
var kissyDir = path.join(root, 'kissy');
var util = require(path.join(kissyDir, 'lib/util'));
var srcDir = path.join(kissyDir, 'src/');
var mark = '/tests/runner';

function normalizeSlash(str) {
    return str.replace(/[\\/]+/g, '/');
}

function collectTc(baseDir, callback) {
    var codes = [];
    var walker = walk.walk(baseDir);
    walker.on('file', function (d, stats, next) {
        d = normalizeSlash(d);
        var file = normalizeSlash(path.join(d, stats.name));
        var r;
        if (util.endsWith(d, mark) || util.endsWith(file, mark)) {
            r = file.substring(root.length);
        }
        if (r) {
            codes.push("tests.push('" + r + "');");
            codes.push("tests.push('" + r + "?build');");
            codes.push("tests.push('" + r + "?coverage');");
        }
        next();
    }).on('end', function (err) {
        callback(err, codes);
    });
}

(function () {
    collectTc(srcDir, function (err, codes) {
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
    });
})();
