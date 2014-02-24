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
            var config0 = {};
            var params1 = [];
            var id2 = scope.resolve(["b"]);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '';
                var id3 = scope.resolve(["c"]);
                buffer += renderOutputUtil(id3, true);
                buffer += '';
                var id4 = scope.resolve(["d"], 1);
                buffer += renderOutputUtil(id4, true);
                buffer += '';
                return buffer;
            };
            buffer += withCommand.call(engine, scope, config0, payload);
            return buffer;
        };
});