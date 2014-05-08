/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemTabInfo = function (scope, buffer, session, undefined) {
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
            buffer.write('<!--商品概要-->\r\n<div class="mod-item-title mod-item-title-h1">', 0);
            var id0 = scope.resolve(["itemTabInfo", "data", "itemTitle"], 0);
            buffer.write(id0, true);
            buffer.write('</div>\r\n\r\n<section class="pg-index">\r\n    <!--主图-->\r\n    <div class="pg-index-col1">\r\n        <!--焦点大图-->\r\n        ', 0);
            var option1 = {};
            var params2 = [];
            params2.push('./itemPic');
            option1.params = params2;
            require("./itemPic");
            var callRet3
            callRet3 = includeCommand.call(engine, scope, option1, buffer, 8, session);
            if (callRet3 && callRet3.isBuffer) {
                buffer = callRet3;
                callRet3 = undefined;
            }
            buffer.write(callRet3, false);
            buffer.write('\r\n    </div>\r\n    <!--主图 end-->\r\n\r\n    <!-- 宝贝信息-->\r\n    <div class="pg-index-col2" id="J_property">\r\n        <div class="mod-property">\r\n            ', 0);
            var option4 = {};
            var params5 = [];
            params5.push('./itemPrice');
            option4.params = params5;
            require("./itemPrice");
            var callRet6
            callRet6 = includeCommand.call(engine, scope, option4, buffer, 15, session);
            if (callRet6 && callRet6.isBuffer) {
                buffer = callRet6;
                callRet6 = undefined;
            }
            buffer.write(callRet6, false);
            buffer.write('\r\n            <!--店铺信息-->\r\n            ', 0);
            var option7 = {};
            var params8 = [];
            params8.push('./shopInfo');
            option7.params = params8;
            require("./shopInfo");
            var callRet9
            callRet9 = includeCommand.call(engine, scope, option7, buffer, 17, session);
            if (callRet9 && callRet9.isBuffer) {
                buffer = callRet9;
                callRet9 = undefined;
            }
            buffer.write(callRet9, false);
            buffer.write('\r\n        </div>\r\n    </div>\r\n    <!-- 宝贝信息 end-->\r\n\r\n</section>\r\n<!--商品概要 end-->\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.add({\r\n            name:"detail/maininfo/",\r\n            data:{\r\n                panel:"#J_property"\r\n            }\r\n        });\r\n    });\r\n</script>\r\n\r\n\r\n', 0);
            return buffer;
        };
itemTabInfo.TPL_NAME = module.name;
return itemTabInfo
});