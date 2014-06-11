var path = require('path');
var kissyRoot = path.join(__dirname, '../../../');
var xtemplate = require(kissyRoot + '/bin/xtemplate');
var url = require('url');

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/-xtpl(-coverage)?\.js/);
    if (!m) {
        next();
        return;
    }
    var pathname = url.parse(req.url).pathname;
    var filePath = path.join(kissyRoot, pathname).replace(/-coverage/, '').replace(/\.js$/, '.html');
    var name = path.basename(filePath, '.html');
    req.code = xtemplate.getCompileModule(filePath, name);
    next();
};