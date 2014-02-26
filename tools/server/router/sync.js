var serverConfig = require('../server.json');
var exec = require('child_process').exec;

function sync(dir, callback) {
    exec('cd ' + dir + ' && git pull origin master',
        { maxBuffer: 1024 * 1024 },
        function (error, stdout, stderr) {
            callback(error || stderr || stdout);
        });
}

function syncCode(callback) {
    sync(serverConfig.codeDir, callback);
}

function syncDocs(callback) {
    sync(serverConfig.docsDir, callback);
}

function shouldSyncFn(req) {
    var shouldSync = 1;
    if (req.body && req.body.payload) {
        var payload = JSON.parse(req.body.payload);
        if (payload.ref !== 'refs/heads/master') {
            shouldSync = 0;
        }
    }
    return shouldSync;
}

module.exports = function (app) {
    app.all('/sync', function (req, res) {
        if (shouldSyncFn(req)) {
            syncCode(function (str) {
                res.send(str);
            });
        } else {
            res.end();
        }
    });

    app.all('/sync-docs', function (req, res) {
        if (shouldSyncFn(req)) {
            syncDocs(function (str) {
                res.send(str);
            });
        } else {
            res.end();
        }
    });
};