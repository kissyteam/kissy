/**
 * @fileOverview jasmine runner in nodejs for KISSY.
 * refer: https://github.com/mhevery/jasmine-node/
 * @author yiminghe@gmail.com
 */

// global
var S = global.KISSY = require('../../' + 'build/kissy-nodejs.js');

var jasmineWrapper = require('../jasmine/jasmine');

var jasmine = jasmineWrapper.jasmine;

S.each(jasmineWrapper, function (v, k) {
    global[k] = v;
});

require('jasmine-reporters');

// ------------ configs start

var isVerbose = false;
var showColors = true;
var extentions = "js";
var match = '.';
var matchAll = false;

var junitReport = {
    report: true,
    savePath: "./reports/",
    useDotNotation: true,
    consolidate: true
};

var mods = [
    'xtemplate',
    'kison',
    'json',
    'base',
    'htmlparser',
    'event/custom'
];

// ------------ configs end

var specFolders = [];

var util,
    path = require('path');

try {
    util = require('util')
} catch (e) {
    util = require('sys')
}

for (var key in jasmine) {
    global[key] = jasmine[key];
}

S.each(mods, function (m) {
    m = m.replace(/\//g, '/sub-modules/');
    specFolders.push(m + '/tests/specs/');
});

var regExpSpec = new RegExp(match + (matchAll ? "" : "spec\\.") +
    "(" + extentions + ")$", 'i');

var cwd = process.cwd();

// in case run from idea
if (!S.endsWith(cwd, "src")) {
    cwd += '/src';
}

var exitCode, index = 0;

// KISSY.use is asynchronous even in nodejs
KISSY.use(mods, function () {

    var index = 0;

    function onComplete(runner) {
        var description = runner.queue.blocks[0].description;
        util.print(description + ' ↑ \n');
        util.print(new Array(20).join('-'));
        util.print('\n');
        if (runner.results().failedCount == 0) {
            exitCode = 0;
        } else {
            exitCode = 1;
            process.exit(exitCode);
        }

        process.nextTick(function () {
            // new environment
            jasmine.currentEnv_ = new jasmine.Env();
            next();
        });
    }

    function next() {

        if (index < specFolders.length) {
            var specFolder = path.resolve(cwd, specFolders[index++]);

            executeSpecsInFolder(specFolder,
                onComplete,
                isVerbose,
                showColors,
                regExpSpec,
                junitReport);
        }
    }

    next();

});

function help() {
    util.print([
        'USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory'
        , ''
        , 'Options:'
        , '  --color            - use color coding for output'
        , '  --noColor          - do not use color coding for output'
        , '  -m, --match REGEXP - load only specs containing "REGEXPspec"'
        , '  --matchAll         - relax requirement of "spec" in spec file names'
        , '  --verbose          - print extra information per each test run'
        , '  --junitReport      - export tests results as junitReport xml format'
        , '  --output           - defines the output folder for junitReport files'
        , '  -h, --help         - display this help and exit'
        , ''
    ].join("\n"));

    process.exit(-1);
}

var walkdir = require('walkdir');
var fs = require('fs');

function loadSpecs(loadPath, matcher) {
    var wannaBeSpecs = walkdir.sync(loadPath),
        specs = [];

    for (var i = 0; i < wannaBeSpecs.length; i++) {
        var file = wannaBeSpecs[i];
        try {
            if (fs.statSync(file).isFile()) {
                if (!/.*node_modules.*/.test(file) &&
                    matcher.test(path.basename(file))) {
                    specs.push(file);
                }
            }
        } catch (e) {
            // nothing to do here
        }
    }

    return specs;
}

var jasmineNode = require('../jasmine/node/reporter').jasmineNode;

function executeSpecsInFolder(folder, done, isVerbose, showColors, matcher, junitReport) {
    var fileMatcher = matcher || new RegExp(".(js)$", "i"),
        jasmineEnv = jasmine.getEnv();

    var specsList = loadSpecs(folder, fileMatcher);

    if (junitReport && junitReport.report) {
        if (!path.existsSync(junitReport.savePath)) {
            util.puts('creating junit xml report save path: ' + junitReport.savePath);
            fs.mkdirSync(junitReport.savePath, "0755");
        }
        jasmineEnv.addReporter(new jasmine['JUnitXmlReporter'](junitReport.savePath,
            junitReport.consolidate,
            junitReport.useDotNotation));
    }

    if (isVerbose) {
        jasmineEnv.addReporter(new jasmineNode.TerminalVerboseReporter({
            print: util.print,
            color: showColors,
            onComplete: done
        }));
    } else {
        jasmineEnv.addReporter(new jasmineNode.TerminalReporter({
            print: util.print,
            color: showColors,
            onComplete: done
        }));
    }


    for (var i = 0, len = specsList.length; i < len; ++i) {
        var filename = specsList[i];
        require(filename.replace(/\.\w+$/, ""));
    }

    setTimeout(function(){
        jasmineEnv.execute();
    },300);

}