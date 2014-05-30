var path = require('path');
var kissyRoot = path.join(__dirname, '../../../');
var fs = require('fs');
var url = require('url');

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/(.+)\/tests\/coverage(\?.+)?$/);
    if (!m) {
        next();
        return;
    }
    var pathname = url.parse(req.url).pathname;
    var filePath = path.join(kissyRoot, pathname);
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