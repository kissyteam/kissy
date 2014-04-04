/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n    <meta name="format-detection" content="telephone=no"/>\n    <meta name="data-spm" content="a1z2c" />\n    <title>');
            var id0 = scope.resolve(["header", "data", "itemTitle"]);
            buffer.write(id0, true);
            buffer.write('</title>\n    <meta name="description" content="');
            var id1 = scope.resolve(["header", "data", "itemTitle"]);
            buffer.write(id1, true);
            buffer.write('">\n    <meta name="keywords" content="');
            var id2 = scope.resolve(["header", "data", "itemTitle"]);
            buffer.write(id2, true);
            buffer.write('">\n    <link href="http://img.taobaocdn.com/favicon.ico" rel="icon" type="image/x-icon">\n    <link href="http://img.taobaocdn.com/favicon.ico" rel="shortcut icon" type="image/x-icon">\n    <link rel="stylesheet" href="//g.tbcdn.cn/??tb/global/');
            var id3 = scope.resolve(["renderConfig", "globalVersion"]);
            buffer.write(id3, true);
            buffer.write('/global-min.css?t=20130912">\n\n    <script>var g_config={\n        appId: 1,\n        toolbar:false,\n        webww: false\n    };\n    </script>\n    <!--##assets引用的基本配置\n    #set($fbBiz = "detail")\n    #set($fbTag = "20130829")\n    #set($fbPath = $fbPath+\'/tb/item-touch/\'+$detailSwitcher.moduletJsVersion)-->\n    <script>/*! A fix for the iOS orientationchange zoom bug. Script by @scottjehl, rebound by @wilto.MIT / GPLv2 License.*/(function(a){function m(){d.setAttribute("content",g),h=!0}function n(){d.setAttribute("content",f),h=!1}function o(b){l=b.accelerationIncludingGravity,i=Math.abs(l.x),j=Math.abs(l.y),k=Math.abs(l.z),(!a.orientation||a.orientation===180)&&(i>7||(k>6&&j<8||k<8&&j>6)&&i>5)?h&&n():h||m()}var b=navigator.userAgent;if(!(/iPhone|iPad|iPod/.test(navigator.platform)&&/OS [1-5]_[0-9_]* like Mac OS X/i.test(b)&&b.indexOf("AppleWebKit")>-1))return;var c=a.document;if(!c.querySelector)return;var d=c.querySelector("meta[name=viewport]"),e=d&&d.getAttribute("content"),f=e+",maximum-scale=1",g=e+",maximum-scale=10",h=!0,i,j,k,l;if(!d)return;a.addEventListener("orientationchange",m,!1),a.addEventListener("devicemotion",o,!1)})(this);</script>\n</head>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});