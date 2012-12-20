var path = require("path"),
    fs = require("fs");

var jsdom = require("jsdom").jsdom;
document = jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
location = window.location;
navigator = window.navigator;
window.document = document;


console.log(__dirname);

console.log(!!document);

console.log(!!location);

console.log(require('d:/t.js')());

console.log(require('./data.js?t=12')());