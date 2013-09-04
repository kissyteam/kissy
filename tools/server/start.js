/**
 * KISSY Dev Server
 * @author yiminghe@gmail.com
 */

require('../test/gen-tc');
require('./gen-package');

// var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var cwd = process.cwd();
var currentDir = __dirname;
var S = global.KISSY = global.S = require(cwd + '/build/kissy-nodejs.js');
var request = require('request');

S.use('xtemplate/nodejs', function (S, XTemplateNodeJs) {
    function startServer(port) {
        var express = require('express');
        var app = express();
        S.config('packages', {
            'xtemplates': {
                base: currentDir
            }
        });
        var tplCache = {};

        var testTpl = XTemplateNodeJs.loadFromModuleName('xtemplates/test');

        var listTpl = XTemplateNodeJs.loadFromModuleName('xtemplates/list');

        function getXTemplate(name) {
            if (tplCache[name]) {
                return tplCache[name];
            }
            return tplCache[name] = XTemplateNodeJs.loadFromModuleName('xtemplates/' + name);
        }

        var utils = {
            render: function (tpl, data) {
                return getXTemplate(tpl).render(data);
            }
        };

        // app.use(express.compress());
        app.use(express.cookieParser());
        app.use(express.bodyParser());

        // combo
        app.use('/kissy/', function (req, res, next) {
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

        app.use('/kissy/', function (req, res, next) {
            var path = req.path;
            if (S.endsWith(path, ".jss")) {
                require(cwd + path)(req, res, utils);
            } else {
                next();
            }
        });

        //app.use('/kissy', express.directory(cwd))
        app.use('/kissy/', express.static(cwd));

        app.use('/kissy/', function (req, res, next) {
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

        var codes = require('./../test/tc.js')();

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

        function getSourceInfo(f) {
            var source_files = postData.source_files,
                len = source_files.length;
            for (var i = 0; i < len; i++) {
                if (source_files[i].name == f) {
                    return source_files[i];
                }
            }
        }

        function merge(d1, d2) {
            var len = d1.length;
            var dd1, dd2;
            for (var i = 0; i < len; i++) {
                dd1 = d1[i];
                dd2 = d2[i];
                if (typeof  dd2 == 'number' && typeof dd1 == 'number') {
                    d1[i] = d1 + d2;
                } else if (typeof  dd2 == 'number') {
                    d1[i] = dd2;
                }
            }
        }

        var service_job_id = process.env.TRAVIS_JOB_ID;
        var postData = {
            service_name: 'travis-ci',
            service_job_id: service_job_id,
            source_files: []
        };

        app.get('/send-to-coveralls', function (req, res) {
            var start = Date.now();
            var ok = '<script>{' +
                'content' +
                '}\n' +
                'console.log("0 specs, 0 failures in {time}ms.")</script>';
            var str = JSON.stringify(postData);
            if (!service_job_id) {
                console.log(str);
                res.send(S.substitute(ok, {
                    content: 'var data=' + str + ';console.log(data);',
                    time: (Date.now() - start)
                }));
                return;
            }
            var url = 'https://coveralls.io/api/v1/jobs';
            request.post({url: url, form: { json: str}}, function () {
                res.send(S.substitute(ok, {
                    time: (Date.now() - start)
                }));
            });
        });

        app.post('/save-coverage-report', function (req, res) {
            var report = req.param('report');
            var component = req.param('component');
            if (component.indexOf('/') != -1) {
                // remove last component name
                component = component.replace(/[^/]+$/, '');
            } else {
                component = ''
            }
            var path = req.param('path');
            var myPath = cwd + '/' + path.slice(path.indexOf('/') + 1);
            var jsonReport = JSON.parse(report);
            var srcPath = path.resolve(myPath, '../../../src/') + '/';
            var source_files = postData.source_files;
            for (var f in jsonReport) {
                var detail = jsonReport[f];
                // coveralls.io does not need first data
                detail.lineData.shift();
                var lineData = detail.lineData;
                // remove leading slash
                var name = component + f.slice(1);
                var info = getSourceInfo(name);
                if (info) {
                    merge(info.coverage, lineData);
                } else {
                    var source = fs.readFileSync(srcPath + f, 'utf8');
                    source_files.push({
                        name: name,
                        source: source,
                        coverage: detail.lineData
                    });
                }
            }
            res.send('');
        });

        app.listen(port);
    }

    startServer(9999);
    startServer(8888);
});
