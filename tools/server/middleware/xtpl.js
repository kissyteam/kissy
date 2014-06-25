var path = require('path');
var kissyRoot = path.join(__dirname, '../../../');
var compileXtplCode = require('xtpl/lib/compile');
var url = require('url');

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/-xtpl(-coverage)?\.js/);
    if (!m) {
        next();
        return;
    }
    var pathname = url.parse(req.url).pathname;
    var filePath = path.join(kissyRoot, pathname).replace(/-coverage/, '').replace(/\.js$/, '.html');
    req.code = compileXtplCode(filePath);
    next();
};