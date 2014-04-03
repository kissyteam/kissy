/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, buffer, payload, undefined) {
            var engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
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
            buffer.write('\n<!doctype html>\n\n<html>\n');
            var option0 = {};
            var params1 = [];
            params1.push('../control/header');
            option0.params = params1;
            if (moduleWrap) {
                require("../control/header");
                option0.params[0] = moduleWrap.resolve(option0.params[0]);
            }
            var commandRet2 = includeCommand.call(engine, scope, option0, buffer, 5, payload);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, false);
            buffer.write('\n<body data-spm="6792737">\n');
            var option3 = {};
            var params4 = [];
            params4.push('../control/vData');
            option3.params = params4;
            if (moduleWrap) {
                require("../control/vData");
                option3.params[0] = moduleWrap.resolve(option3.params[0]);
            }
            var commandRet5 = includeCommand.call(engine, scope, option3, buffer, 7, payload);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, false);
            buffer.write('\n\n\n');
            var option6 = {
                escape: 1
            };
            var params7 = [];
            var id8 = scope.resolve(["renderConfig"]);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope, buffer) {

                buffer.write('\n\n');
                var option9 = {
                    escape: 1
                };
                var hash10 = {};
                var id11 = scope.resolve(["assetsPath"]);
                var exp13 = id11;
                var id12 = scope.resolve(["assetsVersion"]);
                exp13 = (id11) + (id12);
                hash10["path"] = exp13;
                option9.hash = hash10;
                var commandRet14 = setCommand.call(engine, scope, option9, buffer, 12, payload);
                if (commandRet14 && commandRet14.isBuffer) {
                    buffer = commandRet14;
                    commandRet14 = undefined;
                }
                buffer.write(commandRet14, true);
                buffer.write('\n\n<script src="');
                var id15 = scope.resolve(["assetsHost"]);
                buffer.write(id15, true);
                buffer.write('/??kissy/k/1.4.0/seed-min.js,kissy/k/1.4.0/promise-min.js,kissy/k/1.4.0/import-style-min.js,tb/global/');
                var id16 = scope.resolve(["globalVersion"]);
                buffer.write(id16, true);
                buffer.write('/global-min.js,');
                var id17 = scope.resolve(["path"]);
                buffer.write(id17, true);
                buffer.write('/detail/alias.js,');
                var id18 = scope.resolve(["path"]);
                buffer.write(id18, true);
                buffer.write('/deps.js,');
                var id19 = scope.resolve(["path"]);
                buffer.write(id19, true);
                buffer.write('/detail/mod.js,');
                var id20 = scope.resolve(["path"]);
                buffer.write(id20, true);
                buffer.write('/detail/page/bigpipe.js?t=20130912" charset="utf-8" data-config="{combine:true}"></script>\n\n<script>\n    KISSY.config({\n        packages: {\n            detail: {\n                debug:true,\n                path: \'');
                var id21 = scope.resolve(["assetsHost"]);
                buffer.write(id21, true);
                buffer.write('');
                var id22 = scope.resolve(["assetsPath"]);
                buffer.write(id22, true);
                buffer.write('');
                var id23 = scope.resolve(["assetsVersion"]);
                buffer.write(id23, true);
                buffer.write('/\',\n                combine:true,//!(~location.href.indexOf("ks-debug")),\n                tag: \'20130829\',\n                name: \'detail\',\n                charset: \'utf-8\'\n            }\n        }\n    });\n    if(g_config.vdata.viewer.dt =="phone"){\n        KISSY.importStyle(\'detail/frame/phone,detail/footer/phone,detail/gallery/phone,detail/shop/phone,detail/sku/index,detail/maininfo/phone,detail/page/index,detail/describe/phone\');\n    }else{\n        KISSY.importStyle(\'detail/frame/pad,detail/footer/pad,detail/gallery/pad,detail/shop/pad,detail/sku/index,detail/maininfo/pad,detail/page/index,detail/describe/pad\');\n    }\n</script>\n');

                return buffer;
            };
            buffer = withCommand.call(engine, scope, option6, buffer, 10, payload);
            buffer.write('\n\n<div id="J_Pages" class="pages-panel">\n    <div class="J_Pages-home pages-item-index" data-page="index">\n        ');
            var option24 = {};
            var params25 = [];
            params25.push('../control/tabs');
            option24.params = params25;
            if (moduleWrap) {
                require("../control/tabs");
                option24.params[0] = moduleWrap.resolve(option24.params[0]);
            }
            var commandRet26 = includeCommand.call(engine, scope, option24, buffer, 39, payload);
            if (commandRet26 && commandRet26.isBuffer) {
                buffer = commandRet26;
                commandRet26 = undefined;
            }
            buffer.write(commandRet26, false);
            buffer.write('\n        ');
            var option27 = {};
            var params28 = [];
            params28.push('../control/footer');
            option27.params = params28;
            if (moduleWrap) {
                require("../control/footer");
                option27.params[0] = moduleWrap.resolve(option27.params[0]);
            }
            var commandRet29 = includeCommand.call(engine, scope, option27, buffer, 40, payload);
            if (commandRet29 && commandRet29.isBuffer) {
                buffer = commandRet29;
                commandRet29 = undefined;
            }
            buffer.write(commandRet29, false);
            buffer.write('\n    </div>\n</div>\n\n');
            var option30 = {};
            var params31 = [];
            params31.push('../control/config');
            option30.params = params31;
            if (moduleWrap) {
                require("../control/config");
                option30.params[0] = moduleWrap.resolve(option30.params[0]);
            }
            var commandRet32 = includeCommand.call(engine, scope, option30, buffer, 44, payload);
            if (commandRet32 && commandRet32.isBuffer) {
                buffer = commandRet32;
                commandRet32 = undefined;
            }
            buffer.write(commandRet32, false);
            buffer.write('\n');
            var option33 = {};
            var params34 = [];
            params34.push('../control/activity');
            option33.params = params34;
            if (moduleWrap) {
                require("../control/activity");
                option33.params[0] = moduleWrap.resolve(option33.params[0]);
            }
            var commandRet35 = includeCommand.call(engine, scope, option33, buffer, 45, payload);
            if (commandRet35 && commandRet35.isBuffer) {
                buffer = commandRet35;
                commandRet35 = undefined;
            }
            buffer.write(commandRet35, false);
            buffer.write('\n<script>\n    KISSY.use("detail/mod", function(S,Mod){\n        Mod.add({\n            name:"detail/page/"\n        });\n        Mod.data("vdata",window["g_config"].vdata);\n        Mod.exec();\n    });\n</script>\n\n</body>\n</html>\n');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});