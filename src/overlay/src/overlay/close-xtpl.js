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
            var id2 = scope.resolve(["closable"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<a href="javascript:void(\'close\')"\n   id="ks-overlay-close-';
                var id3 = scope.resolve(["id"]);
                buffer += escapeHtml(id3);
                buffer += '"\n   class="';
                var option5 = {};
                var params6 = [];
                params6.push('close');
                option5.params = params6;
                var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 4);
                buffer += escapeHtml(id4);
                buffer += '"\n   role=\'button\'>\n    <span class="';
                var option8 = {};
                var params9 = [];
                params9.push('close-x');
                option8.params = params9;
                var id7 = callCommandUtil(engine, scope, option8, "getBaseCssClasses", 6);
                buffer += escapeHtml(id7);
                buffer += '">close</span>\n</a>\n';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option0, payload);
            buffer += '\n';
            return buffer;
        };
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/overlay/src/overlay/close.xtpl.html";
return t;
});