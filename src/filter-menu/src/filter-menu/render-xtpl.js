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
            buffer.write('<div class="');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('input-wrap');
            option0.params = params1;
            var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('">\r\n    <div class="');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('placeholder');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('">\r\n        ');
            var id6 = scope.resolve(["placeholder"]);
            buffer.write(id6, true);
            buffer.write('\r\n    </div>\r\n    <input class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('input');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 5);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('"\r\n            autocomplete="off"/>\r\n</div>\r\n');
            var option10 = {};
            var params11 = [];
            params11.push('component/extension/content-xtpl');
            option10.params = params11;
            require("component/extension/content-xtpl");
            option10.params[0] = module.resolve(option10.params[0]);
            var commandRet12 = includeCommand.call(engine, scope, option10, buffer, 8, payload);
            if (commandRet12 && commandRet12.isBuffer) {
                buffer = commandRet12;
                commandRet12 = undefined;
            }
            buffer.write(commandRet12, false);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});