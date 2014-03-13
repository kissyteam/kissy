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
            buffer += '<div class="';
            var option1 = {};
            var params2 = [];
            params2.push('header');
            option1.params = params2;
            var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
            buffer += escapeHtml(id0);
            buffer += '">\n    <a id="ks-date-picker-month-panel-previous-year-btn-';
            var id3 = scope.resolve(["id"]);
            buffer += escapeHtml(id3);
            buffer += '"\n       class="';
            var option5 = {};
            var params6 = [];
            params6.push('prev-year-btn');
            option5.params = params6;
            var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
            buffer += escapeHtml(id4);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id7 = scope.resolve(["previousYearLabel"]);
            buffer += escapeHtml(id7);
            buffer += '"\n       hidefocus="on">\n    </a>\n\n\n        <a class="';
            var option9 = {};
            var params10 = [];
            params10.push('year-select');
            option9.params = params10;
            var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 11);
            buffer += escapeHtml(id8);
            buffer += '"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="';
            var id11 = scope.resolve(["yearSelectLabel"]);
            buffer += escapeHtml(id11);
            buffer += '"\n           id="ks-date-picker-month-panel-year-select-';
            var id12 = scope.resolve(["id"]);
            buffer += escapeHtml(id12);
            buffer += '">\n            <span id="ks-date-picker-month-panel-year-select-content-';
            var id13 = scope.resolve(["id"]);
            buffer += escapeHtml(id13);
            buffer += '">';
            var id14 = scope.resolve(["year"]);
            buffer += escapeHtml(id14);
            buffer += '</span>\n            <span class="';
            var option16 = {};
            var params17 = [];
            params17.push('year-select-arrow');
            option16.params = params17;
            var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 18);
            buffer += escapeHtml(id15);
            buffer += '">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-';
            var id18 = scope.resolve(["id"]);
            buffer += escapeHtml(id18);
            buffer += '"\n       class="';
            var option20 = {};
            var params21 = [];
            params21.push('next-year-btn');
            option20.params = params21;
            var id19 = callCommandUtil(engine, scope, option20, "getBaseCssClasses", 22);
            buffer += escapeHtml(id19);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id22 = scope.resolve(["nextYearLabel"]);
            buffer += escapeHtml(id22);
            buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
            var option24 = {};
            var params25 = [];
            params25.push('body');
            option24.params = params25;
            var id23 = callCommandUtil(engine, scope, option24, "getBaseCssClasses", 29);
            buffer += escapeHtml(id23);
            buffer += '">\n    <table class="';
            var option27 = {};
            var params28 = [];
            params28.push('table');
            option27.params = params28;
            var id26 = callCommandUtil(engine, scope, option27, "getBaseCssClasses", 30);
            buffer += escapeHtml(id26);
            buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-';
            var id29 = scope.resolve(["id"]);
            buffer += escapeHtml(id29);
            buffer += '">\n        ';
            var option31 = {};
            var params32 = [];
            params32.push('date/picker/month-panel/months-xtpl');
            option31.params = params32;
            if (moduleWrap) {
                require("date/picker/month-panel/months-xtpl");
                option31.params[0] = moduleWrap.resolveByName(option31.params[0]);
            }
            var id30 = includeCommand.call(engine, scope, option31, payload);
            if (id30 || id30 === 0) {
                buffer += id30;
            }
            buffer += '\n        </tbody>\n    </table>\n</div>';
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});