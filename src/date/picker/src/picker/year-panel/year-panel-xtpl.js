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
            params2.push('header');
            option1.params = params2;
            var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
            buffer += escapeHtml(id0);
            buffer += '">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-';
            var id3 = scope.resolve(["id"]);
            buffer += escapeHtml(id3);
            buffer += '"\n       class="';
            var option5 = {};
            var params6 = [];
            params6.push('prev-decade-btn');
            option5.params = params6;
            var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
            buffer += escapeHtml(id4);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id7 = scope.resolve(["previousDecadeLabel"]);
            buffer += escapeHtml(id7);
            buffer += '"\n       hidefocus="on">\n    </a>\n\n    <a class="';
            var option9 = {};
            var params10 = [];
            params10.push('decade-select');
            option9.params = params10;
            var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 10);
            buffer += escapeHtml(id8);
            buffer += '"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="';
            var id11 = scope.resolve(["decadeSelectLabel"]);
            buffer += escapeHtml(id11);
            buffer += '"\n       id="ks-date-picker-year-panel-decade-select-';
            var id12 = scope.resolve(["id"]);
            buffer += escapeHtml(id12);
            buffer += '">\n            <span id="ks-date-picker-year-panel-decade-select-content-';
            var id13 = scope.resolve(["id"]);
            buffer += escapeHtml(id13);
            buffer += '">\n                ';
            var id14 = scope.resolve(["startYear"]);
            buffer += escapeHtml(id14);
            buffer += '-';
            var id15 = scope.resolve(["endYear"]);
            buffer += escapeHtml(id15);
            buffer += '\n            </span>\n        <span class="';
            var option17 = {};
            var params18 = [];
            params18.push('decade-select-arrow');
            option17.params = params18;
            var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 19);
            buffer += escapeHtml(id16);
            buffer += '">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-';
            var id19 = scope.resolve(["id"]);
            buffer += escapeHtml(id19);
            buffer += '"\n       class="';
            var option21 = {};
            var params22 = [];
            params22.push('next-decade-btn');
            option21.params = params22;
            var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 23);
            buffer += escapeHtml(id20);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id23 = scope.resolve(["nextDecadeLabel"]);
            buffer += escapeHtml(id23);
            buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
            var option25 = {};
            var params26 = [];
            params26.push('body');
            option25.params = params26;
            var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 30);
            buffer += escapeHtml(id24);
            buffer += '">\n    <table class="';
            var option28 = {};
            var params29 = [];
            params29.push('table');
            option28.params = params29;
            var id27 = callCommandUtil(engine, scope, option28, "getBaseCssClasses", 31);
            buffer += escapeHtml(id27);
            buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-';
            var id30 = scope.resolve(["id"]);
            buffer += escapeHtml(id30);
            buffer += '">\n        ';
            var option32 = {};
            var params33 = [];
            params33.push('date/picker/year-panel/years-xtpl');
            option32.params = params33;
            if (moduleWrap) {
                require("date/picker/year-panel/years-xtpl");
                option32.params[0] = moduleWrap.resolveByName(option32.params[0]);
            }
            var id31 = includeCommand.call(engine, scope, option32, payload);
            if (id31 || id31 === 0) {
                buffer += id31;
            }
            buffer += '\n        </tbody>\n    </table>\n</div>';
            return buffer;
        };
    t.TPL_NAME = module.name;
    return t;
});