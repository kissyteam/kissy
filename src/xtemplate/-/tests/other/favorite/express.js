var path = require('path');
var express = require('express');
var app = express();
var data = require('./data.json');
app.set('view engine', 'xtpl');
var viewDir = path.join(__dirname, 'xtpl').replace(/\\/g, '/');
app.set('views', viewDir);
var xtpl = require('xtpl');
//xtpl = require('xtpl');
require('./command').addMyCommand(xtpl.XTemplate);
app.engine('xtpl', xtpl.__express);

app.get('/', function (req, res) {
    var start = +new Date();
    res.render('item-collect', data, function (err, content) {
        console.log(new Date().valueOf() - start);
        res.send(content);
    });
});

app.listen(8001);