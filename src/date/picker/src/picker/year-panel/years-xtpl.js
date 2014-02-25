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
            var id2 = scope.resolve(["years"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var option3 = {};
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve("years." + id6 + "");
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n    <td role="gridcell"\n        title="';
                    var id7 = scope.resolve(["title"]);
                    buffer += escapeHtml(id7);
                    buffer += '"\n        class="';
                    var option9 = {};
                    var params10 = [];
                    params10.push('cell');
                    option9.params = params10;
                    var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 6);
                    buffer += escapeHtml(id8);
                    buffer += '\n        ';
                    var option11 = {};
                    var params12 = [];
                    var id13 = scope.resolve(["content"]);
                    var id14 = scope.resolve(["year"]);
                    params12.push(id13 === id14);
                    option11.params = params12;
                    option11.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var option16 = {};
                        var params17 = [];
                        params17.push('selected-cell');
                        option16.params = params17;
                        var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 8);
                        buffer += escapeHtml(id15);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += ifCommand.call(engine, scope, option11, payload);
                    buffer += '\n        ';
                    var option18 = {};
                    var params19 = [];
                    var id20 = scope.resolve(["content"]);
                    var id21 = scope.resolve(["startYear"]);
                    params19.push(id20 < id21);
                    option18.params = params19;
                    option18.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var option23 = {};
                        var params24 = [];
                        params24.push('last-decade-cell');
                        option23.params = params24;
                        var id22 = callCommandUtil(engine, scope, option23, "getBaseCssClasses", 11);
                        buffer += escapeHtml(id22);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += ifCommand.call(engine, scope, option18, payload);
                    buffer += '\n        ';
                    var option25 = {};
                    var params26 = [];
                    var id27 = scope.resolve(["content"]);
                    var id28 = scope.resolve(["endYear"]);
                    params26.push(id27 > id28);
                    option25.params = params26;
                    option25.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var option30 = {};
                        var params31 = [];
                        params31.push('next-decade-cell');
                        option30.params = params31;
                        var id29 = callCommandUtil(engine, scope, option30, "getBaseCssClasses", 14);
                        buffer += escapeHtml(id29);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += ifCommand.call(engine, scope, option25, payload);
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           class="';
                    var option33 = {};
                    var params34 = [];
                    params34.push('year');
                    option33.params = params34;
                    var id32 = callCommandUtil(engine, scope, option33, "getBaseCssClasses", 19);
                    buffer += escapeHtml(id32);
                    buffer += '">\n            ';
                    var id35 = scope.resolve(["content"]);
                    buffer += escapeHtml(id35);
                    buffer += '\n        </a>\n    </td>\n    ';
                    return buffer;
                };
                buffer += eachCommand.call(engine, scope, option3, payload);
                buffer += '\n</tr>\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option0, payload);
            return buffer;
        };
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/date/picker/src/picker/year-panel/years.xtpl.html";
return t;
});