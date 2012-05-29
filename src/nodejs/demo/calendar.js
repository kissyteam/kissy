var S = require('../../../build/kissy-nodejs'),
    fs = require("fs");
document.head.innerHTML = '<meta charset=\'utf-8\' />';
document.body.innerHTML = '<div id="J_calendar"></div>';
document.docType = '<!DOCTYPE html>';
S.use('calendar,calendar/assets/base.css', function (S, Calendar) {

    new Calendar('#J_calendar');

    S.log(document.outerHTML);
    fs.writeFile("calendar.html", document.innerHTML);
});

