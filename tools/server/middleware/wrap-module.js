/**
 * wrap nodejs module style to kissy module style
 * @author yiminghe@gmail.com
 */
var cwd = process.cwd();
var fs = require('fs');
var url = require('url');
var path = require('path');
module.exports = function (req, res, next) {
    if (req.code) {
        next();
        return;
    }
    var pathname = url.parse(req.url).pathname;
    var extname = path.extname(pathname);
    if (extname === '.js') {
        var filePath = path.join(cwd, 'src', pathname).replace(/-coverage/, '');
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, function (err, content) {
            if (content.indexOf('--no-module-wrap--') !== -1 || content.indexOf('KISSY.add(') !== -1) {
                next();
                return;
            }
            if (content.indexOf('require(') !== -1 || content.indexOf('module.exports = ') !== -1) {
                var code = 'KISSY.add(function(S,require,exports,module){\n' + content + '\n});';
                if (pathname.match(/-coverage/)) {
                    req.code = code;
                    next();
                    return;
                }
                res.set('content-type', 'text/javascript');
                res.end(code);
            } else {
                next();
            }
        });
    } else {
        next();
    }
};