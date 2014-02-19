var cwd = process.cwd();
var S = require(cwd + '/lib/seed.js');
var fs = require('fs');
var serverConfig = JSON.parse(fs.readFileSync(__dirname + '/../server.json'));
var config = {
    server: serverConfig
};

module.exports=function (req, res, next) {
    var path = req.path;
    if (S.endsWith(path, '.jss')) {
        require(cwd + path)(req, res, config);
        return;
    }
    var cur = cwd + req.path,
        index = cur + '/index.jss',
        indexHtml = cur + '/index.html';

    if (fs.existsSync(cur) && fs.statSync(cur).isDirectory()) {
        if (!S.endsWith(cur, '/')) {
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