/**
 * @fileOverview jasmine runner in nodejs for KISSY.
 * refer: https://github.com/mhevery/jasmine-node/
 * @author yiminghe@gmail.com
 */

// global
var S = global.KISSY = require('../../' + 'build/kissy-nodejs.js');

var fs = require('fs');

var jasmineExports = require('../jasmine/jasmine');

var jasmineNode = require('../jasmine/node/reporter').jasmineNode;

var jasmine = jasmineExports.jasmine;


S.each(jasmineExports, function (v, k) {
    global[k] = v;
});

var jasmineEnv = jasmine.getEnv();

// ------------ configs start

var isVerbose = false;
var showColors = true;

var junitReport = {
    report: true,
    savePath: "./reports/",
    useDotNotation: true,
    consolidate: true
};

var cwd = process.cwd();
console.log('cwd: ' + cwd);

S.config('packages', {
    src: {
        base: cwd
    }
});

var mods = [
    'src/xtemplate/tests/specs/',
    'src/kison/tests/specs/',
    'src/json/tests/specs/',
    'src/base/tests/specs/',
    'src/html-parser/tests/specs/',
    'src/event/sub-modules/custom/tests/specs/'
];

console.log('test mods: ' + mods);

function onComplete(runner) {
    var description = runner.queue.blocks[0].description;
    console.log(description + ' ↑ \n');
    console.log(new Array(20).join('-'));
    console.log('\n');
    if (runner.results().failedCount == 0) {
        exitCode = 0;
    } else {
        exitCode = 1;
        process.exit(exitCode);
    }
}

if (junitReport && junitReport.report) {
    if (!fs.existsSync(junitReport.savePath)) {
        console.log('creating junit xml report save path: ' + junitReport.savePath);
        fs.mkdirSync(junitReport.savePath, "0755");
    }
    jasmineEnv.addReporter(new jasmineNode['JUnitXmlReporter'](junitReport.savePath,
        junitReport.consolidate,
        junitReport.useDotNotation));
}

if (isVerbose) {
    jasmineEnv.addReporter(new jasmineNode.TerminalVerboseReporter({
        print: require('sys').print,
        color: showColors,
        onComplete: onComplete
    }));
} else {
    jasmineEnv.addReporter(new jasmineNode.TerminalReporter({
        print: require('sys').print,
        color: showColors,
        onComplete: onComplete
    }));
}

// ------------ configs end

// KISSY.use is asynchronous even in nodejs
KISSY.use(mods, function () {
    jasmineEnv.execute();
});