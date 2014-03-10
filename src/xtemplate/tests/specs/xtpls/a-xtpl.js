/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, payload, undefined) {
            var buffer = "",
                engine = this,
                moduleWrap, escapeHtml = S.escapeHtml,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var callCommandUtil = utils.callCommand,
                debuggerCommand = nativeCommands["debugger"],
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro;
            buffer += '';
            var id0 = scope.resolve(["a"]);
            buffer += escapeHtml(id0);
            buffer += '';
            var option2 = {};
            var params3 = [];
            params3.push('./b-xtpl');
            option2.params = params3;
            if (moduleWrap) {
                require("./b-xtpl");
                option2.params[0] = moduleWrap.resolveByName(option2.params[0]);
            }
            var id1 = includeCommand.call(engine, scope, option2, payload);
            buffer += escapeHtml(id1);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});