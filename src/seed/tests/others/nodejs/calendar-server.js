var jsdom = require("jsdom").jsdom;
document = jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
location = window.location;
navigator = window.navigator;
window.document = document;

var S = require('../../../../../build/kissy-nodejs').KISSY;

var http = require('http');

S.use('calendar,calendar/assets/base.css',function(S,Calendar) {

	document.body.innerHTML = '<div id="J_calendar"></div>';
	var docType = '<!DOCTYPE html>';

	new Calendar('#J_calendar');
	var head = '<head>' + document.getElementsByTagName('head')[0].innerHTML + '</head>';
	var out = docType + '<html>'+head+'<body>' + S.one('body').html() + '</body></html>';

	http.createServer(function (req, res) {

		res.writeHead(200, {
			'Content-Type': 'text/html',
			'Accept-Charset':'utf-8'}
		);
		res.write(out);
		res.close();

	}).listen(81);

});

