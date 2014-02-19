/**
 * KISSY Dev Server
 * @author yiminghe@gmail.com
 */
/*jshint camelcase:false*/
require('../test/gen-tc');
require('./gen-package');

var path = require('path');
var fs = require('fs');
//noinspection JSUnresolvedVariable
var cwd = process.cwd();
//noinspection JSUnresolvedVariable
var currentDir = __dirname;
var S = require(cwd + '/lib/seed.js');
var request = require('request');
var serverConfig = JSON.parse(fs.readFileSync(currentDir + '/server.json'));

function startServer(port) {
    var express = require('express');
    var app = express();

    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, 'views'));
    app.engine('html', require('./xtpl-engine').renderFile);

    var config = {
        server: serverConfig
    };

    app.use(express.compress());
    //noinspection JSUnresolvedFunction
    app.use(express.cookieParser());
    //noinspection JSUnresolvedFunction
    app.use(express.bodyParser());

    app.get('/', function (req, res) {
        //noinspection JSUnresolvedFunction
        res.redirect('/kissy/');
    });

    app.get(/\/kissy$/, function (req, res) {
        //noinspection JSUnresolvedFunction
        res.redirect('/kissy/');
    });

    require('./router/docs')(app);

    require('./router/coverage-runner')(app);

    require('./router/test-runner')(app);

    // combo
    app.use('/kissy/', function (req, res, next) {
        var query = req.query, k,
            combo = '',
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
            if (nextQ === -1) {
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
                res.setHeader('Content-Type', 'application/x-javascript');
            } else {
                res.setHeader('Content-Type', 'text/css');
            }
            res.send(codes.join('\n'));
        } else {
            next();
        }
    });

    app.use('/kissy/', function (req, res, next) {
        var path = req.path;
        if (S.endsWith(path, '.jss')) {
            require(cwd + path)(req, res, config);
        } else {
            next();
        }
    });

    app.use('/kissy/', function (req, res, next) {
        var cur = cwd + req.path,
            index = cur + '/index.jss',
            indexHtml = cur + '/index.html';

        if (fs.existsSync(cur) && fs.statSync(cur).isDirectory()) {

            if (!S.endsWith(cur, '/')) {
                //noinspection JSUnresolvedFunction
                res.redirect('/kissy' + req.path + '/');
                return;
            }

            if (fs.existsSync(index)) {
                require(index)(req, res);
                return;
            }

            if (fs.existsSync(indexHtml)) {
                res.send(fs.readFileSync(indexHtml, {
                    encoding: 'utf-8'
                }));
                return;
            }

            var files = fs.readdirSync(cur);
            files.forEach(function (f, v) {
                if (fs.statSync(cur + f).isDirectory()) {
                    files[v] += '/';
                }
            });
            res.render('list', {
                cur: req.url,
                files: files
            });
        } else {
            next();
        }
    });

    //noinspection JSUnresolvedFunction
    app.use('/kissy/', express['static'](cwd));

    var codes = require('./../test/tc.js')();

    app.get('/crossdomain.xml', function (req, res) {
        res.set('content-type', 'text/xml');
        res.send('<cross-domain-policy>' +
            '<allow-access-from domain="*"/>' +
            '</cross-domain-policy>');
    });

    app.get('/kissy/test', function (req, res) {
        res.render('test', {
            tests: codes
        });
    });

    function getSourceInfo(f) {
        var source_files = postData.source_files,
            len = source_files.length;
        for (var i = 0; i < len; i++) {
            if (source_files[i].name === f) {
                return source_files[i];
            }
        }
        return undefined;
    }

    function merge(d1, d2) {
        var len = d1.length;
        var dd1, dd2;
        for (var i = 0; i < len; i++) {
            dd1 = d1[i];
            dd2 = d2[i];
            if (typeof  dd2 === 'number' && typeof dd1 === 'number') {
                d1[i] = d1 + d2;
            } else if (typeof  dd2 === 'number') {
                d1[i] = dd2;
            }
        }
    }

    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
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
            'window.callPhantom&&window.callPhantom(\\{' +
            'type: "report",' +
            'failedCount: 0' +
            '});\n' +
            '</script>';
        var str = JSON.stringify(postData);
        if (!service_job_id) {
            //console.log(str);
            res.send(S.substitute(ok, {
                //content: 'var data=' + str + ';console.log(data);',
                time: (Date.now() - start)
            }));
            return;
        }
        var url = 'https://coveralls.io/api/v1/jobs';
        request.post({url: url, form: { json: str}}, function () {
            res.send(S.substitute(ok, {
                //content: 'var data=' + str + ';console.log(data);',
                time: (Date.now() - start)
            }));
        });
    });

    app.post('/save-coverage-report', function (req, res) {
        if (!service_job_id) {
            res.send('');
            return;
        }
        var report = req.param('report');
        var component = req.param('component');
        if (component.indexOf('/') !== -1) {
            // remove last component name
            component = component.replace(/[^/]+$/, '');
        } else {
            component = '';
        }
        var pathParam = req.param('path').slice(1);
        var myPath = cwd + pathParam.slice(pathParam.indexOf('/'));
        var jsonReport = JSON.parse(report);
        var srcPath = path.resolve(myPath, '../../../src/');
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

serverConfig.ports.forEach(function (port) {
    startServer(port);
});

fs.writeFileSync(cwd + '/pid.log', process.pid);
