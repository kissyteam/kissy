/**
 * wrap nodejs module style to kissy module style
 * @author yiminghe@gmail.com
 */
var cwd = process.cwd();
var fs = require('fs');
var url = require('url');
var path = require('path');
var wrapModule = require('../../common/wrap-module');

function getContent(req, pathname, callback) {
    if (req.code) {
        callback(null, req.code);
    } else {
        var filePath = path.join(cwd, 'src', pathname).replace(/-coverage/, '');
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, function (err, content) {
            callback(err, content);
        });
    }
}

module.exports = function (req, res, next) {
    var pathname = url.parse(req.url).pathname;
    var extname = path.extname(pathname);
    if (extname === '.js') {
        getContent(req, pathname, function (err, content) {
            if (err) {
                next(err);
                return;
            }
            if (content.indexOf('--need-module-wrap--') === -1) {
                if (content.indexOf('--no-module-wrap--') !== -1) {
                    next();
                    return;
                }
                if (content.indexOf('require(') === -1 && !content.match(/\bexports\b/)) {
                    next();
                    return;
                }
            }
            try {
                var code = wrapModule.wrapModule(content);
                if (pathname.match(/-coverage/)) {
                    req.code = code;
                    next();
                    return;
                }
                res.end(code);
            } catch (e) {
                console.log('error in: ' + pathname);
                console.error(e);
                next(e);
            }
        });
    } else {
        next();
    }
};