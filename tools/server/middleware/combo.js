var cwd = process.cwd();
//noinspection JSUnresolvedVariable
var util = require('../../common/util');
var fs = require('fs');
var mime = require('mime');
var Path = require('path');

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
        var extname = Path.extname(files[0]) || '.html';
        res.set('content-type', mime.lookup(extname));
        util.each(files, function (f) {
            codes.push(fs.readFileSync(path + f));
        });
        res.send(codes.join('\n'));
    } else {
        next();
    }
};
