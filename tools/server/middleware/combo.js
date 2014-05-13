var cwd = process.cwd();
//noinspection JSUnresolvedVariable
var util = require(cwd + '/lib/util');
var fs = require('fs');

module.exports = function (req, res, next) {
    var query = req.query, k,
        combo = '',
        path = cwd + req.path;

    for (k in query) {
        if (util.startsWith(k, '?')) {
            combo = k;
            break;
        }
    }

    var codes = [];

    if (util.startsWith(combo, '?')) {
        var nextQ = combo.slice(1).indexOf('?');
        if (nextQ === -1) {
            nextQ = combo.length;
        } else {
            nextQ++;
        }
        combo = combo.slice(1, nextQ);
        var files = combo.split(',');
        var f = files[0];
        util.each(files, function (f) {
            codes.push(fs.readFileSync(path + f));
        });
        if (util.endsWith(f, '.js')) {
            res.setHeader('Content-Type', 'application/x-javascript');
        } else {
            res.setHeader('Content-Type', 'text/css');
        }
        res.send(codes.join('\n'));
    } else {
        next();
    }
};
