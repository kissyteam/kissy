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
            buffer.write('');
            var id0 = scope.resolve(["a"]);
            buffer.write(id0, true);
            buffer.write('');
            var option1 = {
                escape: 1
            };
            var params2 = [];
            params2.push('./b-xtpl');
            option1.params = params2;
            require("./b-xtpl");
            option1.params[0] = module.resolve(option1.params[0]);
            var commandRet3 = includeCommand.call(engine, scope, option1, buffer, 1, payload);
            if (commandRet3 && commandRet3.isBuffer) {
                buffer = commandRet3;
                commandRet3 = undefined;
            }
            buffer.write(commandRet3, true);
            buffer.write('');
            var option4 = {
                escape: 1
            };
            var params5 = [];
            var id6 = scope.resolve(["x"]);
            params5.push(id6);
            option4.params = params5;
            option4.fn = function (scope, buffer) {

                buffer.write('');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option4, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});