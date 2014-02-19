var prefix = '/kissy/src/';
var fs = require('fs');
var cwd = process.cwd();
var Path = require('path');
var S = require(cwd + '/lib/seed.js');
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

        var runners = fs.readdirSync(runnerFolder);

        if (runners.length) {
            next();
            return;
        }

        res.render('runner', {
            component: componentName,
            query: req.query
        });
    });
};