var S = require('../../lib/kissy-nodejs');
var fs = require('fs'), http = require('http');


fs.readFile(__dirname + '/data.html', encoding = "utf-8", function (err, html_data) {
    fs.readFile(__dirname + '/simplepage.js', encoding = "utf-8", function (err, js_file) {
        fs.readFile(__dirname + '/logic.js', encoding = "utf-8", function (err, js_logic) {
            document.head.innerHTML = "<meta charset='utf-8'/>";
            document.docType = '<!DOCTYPE html>';
            document.body.innerHTML = html_data + '<script>' + js_file + js_logic + '</script>';
            /*
             var mod = "(function(KISSY) { " + js_data + " return KISSY; })",
             fn = process.compile(mod, file);
             */


            fs.writeFile("browser.html", document.innerHTML);
        });
    });
});