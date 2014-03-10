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
            var id2 = scope.resolve(["withTitle"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope) {
                var buffer = "";
                buffer += '\r\n<div class="';
                var option4 = {};
                var params5 = [];
                params5.push('title-wrap');
                option4.params = params5;
                var id3 = callCommandUtil(engine, scope, option4, "getBaseCssClasses", 2);
                buffer += escapeHtml(id3);
                buffer += '">\r\n    <div class="';
                var option7 = {};
                var params8 = [];
                params8.push('title');
                option7.params = params8;
                var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 3);
                buffer += escapeHtml(id6);
                buffer += '" id="ks-navigation-bar-title-';
                var id9 = scope.resolve(["id"]);
                buffer += escapeHtml(id9);
                buffer += '">';
                var id10 = scope.resolve(["title"]);
                buffer += escapeHtml(id10);
                buffer += '</div>\r\n</div>\r\n';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option0, payload);
            buffer += '\r\n<div class="';
            var option12 = {};
            var params13 = [];
            params13.push('content');
            option12.params = params13;
            var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 6);
            buffer += escapeHtml(id11);
            buffer += '" id="ks-navigation-bar-content-';
            var id14 = scope.resolve(["id"]);
            buffer += escapeHtml(id14);
            buffer += '">\r\n    <div class="';
            var option16 = {};
            var params17 = [];
            params17.push('center');
            option16.params = params17;
            var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 7);
            buffer += escapeHtml(id15);
            buffer += '" id="ks-navigation-bar-center-';
            var id18 = scope.resolve(["id"]);
            buffer += escapeHtml(id18);
            buffer += '"></div>\r\n</div>';
            return buffer;
        };
t.TPL_NAME = "navigation-view/sub-modules/bar/src/bar/bar.xtpl.html";
return t;
});