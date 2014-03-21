/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, payload, undefined) {
            var buffer = "",
                engine = this,
                moduleWrap, escapeHtml = S.escapeHtml,
                nativeCommands = engine.nativeCommands,
                Util = engine.Util;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var callCommandUtil = Util.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands.with,
                ifCommand = nativeCommands['if'],
                setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
            buffer += '1';
            var option1 = {};
            var params2 = [];
            params2.push('./b-xtpl');
            option1.params = params2;
            if (moduleWrap) {
                require("./b-xtpl");
                option1.params[0] = moduleWrap.resolveByName(option1.params[0]);
            }
            var id0 = includeCommand.call(engine, scope, option1, payload);
            buffer += escapeHtml(id0);
            return buffer;
        };
t.TPL_NAME = "e:/code/kissy_git/kissy/kissy/src/xtemplate/demo/compile-module/a.xtpl.html";
return t;
});