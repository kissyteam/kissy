/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var detail = function (scope, buffer, undefined) {
            var tpl = this,
                nativeCommands = tpl.root.nativeCommands,
                utils = tpl.root.utils;
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
            buffer.write('\r\n<!doctype html>\r\n\r\n<html>\r\n', 0);
            var option0 = {};
            var params1 = [];
            params1.push('../control/header');
            option0.params = params1;
            require("../control/header");
            var callRet2
            callRet2 = includeCommand.call(tpl, scope, option0, buffer, 5);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, false);
            buffer.write('\r\n<body data-spm="6792737">\r\n', 0);
            var option3 = {};
            var params4 = [];
            params4.push('../control/vData');
            option3.params = params4;
            require("../control/vData");
            var callRet5
            callRet5 = includeCommand.call(tpl, scope, option3, buffer, 7);
            if (callRet5 && callRet5.isBuffer) {
                buffer = callRet5;
                callRet5 = undefined;
            }
            buffer.write(callRet5, false);
            buffer.write('\r\n\r\n\r\n', 0);
            var option6 = {
                escape: 1
            };
            var params7 = [];
            var id8 = scope.resolve(["renderConfig"], 0);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope, buffer) {
                buffer.write('\r\n\r\n', 0);
                var option9 = {
                    escape: 1
                };
                var hash10 = {};
                var id11 = scope.resolve(["assetsPath"], 0);
                var exp13 = id11;
                var id12 = scope.resolve(["assetsVersion"], 0);
                exp13 = (id11) + (id12);
                hash10["path"] = exp13;
                option9.hash = hash10;
                var callRet14
                callRet14 = setCommand.call(tpl, scope, option9, buffer, 12);
                if (callRet14 && callRet14.isBuffer) {
                    buffer = callRet14;
                    callRet14 = undefined;
                }
                buffer.write(callRet14, true);
                buffer.write('\r\n\r\n<script src="', 0);
                var id15 = scope.resolve(["assetsHost"], 0);
                buffer.write(id15, true);
                buffer.write('/??kissy/k/1.4.0/seed-min.js,kissy/k/1.4.0/promise-min.js,kissy/k/1.4.0/import-style-min.js,tb/global/', 0);
                var id16 = scope.resolve(["globalVersion"], 0);
                buffer.write(id16, true);
                buffer.write('/global-min.js,', 0);
                var id17 = scope.resolve(["path"], 0);
                buffer.write(id17, true);
                buffer.write('/detail/polyfill.js,', 0);
                var id18 = scope.resolve(["path"], 0);
                buffer.write(id18, true);
                buffer.write('/deps.js,', 0);
                var id19 = scope.resolve(["path"], 0);
                buffer.write(id19, true);
                buffer.write('/detail/mod.js,', 0);
                var id20 = scope.resolve(["path"], 0);
                buffer.write(id20, true);
                buffer.write('/detail/page/bigpipe.js?t=20130912" charset="utf-8" data-config="{combine:true}"></script>\r\n\r\n<script>\r\n    KISSY.config({\r\n        packages: {\r\n            detail: {\r\n                debug:true,\r\n                path: \'', 0);
                var id21 = scope.resolve(["assetsHost"], 0);
                buffer.write(id21, true);
                buffer.write('', 0);
                var id22 = scope.resolve(["assetsPath"], 0);
                buffer.write(id22, true);
                buffer.write('', 0);
                var id23 = scope.resolve(["assetsVersion"], 0);
                buffer.write(id23, true);
                buffer.write('/\',\r\n                combine:true,//!(~location.href.indexOf("ks-debug")),\r\n                tag: \'20130829\',\r\n                name: \'detail\',\r\n                charset: \'utf-8\'\r\n            }\r\n        }\r\n    });\r\n    if(g_config.vdata.viewer.dt =="phone"){\r\n        KISSY.importStyle(\'detail/frame/phone,detail/footer/phone,detail/gallery/phone,detail/shop/phone,detail/sku/index,detail/maininfo/phone,detail/page/index,detail/describe/phone\');\r\n    }else{\r\n        KISSY.importStyle(\'detail/frame/pad,detail/footer/pad,detail/gallery/pad,detail/shop/pad,detail/sku/index,detail/maininfo/pad,detail/page/index,detail/describe/pad\');\r\n    }\r\n</script>\r\n', 0);
                return buffer;
            };
            buffer = withCommand.call(tpl, scope, option6, buffer, 10);
            buffer.write('\r\n\r\n<div id="J_Pages" class="pages-panel">\r\n    <div class="J_Pages-home pages-item-index" data-page="index">\r\n        ', 0);
            var option24 = {};
            var params25 = [];
            params25.push('../control/tabs');
            option24.params = params25;
            require("../control/tabs");
            var callRet26
            callRet26 = includeCommand.call(tpl, scope, option24, buffer, 39);
            if (callRet26 && callRet26.isBuffer) {
                buffer = callRet26;
                callRet26 = undefined;
            }
            buffer.write(callRet26, false);
            buffer.write('\r\n        ', 0);
            var option27 = {};
            var params28 = [];
            params28.push('../control/footer');
            option27.params = params28;
            require("../control/footer");
            var callRet29
            callRet29 = includeCommand.call(tpl, scope, option27, buffer, 40);
            if (callRet29 && callRet29.isBuffer) {
                buffer = callRet29;
                callRet29 = undefined;
            }
            buffer.write(callRet29, false);
            buffer.write('\r\n    </div>\r\n</div>\r\n\r\n', 0);
            var option30 = {};
            var params31 = [];
            params31.push('../control/config');
            option30.params = params31;
            require("../control/config");
            var callRet32
            callRet32 = includeCommand.call(tpl, scope, option30, buffer, 44);
            if (callRet32 && callRet32.isBuffer) {
                buffer = callRet32;
                callRet32 = undefined;
            }
            buffer.write(callRet32, false);
            buffer.write('\r\n', 0);
            var option33 = {};
            var params34 = [];
            params34.push('../control/activity');
            option33.params = params34;
            require("../control/activity");
            var callRet35
            callRet35 = includeCommand.call(tpl, scope, option33, buffer, 45);
            if (callRet35 && callRet35.isBuffer) {
                buffer = callRet35;
                callRet35 = undefined;
            }
            buffer.write(callRet35, false);
            buffer.write('\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod){\r\n        Mod.add({\r\n            name:"detail/page/"\r\n        });\r\n        Mod.data("vdata",window["g_config"].vdata);\r\n        Mod.exec();\r\n    });\r\n</script>\r\n\r\n</body>\r\n</html>\r\n', 0);
            return buffer;
        };
detail.TPL_NAME = module.name;
detail.version = "5.0.0";
return detail
});