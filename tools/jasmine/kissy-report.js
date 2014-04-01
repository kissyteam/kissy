/**
 * report for kissy on jasmine
 * @author yiminghe@gmail.com
 */
jasmine.KissyReoport = (function () {
    /*jshint camelcase:false*/
    var phantomjs, m;

    if (!window.console) {
        window.console = {
            log: function () {

            }
        };
    }

    var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var ua = window.navigator.userAgent;

    if ((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1]) {
        phantomjs = numberify(m[1]);
    }

    // https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage
    if (phantomjs && !window.callPhantom) {
        var msg = 'phantomjs does not support callPhantom!';
        console.error(msg);
        throw new Error(msg);
    }

    function numberify(s) {
        var c = 0;
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 0) ? '.' : '';
        }));
    }

    function createRequest() {
        if (window.ActiveXObject) {
            return new window.ActiveXObject('Microsoft.XMLHTTP');
        }
        else {
            return new XMLHttpRequest();
        }
    }

    function next(failedCount) {
        // https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage
        if (window.callPhantom) {
            window.callPhantom({
                type: 'report',
                failedCount: failedCount
            });
        } else {
            var ie = document.documentMode || getIEVersion() || 100;
            if (!failedCount && parent !== window) {
                if ('postMessage' in parent && ie > 8) {
                    parent.postMessage('next', '*');
                } else {
                    parent.name = 'next';
                }
            }
        }
    }

    function Report(component) {
        this.component = component;
    }

    function getIEVersion() {
        var m, v;
        if ((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) &&
            (v = (m[1] || m[2]))) {
            return numberify(v);
        }
        return 0;
    }

    var DEFAULT_COV_OUT = 'N/A';

    var SEP = '&',
        EQ = '=';

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val == null || (t !== 'object' && t !== 'function');
    }

    function param(o, sep, eq, serializeArray) {
        sep = sep || SEP;
        eq = eq || EQ;
        if (serializeArray === undefined) {
            serializeArray = 1;
        }
        var buf = [], key, i, v, len, val,
            encode = encodeURIComponent;
        for (key in o) {

            val = o[key];
            key = encode(key);

            // val is valid non-array value
            if (isValidParamValue(val)) {
                buf.push(key);
                if (val !== undefined) {
                    buf.push(eq, encode(val + ''));
                }
                buf.push(sep);
            } else if (isArray(val) && val.length) {
                // val is not empty array
                for (i = 0, len = val.length; i < len; ++i) {
                    v = val[i];
                    if (isValidParamValue(v)) {
                        buf.push(key, (serializeArray ? encode('[]') : ''));
                        if (v !== undefined) {
                            buf.push(eq, encode(v + ''));
                        }
                        buf.push(sep);
                    }
                }
            }
            // ignore other cases, including empty array, Function, RegExp, Date etc.

        }
        buf.pop();
        return buf.join('');
    }

    function each(obj, fn) {
        var i = 0,
            myKeys, l;
        if (isArray(obj)) {
            l = obj.length;
            for (; i < l; i++) {
                if (fn(obj[i], i, obj) === false) {
                    break;
                }
            }
        } else {
            myKeys = keys(obj);
            l = myKeys.length;
            for (; i < l; i++) {
                if (fn(obj[myKeys[i]], myKeys[i], obj) === false) {
                    break;
                }
            }
        }
    }

    function keys(obj) {
        var ret = [];
        for (var key in obj) {
            ret.push(key);
        }
        return ret;
    }

    function printCoverageInfo() {
        var totals = {
            files: 0,
            statements: 0,
            executed: 0,
            branches: 0,
            branches_covered: 0,
            functions: 0,
            functions_covered: 0
        };
        var cc = window._$jscoverage;
        var file;
        var lineNumber;
        var files = [];
        for (file in cc) {
            files.push(file);
        }
        if (files.length === 0) {
            return;
        }

        var printInfo = [];

        for (var f = 0; f < files.length; f++) {
            file = files[f];
            var num_statements = 0;
            var num_executed = 0;
            var missing = [];
            var fileCC = cc[file].lineData;
            var length = fileCC.length;
            var currentConditionalEnd = 0;
            var conditionals = null;
            var percentageBranch = DEFAULT_COV_OUT;
            if (fileCC.conditionals) {
                conditionals = fileCC.conditionals;
            }
            for (lineNumber = 0; lineNumber < length; lineNumber++) {
                var n = fileCC[lineNumber];

                if (lineNumber === currentConditionalEnd) {
                    currentConditionalEnd = 0;
                }
                else if (currentConditionalEnd === 0 && conditionals && conditionals[lineNumber]) {
                    currentConditionalEnd = conditionals[lineNumber];
                }

                if (currentConditionalEnd !== 0) {
                    continue;
                }

                if (n === undefined || n === null) {
                    continue;
                }

                if (n === 0) {
                    missing.push(lineNumber);
                }
                else {
                    num_executed++;
                }
                num_statements++;
            }

            var percentage = ( num_statements === 0 ? DEFAULT_COV_OUT : parseInt(100 * num_executed / num_statements, 10) );

            var num_functions = 0;
            var num_executed_functions = 0;
            var fileFunctionCC = cc[file].functionData;
            if (fileFunctionCC) {
                num_functions += fileFunctionCC.length;
                for (var fnNumber = 0; fnNumber < fileFunctionCC.length; fnNumber++) {
                    var fnHits = fileFunctionCC[fnNumber];
                    if (fnHits !== undefined && fnHits !== null && fnHits > 0) {
                        num_executed_functions++;
                    }
                }
            }
            var percentageFn = ( num_functions === 0 ? DEFAULT_COV_OUT : parseInt(100 * num_executed_functions / num_functions, 10));

            var num_branches = 0;
            var num_executed_branches = 0;
            var fileBranchCC = cc[file].branchData;
            if (fileBranchCC) {
                for (lineNumber in fileBranchCC) {
                    var conditions = fileBranchCC[lineNumber];
                    if (conditions !== undefined && conditions !== null && conditions.length) {
                        for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
                            var branchData = fileBranchCC[lineNumber][conditionIndex];
                            if (branchData === undefined || branchData === null) {
                                continue;
                            }
                            num_branches += 2;
                            num_executed_branches += branchData.pathsCovered();
                        }
                    }
                }
                percentageBranch = ( num_branches === 0 ? DEFAULT_COV_OUT : parseInt(100 * num_executed_branches / num_branches, 10));
            }

            totals.files++;
            totals.statements += num_statements;
            totals.executed += num_executed;
            totals.branches += num_branches;
            totals.branches_covered += num_executed_branches;
            totals.functions += num_functions;
            totals.functions_covered += num_executed_functions;

            printInfo.push({
                file: file,
                percentage: percentage,
                percentageFn: percentageFn,
                percentageBranch: percentageBranch
            });
        }

        console.log(new Array(116).join('-'));
        outputTh(['File', 'Coverage', 'Branch', 'Function']);
        outputTr(['Total: ' + totals.files, parseInt(totals.executed * 100 / totals.statements, 10),
            parseInt(totals.branches_covered * 100 / totals.branches, 10), parseInt(totals.functions_covered * 100 / totals.functions, 10)]);
        each(printInfo, function (info) {
            outputTr([info.file, info.percentage, info.percentageBranch, info.percentageFn]);
        });
        console.log(new Array(116).join('-'));
    }

    function output(arr, align) {
        console.log('|' +
            padding(arr[0], 50, align[0]) + '|' +
            padding(arr[1], 20, align[1]) + '|' +
            padding(arr[2], 20, align[2]) + '|' +
            padding(arr[3], 20, align[3]) +
            '|');
    }

    function outputTh(arr) {
        output(arr, ['center', 'center', 'center', 'center']);
    }

    function outputTr(arr) {
        if (arr[1] !== DEFAULT_COV_OUT) {
            arr[1] += '%';
        }
        if (arr[2] !== DEFAULT_COV_OUT) {
            arr[2] += '%';
        }
        if (arr[3] !== DEFAULT_COV_OUT) {
            arr[3] += '%';
        }
        output(arr, ['left', 'right', 'right', 'right']);
    }

    function padding(content, width, align) {
        var left;
        var right;
        content += '';
        if (align === 'right') {
            left = parseInt((width - content.length), 10);
            right = 0;
        } else if (align === 'left') {
            right = parseInt((width - content.length), 10);
            left = 0;

        } else {
            left = parseInt((width - content.length) / 2, 10);
            right = width - content.length - left;
        }
        var paddingLeft = new Array(left + 1).join(' ');
        var paddingRight = new Array(right + 1).join(' ');
        return paddingLeft + content + paddingRight;
    }

    Report.prototype.reportRunnerResults = function (runner) {
        if (window._$jscoverage) {
            printCoverageInfo();
        }
        if (window.jscoverage_serializeCoverageToJSON && phantomjs && window.travisJobId) {
            var json = window.jscoverage_serializeCoverageToJSON();
            var request = createRequest();
            request.open('post', '/save-coverage-report', true);
            request.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    next(runner.results().failedCount);
                }
            };
            request.send(param({
                report: json,
                component: this.component,
                path: location.pathname
            }));
        } else {
            next(runner.results().failedCount);
        }
    };

    return Report;
})();