/**
 * report for kissy on jasmine
 * @author yiminghe@gmail.com
 */
jasmine.KissyReoport = (function () {
    /*jshint camelcase:false*/

    var S = KISSY;

    function createRequest() {
        if (window.ActiveXObject) {
            return new window.ActiveXObject('Microsoft.XMLHTTP');
        }
        else {
            return new XMLHttpRequest();
        }
    }

    function next(failedCount) {
        var ie = document.documentMode || KISSY.UA.ie || 100;
        if (!failedCount && parent !== window) {
            if ('postMessage' in parent && ie > 8) {
                parent.postMessage('next', '*');
            } else {
                parent.name = 'next';
            }
        }
    }

    function Report(component) {
        this.component = component;
    }

    Report.prototype.reportRunnerResults = function (runner) {
        if (window.jscoverage_serializeCoverageToJSON && S.UA.phantomjs) {
            var json = window.jscoverage_serializeCoverageToJSON();
            var request = createRequest();
            request.open('post', '/save-coverage-report', true);
            request.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    jasmine.kissyNext(runner.results().failedCount);
                }
            };
            request.send(S.param({
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