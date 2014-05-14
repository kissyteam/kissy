/**
 * @fileOverview jasmine runner in nodejs for KISSY.
 * refer: https://github.com/mhevery/jasmine-node/
 * @author yiminghe@gmail.com
 */

// global
var sys = require('sys');

var fs = require('fs');

var jasmineExports = require('../jasmine/jasmine');

var jasmineNode = require('../jasmine/node/reporter').jasmineNode;

for(var k in jasmineExports){
    global[k] = jasmineExports[k];
}

var jasmineEnv = jasmineExports.jasmine.getEnv();

// ------------ configs start

var isVerbose = false;
var showColors = true;

var junitReport = {
    report: true,
    savePath: './reports/',
    useDotNotation: true,
    consolidate: true
};

function onComplete(runner) {
    var description = runner.queue.blocks[0].description;
    console.log(description + ' ↑ \n');
    console.log(new Array(20).join('-'));
    console.log('\n');
    if (runner.results().failedCount !== 0) {
        process.exit(1);
    }
}

if (junitReport && junitReport.report) {
    if (!fs.existsSync(junitReport.savePath)) {
        console.log('creating junit xml report save path: ' + junitReport.savePath);
        fs.mkdirSync(junitReport.savePath, '0755');
    }
    jasmineEnv.addReporter(new jasmineNode.JUnitXmlReporter(junitReport.savePath,
        junitReport.consolidate,
        junitReport.useDotNotation));
}

if (isVerbose) {
    jasmineEnv.addReporter(new jasmineNode.TerminalVerboseReporter({
        print: sys.print,
        color: showColors,
        onComplete: onComplete
    }));
} else {
    jasmineEnv.addReporter(new jasmineNode.TerminalReporter({
        print: sys.print,
        color: showColors,
        onComplete: onComplete
    }));
}

// ------------ configs end

require('../../tests/');
jasmineEnv.execute();
