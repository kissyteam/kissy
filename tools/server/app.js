/*jshint camelcase:false*/

var path = require('path');
var fs = require('fs');
//noinspection JSUnresolvedVariable
var cwd = process.cwd();
//noinspection JSUnresolvedVariable
var currentDir = __dirname;
var S = require(cwd + '/lib/seed.js');

var serverConfig = JSON.parse(fs.readFileSync(currentDir + '/server.json'));
var debug = require('debug')('kissy');

function startServer(port) {
    var express = require('express');
    var app = express();

    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, 'views'));
    app.engine('html', require('./xtpl-engine').renderFile);

    var config = {
        server: serverConfig
    };

    var domain = require('domain');

    app.use(function (req, res, next) {
        var d = domain.create();

        //监听domain的错误事件
        d.on('error', function (err) {
            debug(err);
            res.render('err', {
                err: err && err.stack
            });
            d.dispose();
        });

        d.add(req);
        d.add(res);
        d.run(next);
    });

    app.use(express.favicon());
    app.use(express.compress());
    //noinspection JSUnresolvedFunction
    app.use(express.cookieParser());
    //noinspection JSUnresolvedFunction
    app.use(express.bodyParser());

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

    app.use(app.router);

    app.use(express.errorHandler());

    app.get('/throw-i', function (req, res) {
        if (Math.random() > 0.5) {
            throw new Error('haha i');
        } else {
            res.send('haha');
        }
    });

    app.get('/throw', function (req, res) {
        if (Math.random() > 0.5) {
            setTimeout(function () {
                throw new Error('haha');
            }, 1000);
        } else {
            res.send('haha');
        }

    });

    app.get('/exit', function () {
        process.exit(0);
    });

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

    require('./router/send-coverage')(app);

    app.listen(port);
}

serverConfig.ports.forEach(function (port) {
    startServer(port);
});