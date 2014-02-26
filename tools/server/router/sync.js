var serverConfig = require('../server.json');
var exec = require('child_process').exec;

function sync(dir, callback, errorCallback) {
    exec('cd ' + dir + ' && git pull origin master',
        { maxBuffer: 1024 * 1024 },
        function (error, stdout, stderr) {
            if (error || stderr) {
                errorCallback(error || stderr);
            } else {
                callback(stdout);
            }
        });
}

function syncCode(callback, errorCallback) {
    sync(serverConfig.codeDir, callback, errorCallback);
}

function syncDocs(callback, errorCallback) {
    sync(serverConfig.docsDir, callback, errorCallback);
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
            }, function (str) {
                res.status(500);
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
            }, function (str) {
                res.status(500);
                res.send(str);
            });
        } else {
            res.end();
        }
    });
};