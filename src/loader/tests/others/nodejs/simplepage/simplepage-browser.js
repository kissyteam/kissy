var jsdom = require("jsdom").jsdom;
document = jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
location = window.location;
navigator = window.navigator;
window.document = document;

var S = require('../../../../../../build/kissy-nodejs').KISSY;
var fs = require('fs'), http = require('http');


fs.readFile(__dirname + '/data.html', encoding = "utf-8", function (err, html_data) {
    fs.readFile(__dirname + '/simplepage.js', encoding = "utf-8", function (err, js_file) {
        fs.readFile(__dirname + '/logic.js', encoding = "utf-8", function (err, js_logic) {
            var str = "<meta charset='utf-8'/>";
            str += '<!DOCTYPE html>';
            str += html_data + '<script>' + js_file + js_logic + '</script>';
            console.log(str);
            // jsdom 可以执行 script 标签了
            fs.writeFile("browser.html", str);
        });
    });
});