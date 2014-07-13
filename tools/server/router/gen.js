var genDev = require('../util/gen-dev');
var genTc = require('../../common/gen-tc');
var genTotoro = require('../util/gen-totoro');

module.exports = function (app) {
    app.get('/gen/dev.js', function (req, res) {
        res.type('js');
        res.send(genDev());
    });

    app.get('/gen/tests.js', function (req, res) {
        res.type('js');
        res.send(genTc.getJsForWeb({
            build:1
        }));
    });

    app.get('/kissy/totoro.json', function (req, res) {
        res.type('json');
        res.send(genTotoro());
    });
};