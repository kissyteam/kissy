/**
 * gen tc.js to share tests between phantomjs and nodejs
 * @author yiminghe@gmail.com
 */
var path = require('path');
var fs = require('fs');
var cwd = process.cwd();
var srcDir = path.resolve(cwd, 'src');
var S = global.KISSY = global.S = require(cwd + '/build/kissy-nodejs.js');

function collectTc(baseDir, codes) {
    var files = fs.readdirSync(baseDir);
    var ts = "/tests/runner";
    S.each(files, function (f) {
        f = baseDir + '/' + f;
        if (fs.statSync(f).isDirectory()) {
            if (S.endsWith(f, ts)) {
                var runners = fs.readdirSync(f);
                var coverDir = path.resolve(f, '../../coverage/runner');
                var cover = 0;
                // allow coverage
                if (fs.existsSync(coverDir)) {
                    cover = 1;
                }
                S.each(runners, function (r) {
                    r = '/kissy' + (f + '/' + r).replace(cwd, '').replace(/\\/g, '/');
                    codes.push("tests.push('" + r + "');\n");
                    codes.push("tests.push('" + r + "?build');\n");
                    if (cover) {
                        codes.push("tests.push('" + r + "?coverage');\n");
                    }
                });
            } else {
                collectTc(f, codes);
            }
        }
    });
}

var codes = [];
collectTc(srcDir, codes);
codes.push("tests.push('" +'/send-to-coveralls' + "');\n");
var finalCode = '/**\n' +
    'gen by gen-tc.js\n' +
    '*/\n' +
    'module.exports=function()' +
    '{ var tests=[];\n' + codes.join('\n') + '\n return tests; \n  };';

fs.writeFileSync('./tools/test/tc.js', finalCode, 'utf-8');

console.log('ok with gen-tc to tc.js!');