/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var headerHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<head>\r\n    <meta charset="utf-8">\r\n    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">\r\n    <meta name="apple-mobile-web-app-capable" content="yes" />\r\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\r\n    <meta name="format-detection" content="telephone=no"/>\r\n    <meta name="data-spm" content="a1z2c" />\r\n    <title>', 0);
    var id0 = scope.resolve([
            'header',
            'data',
            'itemTitle'
        ], 0);
    buffer.write(id0, true);
    buffer.write('</title>\r\n    <meta name="description" content="', 0);
    var id1 = scope.resolve([
            'header',
            'data',
            'itemTitle'
        ], 0);
    buffer.write(id1, true);
    buffer.write('">\r\n    <meta name="keywords" content="', 0);
    var id2 = scope.resolve([
            'header',
            'data',
            'itemTitle'
        ], 0);
    buffer.write(id2, true);
    buffer.write('">\r\n    <link href="http://img.taobaocdn.com/favicon.ico" rel="icon" type="image/x-icon">\r\n    <link href="http://img.taobaocdn.com/favicon.ico" rel="shortcut icon" type="image/x-icon">\r\n    <link rel="stylesheet" href="//g.alicdn.com/??tb/global/', 0);
    var id3 = scope.resolve([
            'renderConfig',
            'globalVersion'
        ], 0);
    buffer.write(id3, true);
    buffer.write('/global-min.css?t=20130912">\r\n\r\n    <script>var g_config={\r\n        appId: 1,\r\n        toolbar:false,\r\n        webww: false\r\n    };\r\n    </script>\r\n    <!--##assets\u5F15\u7528\u7684\u57FA\u672C\u914D\u7F6E\r\n    #set($fbBiz = "detail")\r\n    #set($fbTag = "20130829")\r\n    #set($fbPath = $fbPath+\'/tb/item-touch/\'+$detailSwitcher.moduletJsVersion)-->\r\n    <script>/*! A fix for the iOS orientationchange zoom bug. Script by @scottjehl, rebound by @wilto.MIT / GPLv2 License.*/(function(a){function m(){d.setAttribute("content",g),h=!0}function n(){d.setAttribute("content",f),h=!1}function o(b){l=b.accelerationIncludingGravity,i=Math.abs(l.x),j=Math.abs(l.y),k=Math.abs(l.z),(!a.orientation||a.orientation===180)&&(i>7||(k>6&&j<8||k<8&&j>6)&&i>5)?h&&n():h||m()}var b=navigator.userAgent;if(!(/iPhone|iPad|iPod/.test(navigator.platform)&&/OS [1-5]_[0-9_]* like Mac OS X/i.test(b)&&b.indexOf("AppleWebKit")>-1))return;var c=a.document;if(!c.querySelector)return;var d=c.querySelector("meta[name=viewport]"),e=d&&d.getAttribute("content"),f=e+",maximum-scale=1",g=e+",maximum-scale=10",h=!0,i,j,k,l;if(!d)return;a.addEventListener("orientationchange",m,!1),a.addEventListener("devicemotion",o,!1)})(this);</script>\r\n</head>', 0);
    return buffer;
};
headerHtml.TPL_NAME = module.name;
headerHtml.version = '5.0.0';
module.exports = headerHtml;
