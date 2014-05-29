var prefix = '/kissy/src/';
var path = require('path');
var kissyRoot = path.join(__dirname, '../../../');
var fs = require('fs');

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/(.+)\/tests\/runner(\?.+)?$/);
    if (!m) {
        next();
        return;
    }
    var componentName = m[1].slice(prefix.length).replace(/sub-modules\//g, '');
    res.render('runner', {
        component: componentName,
        query: req.query
    });
};

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/(.+)\/tests\/coverage(\?.+)?$/);
    if (!m) {
        next();
        return;
    }
    var filePath = path.join(kissyRoot, req.url);
    var runner = path.resolve(filePath, '../runner');
    var jss;
    if (fs.statSync(runner).isFile()) {
        jss = 'runner';
    } else {
        jss = 'runner/test.jss';
    }
    res.render('coverage', {
        jss: jss
    });
};