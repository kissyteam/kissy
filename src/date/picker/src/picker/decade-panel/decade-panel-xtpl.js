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
            buffer += '">\n    <a id="ks-date-picker-decade-panel-previous-century-btn-';
            var id3 = scope.resolve(["id"]);
            buffer += escapeHtml(id3);
            buffer += '"\n       class="';
            var option5 = {};
            var params6 = [];
            params6.push('prev-century-btn');
            option5.params = params6;
            var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
            buffer += escapeHtml(id4);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id7 = scope.resolve(["previousCenturyLabel"]);
            buffer += escapeHtml(id7);
            buffer += '"\n       hidefocus="on">\n    </a>\n    <div class="';
            var option9 = {};
            var params10 = [];
            params10.push('century');
            option9.params = params10;
            var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 9);
            buffer += escapeHtml(id8);
            buffer += '"\n         id="ks-date-picker-decade-panel-century-';
            var id11 = scope.resolve(["id"]);
            buffer += escapeHtml(id11);
            buffer += '">\n                ';
            var id12 = scope.resolve(["startYear"]);
            buffer += escapeHtml(id12);
            buffer += '-';
            var id13 = scope.resolve(["endYear"]);
            buffer += escapeHtml(id13);
            buffer += '\n    </div>\n    <a id="ks-date-picker-decade-panel-next-century-btn-';
            var id14 = scope.resolve(["id"]);
            buffer += escapeHtml(id14);
            buffer += '"\n       class="';
            var option16 = {};
            var params17 = [];
            params17.push('next-century-btn');
            option16.params = params17;
            var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 14);
            buffer += escapeHtml(id15);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id18 = scope.resolve(["nextCenturyLabel"]);
            buffer += escapeHtml(id18);
            buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
            var option20 = {};
            var params21 = [];
            params21.push('body');
            option20.params = params21;
            var id19 = callCommandUtil(engine, scope, option20, "getBaseCssClasses", 21);
            buffer += escapeHtml(id19);
            buffer += '">\n    <table class="';
            var option23 = {};
            var params24 = [];
            params24.push('table');
            option23.params = params24;
            var id22 = callCommandUtil(engine, scope, option23, "getBaseCssClasses", 22);
            buffer += escapeHtml(id22);
            buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-decade-panel-tbody-';
            var id25 = scope.resolve(["id"]);
            buffer += escapeHtml(id25);
            buffer += '">\n        ';
            var option27 = {};
            var params28 = [];
            params28.push('date/picker/decade-panel/decades-xtpl');
            option27.params = params28;
            if (moduleWrap) {
                require("date/picker/decade-panel/decades-xtpl");
                option27.params[0] = moduleWrap.resolveByName(option27.params[0]);
            }
            var id26 = includeCommand.call(engine, scope, option27, payload);
            if (id26 || id26 === 0) {
                buffer += id26;
            }
            buffer += '\n        </tbody>\n    </table>\n</div>';
            return buffer;
        };
    t.TPL_NAME = module.name;
    return t;
});