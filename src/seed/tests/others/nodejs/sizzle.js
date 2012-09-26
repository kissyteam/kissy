var path = require("path"),
    fs = require("fs");

var jsdom = require("jsdom").jsdom;
document = jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
location = window.location;
navigator = window.navigator;
window.document = document;

var S = require('../../../../../build/kissy-nodejs').KISSY;

// S.log(S);

S.use('node,sizzle',function(S){
	document.body.innerHTML = '<div id="J_calendar"><ul><li>first li</li><li>second li</li></ul></div>';
	S.log(S.one('body li:eq(1)').html());
});
