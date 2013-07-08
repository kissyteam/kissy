//
// Imports
//
var util;
try {
    util = require('util')
} catch (e) {
    util = require('sys')
}

if (!jasmineNode) {
    var jasmineNode = {};
}

//
// Helpers
//
function noop() {
}

jasmineNode.ANSIColors = {
    pass: function () {
        return '\033[32m';
    }, // Green
    fail: function () {
        return '\033[31m';
    }, // Red
    neutral: function () {
        return '\033[0m';
    }  // Normal
};

jasmineNode.NoColors = {
    pass: function () {
        return '';
    },
    fail: function () {
        return '';
    },
    neutral: function () {
        return '';
    }
};

jasmineNode.TerminalReporter = function (config) {
    this.print_ = config.print || util.print;
    this.color_ = config.color ? jasmineNode.ANSIColors : jasmineNode.NoColors;

    this.started_ = false;
    this.finished_ = false;

    this.callback_ = config.onComplete || false

    this.suites_ = [];
    this.specResults_ = {};
    this.failures_ = [];
}

jasmineNode.TerminalReporter.prototype = {
    reportRunnerStarting: function (runner) {
        this.started_ = true;
        this.startedAt = new Date();
        var suites = runner.topLevelSuites();
        for (var i = 0; i < suites.length; i++) {
            var suite = suites[i];
            this.suites_.push(this.summarize_(suite));
        }
    },

    summarize_: function (suiteOrSpec) {
        var isSuite = suiteOrSpec instanceof jasmine.Suite;

        // We could use a separate object for suite and spec
        var summary = {
            id: suiteOrSpec.id,
            name: suiteOrSpec.description,
            type: isSuite ? 'suite' : 'spec',
            suiteNestingLevel: 0,
            children: []
        };

        if (isSuite) {
            var calculateNestingLevel = function (examinedSuite) {
                var nestingLevel = 0;
                while (examinedSuite.parentSuite !== null) {
                    nestingLevel += 1;
                    examinedSuite = examinedSuite.parentSuite;
                }
                return nestingLevel;
            };

            summary.suiteNestingLevel = calculateNestingLevel(suiteOrSpec);

            var children = suiteOrSpec.children();
            for (var i = 0; i < children.length; i++) {
                summary.children.push(this.summarize_(children[i]));
            }
        }

        return summary;
    },

    // This is heavily influenced by Jasmine's Html/Trivial Reporter
    reportRunnerResults: function (runner) {
        this.reportFailures_();

        var results = runner.results();
        var resultColor = (results.failedCount > 0) ? this.color_.fail() : this.color_.pass();

        var specs = runner.specs();
        var specCount = specs.length;

        var message = "\n\nFinished in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + " seconds";
        this.printLine_(message);

        // This is what jasmine-html.js has
        //message = "" + specCount + " spec" + ( specCount === 1 ? "" : "s" ) + ", " + results.failedCount + " failure" + ((results.failedCount === 1) ? "" : "s");

        this.printLine_(this.stringWithColor_(this.printRunnerResults_(runner), resultColor));

        this.finished_ = true;
        if (this.callback_) {
            this.callback_(runner);
        }
    },

    reportFailures_: function () {
        if (this.failures_.length === 0) {
            return;
        }

        var indent = '  ', failure;
        this.printLine_('\n');

        this.print_('Failures:');

        for (var i = 0; i < this.failures_.length; i++) {
            failure = this.failures_[i];
            this.printLine_('\n');
            this.printLine_('  ' + (i + 1) + ') ' + failure.spec);
            this.printLine_('   Message:');
            this.printLine_('     ' + this.stringWithColor_(failure.message, this.color_.fail()));
            this.printLine_('   Stacktrace:');
            this.print_('     ' + failure.stackTrace);
        }
    },

    reportSuiteResults: function (suite) {
        // Not used in this context
    },

    reportSpecResults: function (spec) {
        var result = spec.results();
        var msg = '';
        if (result.passed()) {
            msg = this.stringWithColor_('.', this.color_.pass());
            //      } else if (result.skipped) {  TODO: Research why "result.skipped" returns false when "xit" is called on a spec?
            //        msg = (colors) ? (ansi.yellow + '*' + ansi.none) : '*';
        } else {
            msg = this.stringWithColor_('F', this.color_.fail());
            this.addFailureToFailures_(spec);
        }
        this.spec_results += msg;
        this.print_(msg);
    },

    addFailureToFailures_: function (spec) {
        var result = spec.results();
        var failureItem = null;

        var items_length = result.items_.length;
        for (var i = 0; i < items_length; i++) {
            if (result.items_[i].passed_ === false) {
                failureItem = result.items_[i];
                var failure = {
                    spec: spec.description,
                    message: failureItem.message,
                    stackTrace: failureItem.trace.stack
                }

                this.failures_.push(failure);
            }
        }
    },

    printRunnerResults_: function (runner) {
        var results = runner.results();
        var specs = runner.specs();
        var msg = '';
        msg += specs.length + ' test' + ((specs.length === 1) ? '' : 's') + ', ';
        msg += results.totalCount + ' assertion' + ((results.totalCount === 1) ? '' : 's') + ', ';
        msg += results.failedCount + ' failure' + ((results.failedCount === 1) ? '' : 's') + '\n';
        return msg;
    },

    // Helper Methods //
    stringWithColor_: function (stringValue, color) {
        return (color || this.color_.neutral()) + stringValue + this.color_.neutral();
    },

    printLine_: function (stringValue) {
        this.print_(stringValue);
        this.print_('\n');
    }
};

// ***************************************************************
// TerminalVerboseReporter uses the TerminalReporter's constructor
// ***************************************************************
jasmineNode.TerminalVerboseReporter = function (config) {
    jasmineNode.TerminalReporter.call(this, config);
    // The extra field in this object
    this.indent_ = 0;
}


jasmineNode.TerminalVerboseReporter.prototype = {
    reportSpecResults: function (spec) {
        if (spec.results().failedCount > 0) {
            this.addFailureToFailures_(spec);
        }

        this.specResults_[spec.id] = {
            messages: spec.results().getItems(),
            result: spec.results().failedCount > 0 ? 'failed' : 'passed'
        };
    },

    reportRunnerResults: function (runner) {
        var messages = new Array();
        this.buildMessagesFromResults_(messages, this.suites_);

        var messages_length = messages.length;
        for (var i = 0; i < messages_length - 1; i++) {
            this.printLine_(messages[i]);
        }

        this.print_(messages[messages_length - 1]);

        // Call the parent object's method
        jasmineNode.TerminalReporter.prototype.reportRunnerResults.call(this, runner);
    },

    buildMessagesFromResults_: function (messages, results) {
        var element, specResult, specIndentSpaces, msg = '';

        var results_length = results.length;
        for (var i = 0; i < results_length; i++) {
            element = results[i];

            if (element.type === 'spec') {
                specResult = this.specResults_[element.id.toString()];

                specIndentSpaces = this.indent_ + 2;
                if (specResult.result === 'passed') {
                    msg = this.stringWithColor_(this.indentMessage_(element.name, specIndentSpaces), this.color_.pass());
                } else {
                    msg = this.stringWithColor_(this.indentMessage_(element.name, specIndentSpaces), this.color_.fail());
                }

                messages.push(msg);
            } else {
                this.indent_ = element.suiteNestingLevel * 2;

                messages.push('');
                messages.push(this.indentMessage_(element.name, this.indent_));
            }

            this.buildMessagesFromResults_(messages, element.children);
        }
    },

    indentMessage_: function (message, indentCount) {
        var _indent = '';
        for (var i = 0; i < indentCount; i++) {
            _indent += ' ';
        }
        return (_indent + message);
    }
};

// Inherit from TerminalReporter
jasmineNode.TerminalVerboseReporter.prototype.__proto__ = jasmineNode.TerminalReporter.prototype;


function elapsed(startTime, endTime) {
    return (endTime - startTime)/1000;
}

function ISODateString(d) {
    function pad(n) { return n < 10 ? '0'+n : n; }

    return d.getFullYear() + '-' +
        pad(d.getMonth()+1) + '-' +
        pad(d.getDate()) + 'T' +
        pad(d.getHours()) + ':' +
        pad(d.getMinutes()) + ':' +
        pad(d.getSeconds());
}

function trim(str) {
    return str.replace(/^\s+/, "" ).replace(/\s+$/, "" );
}

function escapeInvalidXmlChars(str) {
    return str.replace(/\&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/\'/g, "&apos;");
}

/**
 * Generates JUnit XML for the given spec run.
 * Allows the test results to be used in java based CI
 * systems like CruiseControl and Hudson.
 *
 * @param {string} savePath where to save the files
 * @param {boolean} consolidate whether to save nested describes within the
 *                  same file as their parent; default: true
 * @param {boolean} useDotNotation whether to separate suite names with
 *                  dots rather than spaces (ie "Class.init" not
 *                  "Class init"); default: true
 */
var JUnitXmlReporter = function(savePath, consolidate, useDotNotation) {
    this.savePath = savePath || '';
    this.consolidate = consolidate === jasmine.undefined ? true : consolidate;
    this.useDotNotation = useDotNotation === jasmine.undefined ? true : useDotNotation;
};
JUnitXmlReporter.finished_at = null; // will be updated after all files have been written

JUnitXmlReporter.prototype = {
    reportSpecStarting: function(spec) {
        spec.startTime = new Date();

        if (!spec.suite.startTime) {
            spec.suite.startTime = spec.startTime;
        }
    },

    reportSpecResults: function(spec) {
        var results = spec.results();
        spec.didFail = !results.passed();
        spec.duration = elapsed(spec.startTime, new Date());
        spec.output = '<testcase classname="' + this.getFullName(spec.suite) +
            '" name="' + escapeInvalidXmlChars(spec.description) + '" time="' + spec.duration + '">';

        var failure = "";
        var failures = 0;
        var resultItems = results.getItems();
        for (var i = 0; i < resultItems.length; i++) {
            var result = resultItems[i];

            if (result.type == 'expect' && result.passed && !result.passed()) {
                failures += 1;
                failure += (failures + ": " + escapeInvalidXmlChars(result.message) + " ");
            }
        }
        if (failure) {
            spec.output += "<failure>" + trim(failure) + "</failure>";
        }
        spec.output += "</testcase>";
    },

    reportSuiteResults: function(suite) {
        var results = suite.results();
        var specs = suite.specs();
        var specOutput = "";
        // for JUnit results, let's only include directly failed tests (not nested suites')
        var failedCount = 0;

        suite.status = results.passed() ? 'Passed.' : 'Failed.';
        if (results.totalCount === 0) { // todo: change this to check results.skipped
            suite.status = 'Skipped.';
        }

        // if a suite has no (active?) specs, reportSpecStarting is never called
        // and thus the suite has no startTime -- account for that here
        suite.startTime = suite.startTime || new Date();
        suite.duration = elapsed(suite.startTime, new Date());

        for (var i = 0; i < specs.length; i++) {
            failedCount += specs[i].didFail ? 1 : 0;
            specOutput += "\n  " + specs[i].output;
        }
        suite.output = '\n<testsuite name="' + this.getFullName(suite) +
            '" errors="0" tests="' + specs.length + '" failures="' + failedCount +
            '" time="' + suite.duration + '" timestamp="' + ISODateString(suite.startTime) + '">';
        suite.output += specOutput;
        suite.output += "\n</testsuite>";
    },

    reportRunnerResults: function(runner) {
        var suites = runner.suites();
        for (var i = 0; i < suites.length; i++) {
            var suite = suites[i];
            var fileName = 'TEST-' + this.getFullName(suite, true) + '.xml';
            var output = '<?xml version="1.0" encoding="UTF-8" ?>';
            // if we are consolidating, only write out top-level suites
            if (this.consolidate && suite.parentSuite) {
                continue;
            }
            else if (this.consolidate) {
                output += "\n<testsuites>";
                output += this.getNestedOutput(suite);
                output += "\n</testsuites>";
                this.writeFile(this.savePath + fileName, output);
            }
            else {
                output += suite.output;
                this.writeFile(this.savePath + fileName, output);
            }
        }
        // When all done, make it known on JUnitXmlReporter
        JUnitXmlReporter.finished_at = (new Date()).getTime();
    },

    getNestedOutput: function(suite) {
        var output = suite.output;
        for (var i = 0; i < suite.suites().length; i++) {
            output += this.getNestedOutput(suite.suites()[i]);
        }
        return output;
    },

    writeFile: function(filename, text) {
        // Rhino
        try {
            var out = new java.io.BufferedWriter(new java.io.FileWriter(filename));
            out.write(text);
            out.close();
            return;
        } catch (e) {}
        // PhantomJS, via a method injected by phantomjs-testrunner.js
        try {
            __phantom_writeFile(filename, text);
            return;
        } catch (f) {}
        // Node.js
        try {
            var fs = require("fs");
            var fd = fs.openSync(filename, "w");
            fs.writeSync(fd, text, 0);
            fs.closeSync(fd);
            return;
        } catch (g) {}
    },

    getFullName: function(suite, isFilename) {
        var fullName;
        if (this.useDotNotation) {
            fullName = suite.description;
            for (var parentSuite = suite.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
                fullName = parentSuite.description + '.' + fullName;
            }
        }
        else {
            fullName = suite.getFullName();
        }

        // Either remove or escape invalid XML characters
        if (isFilename) {
            return fullName.replace(/[^\w]/g, "");
        }
        return escapeInvalidXmlChars(fullName);
    },

    log: function(str) {
        var console = jasmine.getGlobal().console;

        if (console && console.log) {
            console.log(str);
        }
    }
};

// export public
jasmineNode.JUnitXmlReporter = JUnitXmlReporter;


//
// Exports
//
exports.jasmineNode = jasmineNode;