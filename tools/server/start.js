/**
 * KISSY Dev Server
 * @author yiminghe@gmail.com
 */

require('../test/gen-tc');
require('./gen-package');

var path = require('path');
var fs = require('fs');
//noinspection JSUnresolvedVariable
var cwd = process.cwd();
//noinspection JSUnresolvedVariable
var currentDir = __dirname;
var S = global.KISSY = global.S = require(cwd + '/build/kissy-nodejs.js');
var request = require('request');
var serverConfig = JSON.parse(fs.readFileSync(currentDir + '/server.json'));

S.use('xtemplate/nodejs', function (S, XTemplateNodeJs) {
    function startServer(port) {
        var express = require('express');
        var app = express();
        S.config('packages', {
            'xtemplates': {
                base: currentDir
            }
        });
        var tplCache = {};

        var testTpl = XTemplateNodeJs.loadFromModuleName('xtemplates/test');

        var listTpl = XTemplateNodeJs.loadFromModuleName('xtemplates/list');

        function getXTemplate(name) {
            if (tplCache[name]) {
                return tplCache[name];
            }
            return tplCache[name] = XTemplateNodeJs.loadFromModuleName('xtemplates/' + name);
        }

        var utils = {
            config: serverConfig,
            render: function (tpl, data) {
                return getXTemplate(tpl).render(data);
            }
        };

        app.use(express.compress());
        //noinspection JSUnresolvedFunction
        app.use(express.cookieParser());
        //noinspection JSUnresolvedFunction
        app.use(express.bodyParser());

        app.get('/', function (req, res) {
            //noinspection JSUnresolvedFunction
            res.redirect('/kissy/');
        });

        app.get(/\/kissy$/, function (req, res) {
            //noinspection JSUnresolvedFunction
            res.redirect('/kissy/');
        });

        // js duck mobile
        (function () {
            var docsDir = cwd + '/docs/';

            function file_get_contents(f) {
                return fs.readFileSync(docsDir + f, {
                    encoding: 'utf-8'
                });
            }

            function print_page(req, res, $subtitle, $body, $fragment) {
                var $uri = req.protocol + '://' + req.host + req.path;
                var $canonical = $uri + "#!" + $fragment;
                var $html = file_get_contents('print-template.html');
                res.send(S.substitute($html, {
                    subtitle: $subtitle,
                    body: fix_links($body),
                    canonical: $canonical
                }));
            }

            function print_index_page(res) {
                res.send(fix_links(file_get_contents("index-template.html")));
            }

            function jsonp_decode($jsonp) {
                return JSON.parse($jsonp.replace(/^.*?\(/, '')
                    .replace(/\);\s*$/, ''));
            }

            function decode_file($filename) {
                if (fs.existsSync(docsDir + $filename)) {
                    return jsonp_decode(file_get_contents($filename));
                } else {
                    throw new Error("File " + $filename + " not found");
                }
            }

            // Turns #! links into ?print= links when in print mode.
            // <a href="#!/api/Ext.Element">  -->  <a href="?print=/api/Ext.Element">
            // <a href="#!/api/Ext.Element-cfg-id">  -->  <a href="?print=/api/Ext.Element#cfg-id">
            function fix_links($html) {
                var $param = "mobile";
                return $html
                    .replace(/<a href=(['"])#!?\/(api\/[^-'"]+)-([^'"]+)/g,
                        '<a href=' + '$1?' + $param + '=/$2#$3')
                    .replace(/<a href=(['"])#!?\/guide\/([^-'"]+)-section-([^'"]+)/g,
                        '<a href=' + '$1?' + $param + '=/guide/$2#$2-section-$3')
                    .replace(/<a href=(['"])#!?\//g,
                        '<a href=' + '$1?' + $param + '=/');
            }

            app.get('/kissy/docs/', function (req, res) {
                var ua = req.get('User-Agent'),
                    $fragment,
                    query = req.query;
                if ('print' in query) {
                    query.mobile = query.print;
                }
                if ('mobile' in query) {
                    $fragment = query.mobile || '';
                } else if (
                    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
                        .test(ua) ||
                        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
                            .test(ua.substr(0, 4))
                    ) {
                    $fragment = '';
                }
                if ($fragment !== undefined) {
                    var $m;
                    if ($m = $fragment.match(/^\/api\/([^-]+)/)) {
                        var $className = $m[1];
                        var $json = decode_file("output/" + $className + ".js");
                        print_page(req, res, $className, "<h1>" + $className + "</h1>\n" + $json["html"], $fragment);
                    } else if ($m = $fragment.match(/^\/api\/?$/)) {
                        print_index_page(res);
                    } else if ($m = $fragment.match(/^\/guide\/(.+?)(-section-.+)?$/)) {
                        $json = decode_file("guides/" + $m[1] + "/README.js");
                        print_page(req, res, $json["title"], '<div class="guide-container" style="padding: 1px">' + $json["guide"] + '</div>', $fragment);
                    } else {
                        print_index_page(res);
                    }
                } else {
                    res.send(file_get_contents('template.html'));
                }
            });
        })();

        // combo
        app.use('/kissy/', function (req, res, next) {
            var query = req.query, k,
                combo = "",
                path = cwd + req.path;

            for (k in query) {
                if (S.startsWith(k, '?')) {
                    combo = k;
                    break;
                }
            }

            var codes = [];

            if (S.startsWith(combo, '?')) {
                var nextQ = combo.slice(1).indexOf('?');
                if (nextQ == -1) {
                    nextQ = combo.length;
                } else {
                    nextQ++;
                }
                combo = combo.slice(1, nextQ);
                var files = combo.split(',');
                var f = files[0];
                S.each(files, function (f) {
                    codes.push(fs.readFileSync(path + f));
                });
                if (S.endsWith(f, '.js')) {
                    res.setHeader("Content-Type", "application/x-javascript");
                } else {
                    res.setHeader("Content-Type", "text/css");
                }
                res.send(codes.join('\n'));
            } else {
                next();
            }
        });

        app.use('/kissy/', function (req, res, next) {
            var path = req.path;
            if (S.endsWith(path, ".jss")) {
                require(cwd + path)(req, res, utils);
            } else {
                next();
            }
        });

        app.use('/kissy/', function (req, res, next) {
            var cur = cwd + req.path,
                index = cur + '/index.jss',
                indexHtml = cur + '/index.html';

            if (fs.existsSync(cur) && fs.statSync(cur).isDirectory()) {

                if (!S.endsWith(cur, '/')) {
                    //noinspection JSUnresolvedFunction
                    res.redirect('/kissy' + req.path + '/');
                    return;
                }

                if (fs.existsSync(index)) {
                    require(index)(req, res);
                    return;
                }

                if (fs.existsSync(indexHtml)) {
                    res.send(fs.readFileSync(indexHtml, {
                        encoding: 'utf-8'
                    }));
                    return;
                }

                var files = fs.readdirSync(cur);
                files.forEach(function (f, v) {
                    if (fs.statSync(cur + f).isDirectory()) {
                        files[v] += '/';
                    }
                });
                res.send(listTpl.render({
                    cur: req.url,
                    files: files
                }));
            } else {
                next();
            }
        });

        //noinspection JSUnresolvedFunction
        app.use('/kissy/', express.static(cwd));

        var codes = require('./../test/tc.js')();

        app.get('/crossdomain.xml', function (req, res) {
            res.set('content-type', 'text/xml');
            res.send('<cross-domain-policy>' +
                '<allow-access-from domain="*"/>' +
                '</cross-domain-policy>');
        });

        app.get('/kissy/test', function (req, res) {
            res.send(testTpl.render({
                tests: codes
            }));
        });

        function getSourceInfo(f) {
            var source_files = postData.source_files,
                len = source_files.length;
            for (var i = 0; i < len; i++) {
                if (source_files[i].name == f) {
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
                if (typeof  dd2 == 'number' && typeof dd1 == 'number') {
                    d1[i] = d1 + d2;
                } else if (typeof  dd2 == 'number') {
                    d1[i] = dd2;
                }
            }
        }

        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        var service_job_id = process.env.TRAVIS_JOB_ID;
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
                'console.log("0 specs, 0 failures in {time}ms.")</script>';
            var str = JSON.stringify(postData);
            if (!service_job_id) {
                //console.log(str);
                res.send(S.substitute(ok, {
                    //content: 'var data=' + str + ';console.log(data);',
                    time: (Date.now() - start)
                }));
                return;
            }
            var url = 'https://coveralls.io/api/v1/jobs';
            request.post({url: url, form: { json: str}}, function () {
                res.send(S.substitute(ok, {
                    time: (Date.now() - start)
                }));
            });
        });

        app.post('/save-coverage-report', function (req, res) {
            if (!service_job_id) {
                res.send('');
                return;
            }
            var report = req.param('report');
            var component = req.param('component');
            if (component.indexOf('/') != -1) {
                // remove last component name
                component = component.replace(/[^/]+$/, '');
            } else {
                component = ''
            }
            var pathParam = req.param('path').slice(1);
            var myPath = cwd + pathParam.slice(pathParam.indexOf('/'));
            var jsonReport = JSON.parse(report);
            var srcPath = path.resolve(myPath, '../../../src/');
            var source_files = postData.source_files;
            for (var f in jsonReport) {
                var detail = jsonReport[f];
                // coveralls.io does not need first data
                detail.lineData.shift();
                var lineData = detail.lineData;
                // remove leading slash
                var name = component + f.slice(1);
                var info = getSourceInfo(name);
                if (info) {
                    merge(info.coverage, lineData);
                } else {
                    var source = fs.readFileSync(srcPath + f, 'utf8');
                    source_files.push({
                        name: name,
                        source: source,
                        coverage: detail.lineData
                    });
                }
            }
            res.send('');
        });

        app.listen(port);
    }

    serverConfig.ports.forEach(function (port) {
        startServer(port);
    });
});
