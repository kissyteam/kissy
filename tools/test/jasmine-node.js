/**
 * @fileOverview jasmine runner in nodejs for KISSY.
 * refer: https://github.com/mhevery/jasmine-node/
 * @author yiminghe@gmail.com
 */

// global
var sys = require('sys');
var jasmineExports = require('../jasmine/jasmine');
var jasmineNode = require('../jasmine/node/reporter').jasmineNode;

for (var k in jasmineExports) {
    global[k] = jasmineExports[k];
}

var jasmineEnv = jasmineExports.jasmine.getEnv();

// ------------ configs start
var showColors = true;

function onComplete(runner) {
    if (runner.queue.blocks.length) {
        var description = runner.queue.blocks[0].description;
        console.log(description + ' ↑ \n');
        console.log(new Array(20).join('-'));
        console.log('\n');
    }
    if (runner.results().failedCount !== 0) {
        process.exit(1);
    }
}

jasmineEnv.addReporter(new jasmineNode.TerminalVerboseReporter({
    print: sys.print,
    color: showColors,
    onComplete: onComplete
}));

// ------------ configs end
jasmineEnv.execute();