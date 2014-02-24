/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        return function (scope, S, payload, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                renderOutputUtil = utils.renderOutput,
                getPropertyUtil = utils.getProperty,
                runInlineCommandUtil = utils.runInlineCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands.with,
                ifCommand = nativeCommands.
            if, setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
            buffer += '';
            var id0 = scope.resolve(["a"]);
            buffer += renderOutputUtil(id0, true);
            buffer += '';
            var config2 = {};
            var params3 = [];
            params3.push('./b-xtpl');
            config2.params = params3;
            if (moduleWrap) {
                require("./b-xtpl");
                config2.params[0] = moduleWrap.resolveByName(config2.params[0]);
            }
            var id1 = includeCommand.call(engine, scope, config2, payload);
            buffer += renderOutputUtil(id1, true);
            return buffer;
        };
});