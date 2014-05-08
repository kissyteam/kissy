/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var noitem = function (scope, buffer, session, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            var callFnUtil = utils["callFn"],
                callCommandUtil = utils["callCommand"],
                eachCommand = nativeCommands["each"],
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands["set"],
                includeCommand = nativeCommands["include"],
                parseCommand = nativeCommands["parse"],
                extendCommand = nativeCommands["extend"],
                blockCommand = nativeCommands["block"],
                macroCommand = nativeCommands["macro"],
                debuggerCommand = nativeCommands["debugger"];
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            buffer.write('<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <meta charset="gbk">\r\n    <link rel="stylesheet" href="http://a.tbcdn.cn/??p/global/1.0/global-min.css?t=2013060820100214.css" />\r\n</head>\r\n<body>\r\n<style>\r\n    body{background-color: #fff;}\r\n    .pg-404 {\r\n        position: absolute;\r\n        top:50%;\r\n        left:50%;\r\n        background-repeat: no-repeat;\r\n    }\r\n    .pg-404 .msg{\r\n        padding:60px;\r\n        background-color: #eee;\r\n        border-radius: 10px;\r\n    }\r\n\r\n    @media screen and (min-width: 1024px) {\r\n        .pg-404 {\r\n            padding-left: 200px;\r\n            background-image: url(http://gtms01.alicdn.com/tps/i1/T1WKGKFdRaXXa1ifwv-430-430.png);\r\n            background-position:0 0 ;\r\n            background-size:150px 150px;\r\n            margin:-80px 0 0 -520px;\r\n        }\r\n        .pg-404 .msg {\r\n            width:700px;\r\n            font-size:24px;\r\n        }\r\n    }\r\n    @media screen and (min-width:760px) and (max-width:1023px){\r\n        .pg-404 {\r\n            padding-left: 200px;\r\n            background-image: url(http://gtms01.alicdn.com/tps/i1/T1WKGKFdRaXXa1ifwv-430-430.png);\r\n            background-position:0 0 ;\r\n            background-size:150px 150px;\r\n            margin:-80px 0 0 -370px;\r\n        }\r\n        .pg-404 .msg {\r\n            width:400px;\r\n            font-size:24px;\r\n        }\r\n    }\r\n\r\n\r\n    @media screen and (max-width: 759px) {\r\n        .pg-404 {\r\n            padding-top: 180px;\r\n            background-image: url(http://gtms01.alicdn.com/tps/i1/T1hv9KFk8aXXX7N_Yg-141-141.png);\r\n            background-position:0 0 ;\r\n            background-size:150px 150px;\r\n            background-position: top center;\r\n            margin:-160px 0 0 -130px;\r\n        }\r\n        .pg-404 .msg {\r\n            width:200px;\r\n            padding:30px;\r\n            font-size:16px;\r\n        }\r\n    }\r\n</style>\r\n\r\n<div class="pg-404">\r\n    <div class="msg">�ܱ�Ǹ�����鿴�ı��������ڣ��������¼ܻ��߱��Ƴ�</div>\r\n</div>\r\n</body>\r\n</html>\r\n', 0);
            return buffer;
        };
noitem.TPL_NAME = module.name;
return noitem
});