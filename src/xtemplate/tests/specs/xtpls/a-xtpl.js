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
            var id0 = scope.resolve(["a"]);
            buffer.write(id0, true);
            buffer.write('');
            var option1 = {};
            var params2 = [];
            params2.push('./b-xtpl');
            option1.params = params2;
            option1.escape = true;
            if (moduleWrap) {
                require("./b-xtpl");
                option1.params[0] = moduleWrap.resolveByName(option1.params[0]);
            }
            buffer = includeCommand.call(engine, scope, option1, buffer, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});