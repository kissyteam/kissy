/*jshint camelcase:false*/

var request = require('request');
var fs = require('fs');
var path = require('path');
var cwd = process.cwd();
var util = require('../../common/util');
var compileXtplCode = require(path.join(cwd,'lib/xtemplate/compile-module'));

function getSourceInfo(f, postData) {
    var source_files = postData.source_files,
        len = source_files.length;
    for (var i = 0; i < len; i++) {
        if (source_files[i].name === f) {
            return source_files[i];
        }
    }
    return undefined;
}

function merge(d1, d2) {
    var len = d1.length;
    var dd1, dd2;
    for (var i = 0; i < len; i++) {
        dd1 = d1[i];
        dd2 = d2[i];
        if (typeof  dd2 === 'number' && typeof dd1 === 'number') {
            d1[i] = d1 + d2;
        } else if (typeof  dd2 === 'number') {
            d1[i] = dd2;
        }
    }
}

//noinspection JSUnresolvedFunction,JSUnresolvedVariable
var service_job_id = process.env.TRAVIS_JOB_ID;

module.exports = function (app) {
    var postData = {
        service_name: 'travis-ci',
        service_job_id: service_job_id,
        source_files: []
    };

    app.get('/send-to-coveralls', function (req, res) {
        var start = Date.now();
        var ok = '<script>{' +
            'content' +
            '}\n' +
            'window.callPhantom&&window.callPhantom(\\{' +
            'type: "report",' +
            'failedCount: 0' +
            '});\n' +
            '</script>';
        var str = JSON.stringify(postData);
        if (!service_job_id) {
            //console.log(str);
            res.send(util.substitute(ok, {
                //content: 'var data=' + str + ';console.log(data);',
                time: (Date.now() - start)
            }));
            return;
        }
        var url = 'https://coveralls.io/api/v1/jobs';
        request.post({url: url, form: { json: str}}, function () {
            res.send(util.substitute(ok, {
                //content: 'var data=' + str + ';console.log(data);',
                time: (Date.now() - start)
            }));
        });
    });

    app.post('/save-coverage-report', function (req, res) {
        var report = req.param('report');
        var component = req.param('component');
        if (component.indexOf('/') !== -1) {
            // remove last component name
            component = component.replace(/[^/]+$/, '');
        } else {
            component = '';
        }
        var pathParam = req.param('path').slice(1);
        var jsonReport = JSON.parse(report);
        var srcPath;
        var myPath = cwd + pathParam.slice(pathParam.indexOf('/'));
        // find src dir
        if (util.endsWith(pathParam, 'runner')) {
            srcPath = path.resolve(myPath, '../../src/');
        } else {
            srcPath = path.resolve(myPath, '../../../src/');
        }
        var source_files = postData.source_files;
        for (var f in jsonReport) {
            var detail = jsonReport[f];
            // coveralls.io does not need first data
            detail.lineData.shift();
            var lineData = detail.lineData;
            // remove leading slash
            var name = component + f.slice(1);
            var info = getSourceInfo(name, postData);
            if (info) {
                merge(info.coverage, lineData);
            } else {
                var source;
                if (f.indexOf('-xtpl.js') === -1) {
                    source = fs.readFileSync(path.join(srcPath, f), 'utf8');
                } else {
                    f = f.replace(/\.js$/, '.html');
                    source = compileXtplCode(path.join(srcPath, f));
                }
                source_files.push({
                    name: name,
                    source: source,
                    coverage: detail.lineData
                });
            }
        }
        res.send('');
    });
};