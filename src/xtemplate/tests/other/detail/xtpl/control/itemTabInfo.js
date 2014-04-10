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
            buffer.write('<!--商品概要-->\n<div class="mod-item-title mod-item-title-h1">');
            var id0 = scope.resolve(["itemTabInfo", "data", "itemTitle"]);
            buffer.write(id0, true);
            buffer.write('</div>\n\n<section class="pg-index">\n    <!--主图-->\n    <div class="pg-index-col1">\n        <!--焦点大图-->\n        ');
            var option1 = {};
            var params2 = [];
            params2.push('./itemPic');
            option1.params = params2;
            require("./itemPic");
            option1.params[0] = module.resolve(option1.params[0]);
            var commandRet3 = includeCommand.call(engine, scope, option1, buffer, 8, payload);
            if (commandRet3 && commandRet3.isBuffer) {
                buffer = commandRet3;
                commandRet3 = undefined;
            }
            buffer.write(commandRet3, false);
            buffer.write('\n    </div>\n    <!--主图 end-->\n\n    <!-- 宝贝信息-->\n    <div class="pg-index-col2" id="J_property">\n        <div class="mod-property">\n            ');
            var option4 = {};
            var params5 = [];
            params5.push('./itemPrice');
            option4.params = params5;
            require("./itemPrice");
            option4.params[0] = module.resolve(option4.params[0]);
            var commandRet6 = includeCommand.call(engine, scope, option4, buffer, 15, payload);
            if (commandRet6 && commandRet6.isBuffer) {
                buffer = commandRet6;
                commandRet6 = undefined;
            }
            buffer.write(commandRet6, false);
            buffer.write('\n            <!--店铺信息-->\n            ');
            var option7 = {};
            var params8 = [];
            params8.push('./shopInfo');
            option7.params = params8;
            require("./shopInfo");
            option7.params[0] = module.resolve(option7.params[0]);
            var commandRet9 = includeCommand.call(engine, scope, option7, buffer, 17, payload);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, false);
            buffer.write('\n        </div>\n    </div>\n    <!-- 宝贝信息 end-->\n\n</section>\n<!--商品概要 end-->\n\n<script>\n    KISSY.use("detail/mod", function(S,Mod) {\n        Mod.add({\n            name:"detail/maininfo/",\n            data:{\n                panel:"#J_property"\n            }\n        });\n    });\n</script>\n\n\n');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});