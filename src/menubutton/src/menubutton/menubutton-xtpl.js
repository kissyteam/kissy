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
            var option1 = {};
            var params2 = [];
            params2.push('component/extension/content-xtpl');
            option1.params = params2;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                option1.params[0] = moduleWrap.resolveByName(option1.params[0]);
            }
            var id0 = includeCommand.call(engine, scope, option1, payload);
            if (id0 || id0 === 0) {
                buffer += id0;
            }
            buffer += '\n<div class="';
            var option4 = {};
            var params5 = [];
            params5.push('dropdown');
            option4.params = params5;
            var id3 = callCommandUtil(engine, scope, option4, "getBaseCssClasses", 2);
            buffer += escapeHtml(id3);
            buffer += '">\n    <div class="';
            var option7 = {};
            var params8 = [];
            params8.push('dropdown-inner');
            option7.params = params8;
            var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 3);
            buffer += escapeHtml(id6);
            buffer += '">\n    </div>\n</div>';
            return buffer;
        };
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/menubutton/src/menubutton/menubutton.xtpl.html";
return t;
});