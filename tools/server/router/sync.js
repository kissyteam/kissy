var serverConfig = require('../server.json');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

function sync(dir, callback, errorCallback) {
    exec('cd ' + dir + ' && git reset --hard && git pull origin && git merge origin/master',
        { maxBuffer: 1024 * 1024 },
        function (error, stdout, stderr) {
            if (error) {
                errorCallback(error);
            } else {
                callback(stdout || stderr);
            }
        });
}

function updateBranch(branchDir, branch, callback, errorCallback) {
    var cmd;
    cmd = 'cd ' + branchDir + ' && git reset --hard && git pull origin ' + branch;
    //console.log('exec ' + cmd);
    exec(cmd, { maxBuffer: 1024 * 1024 },
        function (error, stdout, stderr) {
            if (error) {
                errorCallback(error);
            } else {
                callback(stdout || stderr);
            }
        });
}

function syncCode(callback, errorCallback) {
    sync(serverConfig.codeDir, callback, errorCallback);
}

function syncDocs(callback, errorCallback) {
    sync(serverConfig.docsDir, callback, errorCallback);
}

function syncDocsBranch(branch, callback, errorCallback) {
    var docsDir = serverConfig.docsDir;
    var newDocsDir = serverConfig.newDocsDir;
    var newDocsBranchDir = path.join(newDocsDir, branch + '/build');
    var docsBranchDir = path.join(docsDir, branch);
    if (!fs.existsSync(docsBranchDir)) {
        fs.symlinkSync(newDocsBranchDir, docsBranchDir, 'dir');
    }
    if (!fs.existsSync(newDocsBranchDir)) {
        var cmd = 'git clone https://github.com/kissyteam/docs.kissyui.com -b ' +
            branch + ' ' + newDocsBranchDir;
        //console.log('exec ' + cmd);
        exec(cmd, { maxBuffer: 1024 * 1024 },
            function (error) {
                if (error) {
                    errorCallback('clone branch error: ' + error);
                } else {
                    updateBranch(newDocsBranchDir, branch, callback, errorCallback);
                }
            });
    } else {
        updateBranch(newDocsBranchDir, branch, callback, errorCallback);
    }
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

function getSyncBranch(req) {
    var branch = '';
    if (req.body && req.body.payload) {
        var payload = JSON.parse(req.body.payload);
        branch = payload.ref.match(/^refs\/heads\/(\d+\.\d+)$/);
        if (branch) {
            branch = branch[1];
        }
    }
    return branch;
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

    app.all('/sync-new-docs', function (req, res) {
        var branch = getSyncBranch(req);
        if (branch) {
            syncDocsBranch(branch, function (str) {
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