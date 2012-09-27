var jsdom = require("jsdom").jsdom;
document = jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
location = window.location;
navigator = window.navigator;
window.document = document;

var S = require('../../../../../../build/kissy-nodejs').KISSY;
var vm = require('vm'),
    fs = require('fs'),
    url = require('url'),
    http = require('http');
S.config({
    packages: [
        {
            name: 'example',
            path: __dirname.replace(/\\/g, "/") + '/../../'
        }
    ]
});
document.head.innerHTML = "<meta charset='utf-8'/>";
http.createServer(
    function (req, res) {
        fs.readFile(__dirname + '/data.html', encoding = "utf-8", function (err, html_data) {
            fs.readFile(__dirname + '/logic.js', encoding = "utf-8", function (err, js_logic) {
                var urlInfo = url.parse(req.url, true);
                //console.log(urlInfo);

                //后端渲染
                if (!S.isEmptyObject(urlInfo.query)) {
                    // !TODO
                    // 需要更新，jsdom 会执行 script 标签里代码


                    KISSY.SSJS = 1;
                    document.docType = '<!DOCTYPE html>';
                    document.body.innerHTML = html_data;

                    var p = vm.runInNewContext(js_logic, {
                        KISSY: KISSY,
                        SSJS: 1
                    }, "logic.js");

                    p.render({index: Number(urlInfo.query.page)});
                    res.writeHead(200, {
                            'Content-Type': 'text',
                            'Accept-Charset': 'utf-8'}
                    );
                    res.end(document.outerHTML);
                    fs.writeFile("server2.html", document.innerHTML);

                } else {

                    //前端渲染
                    fs.readFile(__dirname + '/simplepage.js', encoding = "utf-8", function (err, js_file) {
                        document.docType = '<!DOCTYPE html>';
                        document.body.innerHTML = html_data + '<script>' + js_file + js_logic + '</script>';

                        res.writeHead(200, {
                                'Content-Type': 'text',
                                'Accept-Charset': 'utf-8'}
                        );
                        res.end(document.outerHTML);
                        fs.writeFile("browser2.html", document.innerHTML);
                    });

                }
            });
        });
    }).listen(81);
S.log('访问：http://localhost:81');

