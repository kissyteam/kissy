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
            var id2 = scope.resolve(["decades"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var option3 = {};
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve("decades." + id6 + "");
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n    <td role="gridcell"\n        class="';
                    var option8 = {};
                    var params9 = [];
                    params9.push('cell');
                    option8.params = params9;
                    var id7 = callCommandUtil(engine, scope, option8, "getBaseCssClasses", 5);
                    buffer += escapeHtml(id7);
                    buffer += '\n        ';
                    var option10 = {};
                    var params11 = [];
                    var id12 = scope.resolve(["startDecade"]);
                    var id13 = scope.resolve(["year"]);
                    var id14 = scope.resolve(["year"]);
                    var id15 = scope.resolve(["endDecade"]);
                    params11.push((id12 <= id13) && (id14 <= id15));
                    option10.params = params11;
                    option10.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var option17 = {};
                        var params18 = [];
                        params18.push('selected-cell');
                        option17.params = params18;
                        var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 7);
                        buffer += escapeHtml(id16);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += ifCommand.call(engine, scope, option10, payload);
                    buffer += '\n        ';
                    var option19 = {};
                    var params20 = [];
                    var id21 = scope.resolve(["startDecade"]);
                    var id22 = scope.resolve(["startYear"]);
                    params20.push(id21 < id22);
                    option19.params = params20;
                    option19.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var option24 = {};
                        var params25 = [];
                        params25.push('last-century-cell');
                        option24.params = params25;
                        var id23 = callCommandUtil(engine, scope, option24, "getBaseCssClasses", 10);
                        buffer += escapeHtml(id23);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += ifCommand.call(engine, scope, option19, payload);
                    buffer += '\n        ';
                    var option26 = {};
                    var params27 = [];
                    var id28 = scope.resolve(["endDecade"]);
                    var id29 = scope.resolve(["endYear"]);
                    params27.push(id28 > id29);
                    option26.params = params27;
                    option26.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var option31 = {};
                        var params32 = [];
                        params32.push('next-century-cell');
                        option31.params = params32;
                        var id30 = callCommandUtil(engine, scope, option31, "getBaseCssClasses", 13);
                        buffer += escapeHtml(id30);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += ifCommand.call(engine, scope, option26, payload);
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           class="';
                    var option34 = {};
                    var params35 = [];
                    params35.push('decade');
                    option34.params = params35;
                    var id33 = callCommandUtil(engine, scope, option34, "getBaseCssClasses", 18);
                    buffer += escapeHtml(id33);
                    buffer += '">\n            ';
                    var id36 = scope.resolve(["startDecade"]);
                    buffer += escapeHtml(id36);
                    buffer += '-';
                    var id37 = scope.resolve(["endDecade"]);
                    buffer += escapeHtml(id37);
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
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/date/picker/src/picker/decade-panel/decades.xtpl.html";
return t;
});