var jsdom = require("jsdom").jsdom;
document = jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
location = window.location;
navigator = window.navigator;
window.document = document;

var S = require('../../../../../build/kissy-nodejs').KISSY;
var fs = require("fs");
document.head.innerHTML = '<meta charset=\'utf-8\' />';
document.body.innerHTML = '<div id="J_calendar"></div>';
document.docType = '<!DOCTYPE html>';
S.use('calendar,calendar/assets/base.css', function (S, Calendar) {

    new Calendar('#J_calendar');

    S.log(document.outerHTML);
    console.log(document.innerHTML);
    fs.writeFile("calendar.html", document.innerHTML);
});

