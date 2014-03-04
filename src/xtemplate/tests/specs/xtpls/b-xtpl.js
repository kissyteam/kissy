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
            var option0 = {};
            var params1 = [];
            var id2 = scope.resolve(["b"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope) {
                var buffer = "";
                buffer += '';
                var id3 = scope.resolve(["c"]);
                buffer += escapeHtml(id3);
                buffer += '';
                var id4 = scope.resolve(["d"], 1);
                buffer += escapeHtml(id4);
                buffer += '';
                return buffer;
            };
            buffer += withCommand.call(engine, scope, option0, payload);
            return buffer;
        };
t.TPL_NAME = "e:/code/kissy_git/kissy/kissy/src/xtemplate/tests/specs/xtpls/b-xtpl.html";
return t;
});