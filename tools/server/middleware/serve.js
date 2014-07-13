var cwd = process.cwd();
var util = require('../../common/util');
var fs = require('fs');
var serverConfig = require(__dirname + '/../config.js');
var config = {
    server: serverConfig
};

module.exports=function (req, res, next) {
    var path = req.path;
    if (util.endsWith(path, '.jss')) {
        require(cwd + path)(req, res, config);
        return;
    }
    var cur = cwd + req.path,
        index = cur + '/index.jss',
        indexHtml = cur + '/index.html';

    if (fs.existsSync(cur) && fs.statSync(cur).isDirectory()) {
        if (!util.endsWith(cur, '/')) {
            //noinspection JSUnresolvedFunction
            res.redirect('/kissy' + req.path + '/');
            return;
        }

        if (fs.existsSync(index)) {
            require(index)(req, res);
            return;
        }

        if (fs.existsSync(indexHtml)) {
            res.send(fs.readFileSync(indexHtml, {
                encoding: 'utf-8'
            }));
            return;
        }

        var files = fs.readdirSync(cur);

        files.forEach(function (f, v) {
            if (fs.statSync(cur + f).isDirectory()) {
                files[v] += '/';
            }
        });

        res.render('list', {
            cur: req.url,
            files: files
        });
    } else {
        next();
    }
};