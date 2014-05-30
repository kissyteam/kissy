var cwd = process.cwd();
var fs = require('fs');
var Path = require('path');
var jscover = require('node-jscover');
var url = require('url');

function getModuleName(url) {
    var parts = [];
    var urls = url.split(/[/\\]+/);
    for (var i = urls.length - 1; i >= 0; i--) {
        if (urls[i] === 'src') {
            break;
        }
        parts.unshift(urls[i]);
    }
    url = parts.join('/');
    return url.replace(/-coverage.+/, '');
}

function instrument(code, moduleName, res, next) {
    try {
        res.setHeader('Content-Type', 'application/x-javascript');
        res.end(jscover.instrument(code, moduleName + '.js', {
            excludeHeader: true
        }));
    } catch (e) {
        next(e);
    }
}

module.exports = function (req, res, next) {
    var m = req.url.match(/-coverage\.js/);
    if (!m) {
        next();
        return;
    }
    var pathname = url.parse(req.url).pathname;
    var moduleName = getModuleName(pathname);
    if (req.xtpl) {
        instrument(req.xtpl, moduleName, res, next);
    } else {
        var codeFile = Path.join(cwd, pathname);
        codeFile = codeFile.replace(/-coverage/, '');
        fs.readFile(codeFile, function (err, code) {
            if (err) {
                next(err);
            } else {
                instrument(code, moduleName, res, next);
            }
        });
    }
};