/**
 * KISSY Dev Server
 * @author yiminghe@gmail.com
 */

require('../test/gen-runner');
require('../test/gen-tc');
require('./gen-package');

var util = require('util');
var fs = require('fs');
var cwd = process.cwd();
var path = require('path');
var recluster = require('recluster');
var debug = require('debug')('kissy');

fs.writeFileSync(cwd + '/pid.log', process.pid);

process.on('exit', function () {
    debug('exit');
    fs.unlinkSync(cwd + '/pid.log');
});

process.on('SIGTERM', function (//signal, code
    ) {
    debug('SIGTERM');
    process.exit(0);
});

process.on('SIGINT', function () {
    debug('SIGINT');
    process.emit('SIGTERM', 'SIGINT', 2);
});

var cluster = recluster(path.join(__dirname, 'app.js'));
cluster.run();

process.on('SIGUSR2', function () {
    console.log('Got SIGUSR2, reloading cluster...');
    cluster.reload();
});

setTimeout(function () {
    cluster.workers.forEach(function (i) {
        debug(util.format(' master[%d]\twork_id[%s]\tworker_pid[%s]\tworker status[%s]',
            process.pid, i.id, i.process.pid, i.state));
    });
}, 1000);

console.log('Server started , spawned cluster, kill -s SIGUSR2', process.pid, 'to reload');