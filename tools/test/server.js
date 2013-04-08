/**
 * Simple KISSY Test Server
 * @author yiminghe@gmail.com
 */

var path = require('path');
var fs = require('fs');
fs.exists = fs.exists || path.exists;
fs.existsSync = fs.existsSync || path.existsSync;
var cwd = process.cwd();
var currentDir = __dirname;
var S = global.KISSY = global.S = require(cwd + '/build/kissy-nodejs.js');

S.use('xtemplate', function (S, XTemplate) {
    function startServer(port) {

        var express = require('express');
        var app = express();

        var testTpl = new XTemplate(fs.readFileSync(currentDir + '/test-xtpl.html', 'utf-8'));
        var listTpl = new XTemplate(fs.readFileSync(currentDir + '/list-xtpl.html', 'utf-8'));

        // app.use(express.compress());
        app.use(express.cookieParser());
        app.use(express.bodyParser());

        // combo
        app.use('/kissy', function (req, res, next) {

            var query = req.query, k,
                combo = "",
                path = cwd + req.path;

            for (k in query) {
                if (S.startsWith(k, '?')) {
                    combo = k;
                    break;
                }
            }

            var codes = [];

            if (S.startsWith(combo, '?')) {
                var nextQ = combo.slice(1).indexOf('?');
                if (nextQ == -1) {
                    nextQ = combo.length;
                } else {
                    nextQ++;
                }
                combo = combo.slice(1, nextQ);
                var files = combo.split(',');
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

        app.use('/kissy', function (req, res, next) {
            var path = req.path;
            if (S.endsWith(path, ".jss")) {
                require(cwd + path)(req, res);
            } else {
                next();
            }
        });

        //app.use('/kissy', express.directory(cwd))
        app.use('/kissy', express.static(cwd));

        app.use('/kissy', function (req, res, next) {

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

        var codes = require('./tc.js')();

        app.get('/crossdomain.xml', function (req, res) {
            res.set('content-type', 'text/xml');
            res.send('<cross-domain-policy>' +
                '<allow-access-from domain="*"/>' +
                '</cross-domain-policy>');
        });

        app.get('/kissy/test', function (req, res) {
            res.send(testTpl.render({
                tests: codes
            }));
        });

        app.listen(port);


    }

    startServer(9999);
    startServer(8888);

});