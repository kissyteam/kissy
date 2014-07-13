var path = require('path');
var express = require('express');
var app = express();
var data = require('./data.json');
app.set('view engine', 'html');
var viewDir = path.join(__dirname, 'xtpl').replace(/\\/g, '/');
app.set('views', viewDir);
var xtpl = require('xtpl');
require('./command').addMyCommand(xtpl.XTemplate);
app.engine('html', xtpl.__express);
app.get('/', function (req, res) {
    var start = +new Date();

//        xtpl.load(path.join(viewDir, 'screen/detail.html').replace(/\\/g, '/'), {
//            cacheFile: process.env.NODE_ENV === 'production'
//        }, function (error, engine) {
//            engine.render(data, function (err, content) {
//                console.log(new Date().valueOf() - start);
//                res.send(content);
//            });
//        });

    res.render('screen/detail', data, function (err, content) {
        console.log(new Date().valueOf() - start);
        res.send(content);
    });
});
app.listen(8001);