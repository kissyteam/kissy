var path = require("path"),
    fs = require("fs");

var jsdom = require("jsdom").jsdom;
document = jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
location = window.location;
navigator = window.navigator;
window.document = document;

var S = require('../../../../../build/kissy-nodejs').KISSY;

S.use("overlay", function(S, Overlay) {
    
    document.body.innerHTML = "<div id='server'></div>";
    
    var d = new Overlay.Dialog({
        width:"500px",
        render:"#server",
        elCls:'server-dialog',
        headerContent:"服务器端 header",
        bodyContent:"服务器端 body",
        footerContent:"服务器端 footer"
    });
    d.center();
    d.show();
    
    console.log(d.get('el')[0].offsetWidth);
    console.log(d.get('el')[0].offsetHeight);
    console.log(d.get('el').offset());
    console.log(d.get('x'));

    var Dom = S.DOM,offset = { left: Dom.scrollLeft(), top: Dom.scrollTop() },
        w = Dom['viewportWidth'](),
        h = Dom['viewportHeight']();

    console.log(offset, w, h);

    document.getElementsByTagName("head")[0].innerHTML = "<meta charset='utf-8'/>" +
        "<link rel='stylesheet' " +
        "href='http://docs.kissyui.com/kissy/src/overlay/assets/cool.css'/>" +
        "<style>" +
        "#server .server-dialog {" +
        "left:100px;" +
        "top:100px;" +
        "}" +
        "</style>";
    console.log(document.innerHTML);
    fs.writeFile("./tools/nodejs-patch/overlay.html", document.innerHTML);
});