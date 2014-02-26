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

module.exports = function (app) {
    app.get('/sync', function (req, res) {
        syncCode(function (str) {
            res.send(str);
        });
    });

    app.get('/sync-docs', function (req, res) {
        syncDocs(function (str) {
            res.send(str);
        });
    });
};