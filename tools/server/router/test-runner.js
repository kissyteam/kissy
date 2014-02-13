var prefix = '/kissy/src/';
var fs = require('fs');
var cwd = process.cwd();
var Path = require('path');
var S = require(cwd + '/build/kissy-nodejs.js');
function removeQ(str) {
    return str.replace(/\?.+$/, '');
}
module.exports = function (app) {
    app.get(/(.+)\/tests\/runner\/(\?.+)?$/, function (req, res, next) {
        var path = req.params[0];
        var componentName = path.slice(prefix.length).replace(/sub-modules\//, '');
        var runnerFolder = Path.normalize(cwd + '/../' +  path + '/tests/runner/');
        if (!fs.existsSync(Path.normalize(runnerFolder))) {
            next();
            return;
        }
        var coveragePath = Path.normalize(runnerFolder + 'test.jss');

        if (fs.existsSync(coveragePath)) {
            res.redirect(removeQ(req.url) + 'test.jss?' + S.param(req.query));
            return;
        }

        res.render('runner', {
            component: componentName,
            query: req.query
        });
    });
};