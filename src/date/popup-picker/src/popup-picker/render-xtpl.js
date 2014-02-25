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
            buffer += '<div class="';
            var option1 = {};
            var params2 = [];
            params2.push('content');
            option1.params = params2;
            var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
            buffer += escapeHtml(id0);
            buffer += '">\n    ';
            var option4 = {};
            var params5 = [];
            params5.push('date/picker-xtpl');
            option4.params = params5;
            if (moduleWrap) {
                require("date/picker-xtpl");
                option4.params[0] = moduleWrap.resolveByName(option4.params[0]);
            }
            var id3 = includeCommand.call(engine, scope, option4, payload);
            if (id3 || id3 === 0) {
                buffer += id3;
            }
            buffer += '\n</div>';
            return buffer;
        };
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/date/popup-picker/src/popup-picker/render.xtpl.html";
return t;
});