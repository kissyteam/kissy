/**
 * Simple KISSY Test Server
 * @author yiminghe@gmail.com
 */

var path = require('path');
var fs = require('fs');
var cwd = process.cwd();
var srcDir = path.resolve(cwd, 'src');
var currentDir = __dirname;
var S = global.KISSY = global.S = require(cwd + '/build/kissy-nodejs.js');


S.use('xtemplate', function (S, XTemplate) {
    function startServer(port) {

        var express = require('express');
        var app = express();

        function collectTc(baseDir, codes) {
            var files = fs.readdirSync(baseDir);
            var ts = "tests/runner";
            S.each(files, function (f) {
                f = baseDir + '/' + f;
                if (fs.statSync(f).isDirectory()) {
                    if (S.endsWith(f, ts)) {
                        var runners = fs.readdirSync(f);
                        S.each(runners, function (r) {
                            r = (f + '/' + r).replace(cwd, '').replace(/\\/g, '/');
                            codes.push("tests.push('" + r + "');\n");
                        });
                    } else {
                        collectTc(f, codes);
                    }
                }
            });
        }


        var testTpl = new XTemplate(fs.readFileSync(currentDir + '/test-xtpl.html', 'utf-8'));
        var testCode = fs.readFileSync(currentDir + '/test.js');
        var listTpl = new XTemplate(fs.readFileSync(currentDir + '/list-xtpl.html', 'utf-8'));

        app.use(express.compress());
        app.use(express.bodyParser());

        // combo
        app.use(function (req, res, next) {
            var query = req.query, k,
                path = cwd + req.path;

            for (k in query) {

            }

            k = k || "";

            var codes = [];

            if (S.startsWith(k, '?')) {
                var nextQ = k.slice(1).indexOf('?');
                if (nextQ == -1) {
                    nextQ = k.length;
                } else {
                    nextQ++;
                }
                k = k.slice(1, nextQ);
                var files = k.split(',');
                var f = files[0];
                S.each(files, function (f) {
                    codes.push(fs.readFileSync(path + f));
                });
                if (S.endsWith(f, '.js')) {
                    res.setHeader("Content-Type", "application/x-javascript");
                } else {
                    res.setHeader("Content-Type", "text/css");
                }
                res.send(codes.join('\n'));
            } else {
                next();
            }

        });

        app.use(function (req, res, next) {
            var path = req.path;
            if (S.endsWith(path, ".jss")) {
                require(cwd + path)(req, res);
            } else {
                next();
            }
        });

        //app.use(express.directory(cwd))
        app.use(express.static(cwd));

        app.use(function (req, res, next) {

            var cur = cwd + req.path,
                index = cur + '/index.jss';

            if (fs.existsSync(cur) && fs.statSync(cur).isDirectory()) {
                if (fs.existsSync(index)) {
                    require(index)(req, res);
                    return;
                }

                var files = fs.readdirSync(cur);
                res.send(listTpl.render({
                    cur: req.url,
                    files: files
                }));
            } else {
                next();
            }

        });

        app.get('/test', function (req, res) {
            var codes = [];
            collectTc(srcDir, codes);
            res.send(testTpl.render({
                code: testCode,
                tests: codes
            }));
        });

        app.listen(port);


    }

    startServer(9999);
    startServer(8888);

});