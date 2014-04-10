/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
            buffer.write('<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="gbk">\n    <link rel="stylesheet" href="http://a.tbcdn.cn/??p/global/1.0/global-min.css?t=2013060820100214.css" />\n</head>\n<body>\n<style>\n    body{background-color: #fff;}\n    .pg-404 {\n        position: absolute;\n        top:50%;\n        left:50%;\n        background-repeat: no-repeat;\n    }\n    .pg-404 .msg{\n        padding:60px;\n        background-color: #eee;\n        border-radius: 10px;\n    }\n\n    @media screen and (min-width: 1024px) {\n        .pg-404 {\n            padding-left: 200px;\n            background-image: url(http://gtms01.alicdn.com/tps/i1/T1WKGKFdRaXXa1ifwv-430-430.png);\n            background-position:0 0 ;\n            background-size:150px 150px;\n            margin:-80px 0 0 -520px;\n        }\n        .pg-404 .msg {\n            width:700px;\n            font-size:24px;\n        }\n    }\n    @media screen and (min-width:760px) and (max-width:1023px){\n        .pg-404 {\n            padding-left: 200px;\n            background-image: url(http://gtms01.alicdn.com/tps/i1/T1WKGKFdRaXXa1ifwv-430-430.png);\n            background-position:0 0 ;\n            background-size:150px 150px;\n            margin:-80px 0 0 -370px;\n        }\n        .pg-404 .msg {\n            width:400px;\n            font-size:24px;\n        }\n    }\n\n\n    @media screen and (max-width: 759px) {\n        .pg-404 {\n            padding-top: 180px;\n            background-image: url(http://gtms01.alicdn.com/tps/i1/T1hv9KFk8aXXX7N_Yg-141-141.png);\n            background-position:0 0 ;\n            background-size:150px 150px;\n            background-position: top center;\n            margin:-160px 0 0 -130px;\n        }\n        .pg-404 .msg {\n            width:200px;\n            padding:30px;\n            font-size:16px;\n        }\n    }\n</style>\n\n<div class="pg-404">\n    <div class="msg">�ܱ�Ǹ�����鿴�ı��������ڣ��������¼ܻ��߱��Ƴ�</div>\n</div>\n</body>\n</html>\n');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});