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
        util.each(files, function (f) {
            codes.push(fs.readFileSync(path + f));
        });
        res.send(codes.join('\n'));
    } else {
        next();
    }
};
