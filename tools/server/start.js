/**
 * KISSY Dev Server
 * @author yiminghe@gmail.com
 */

var util = require('util');
var fs = require('fs');
var cwd = process.cwd();
var path = require('path');
var recluster = require('recluster');

fs.writeFileSync(cwd + '/pid.log', process.pid);

process.on('exit', function () {
    fs.unlinkSync(cwd + '/pid.log');
});

process.on('SIGTERM', function (//signal, code
    ) {
    process.exit(0);
});

process.on('SIGINT', function () {
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
        console.log(util.format(' master[%d]\twork_id[%s]\tworker_pid[%s]\tworker status[%s]',
            process.pid, i.id, i.process.pid, i.state));
    });
}, 1000);

console.log('Server started , spawned cluster, kill -s SIGUSR2', process.pid, 'to reload');