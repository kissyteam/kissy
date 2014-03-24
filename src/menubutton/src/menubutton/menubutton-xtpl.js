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
            buffer.write('');
            var option0 = {};
            var params1 = [];
            params1.push('component/extension/content-xtpl');
            option0.params = params1;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                option0.params[0] = moduleWrap.resolveByName(option0.params[0]);
            }
            var commandRet2 = includeCommand.call(engine, scope, option0, buffer, 1, payload);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, false);
            buffer.write('\n<div class="');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('dropdown');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('">\n    <div class="');
            var option6 = {
                escape: 1
            };
            var params7 = [];
            params7.push('dropdown-inner');
            option6.params = params7;
            var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
            if (commandRet8 && commandRet8.isBuffer) {
                buffer = commandRet8;
                commandRet8 = undefined;
            }
            buffer.write(commandRet8, true);
            buffer.write('">\n    </div>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});