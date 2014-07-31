/*jshint camelcase:false*/
var path = require('path');
var mime = require('mime');
//noinspection JSUnresolvedVariable
var cwd = process.cwd();
//noinspection JSUnresolvedVariable
var currentDir = __dirname;
var serverConfig = require(currentDir + '/config.js');

function startServer(port) {
    var express = require('express');
    var app = express();

    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, 'views'));
    app.engine('html', require('./xtpl').renderFile);

    app.locals({
        travisJobId: process.env.TRAVIS_JOB_ID
    });

    app.use(function (req, res, next) {
        res.charset = 'utf-8';
        res.set('content-type', mime.lookup(path.extname(req.path) || '.html'));
        next();
    });

    app.use(express.favicon());
    app.use(express.compress());
    //noinspection JSUnresolvedFunction
    app.use(express.cookieParser());
    //noinspection JSUnresolvedFunction
    app.use(express.bodyParser());

    // combo
    app.use('/kissy/', require('./middleware/combo'));

    app.use('/kissy/', require('./middleware/xtpl'));

    app.use('/kissy/src/', require('./middleware/wrap-module'));

    app.use('/kissy/', require('./middleware/instrument'));

    app.use('/kissy/', require('./middleware/tests-runner'));

    app.use('/kissy/', require('./middleware/coverage-runner'));

    // list and process jss
    app.use('/kissy/', require('./middleware/serve'));

    //noinspection JSUnresolvedFunction
    app.use('/kissy/', express['static'](cwd, {
        hidden: true
    }));

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
            }, 1000).unref();
        } else {
            res.send('haha');
        }
    });

    app.get('/exit', function () {
        process.exit(0);
    });

    app.get('/try', function (req, res) {
        res.render('try', {
            x: 1
        });
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

    require('./router/gen')(app);

    require('./router/plato')(app);

    require('./router/sync')(app);

    app.get('/crossdomain.xml', function (req, res) {
        res.set('content-type', 'text/xml');
        res.send('<cross-domain-policy>' +
            '<allow-access-from domain="*"/>' +
            '</cross-domain-policy>');
    });

    require('./router/send-coverage')(app);

    app.get('/kissy/test', function (req, res) {
        res.render('test', {
            tests: require('../common/gen-tc').getData()
        });
    });

    app.listen(port);
}

serverConfig.ports.forEach(function (port) {
    console.log('start server at port: ' + port);
    startServer(port);
});
