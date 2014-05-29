var cwd = process.cwd();
var fs = require('fs');
var Path = require('path');
var jscover = require('node-jscover');
var url = require('url');

function getModuleName(url) {
    var urls = url.split(/[/\\]/);
    for (var i = urls.length - 1; i >= 0; i--) {
        if (urls[i] === 'src') {
            break;
        }
    }
    if (i !== 0) {
        urls.splice(i - 1, 2);
    }
    url = urls.join('/');
    return url.replace(/-coverage.+/, '').replace(/\/(src|sub-modules)/g, '').replace(/^\//, '');
}

module.exports = function (req, res, next) {
    var m = req.url.match(/-coverage\.js/);
    if (!m) {
        next();
        return;
    }
    var pathname = url.parse(req.url).pathname;
    var codeFile = Path.join(cwd, pathname);
    codeFile = codeFile.replace(/-coverage/, '');
    fs.readFile(codeFile, function (err, code) {
        if (err) {
            next(err);
        } else {
            try {
                res.end(jscover.instrument(code, getModuleName(pathname)+'.js', {
                    excludeHeader: true
                }));
            } catch (e) {
                next(e);
            }
        }
    });
};