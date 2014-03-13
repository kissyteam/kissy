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
            buffer += '';
            var option0 = {};
            var params1 = [];
            var id2 = scope.resolve(["months"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var option3 = {};
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve("months." + id6 + "");
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
                    var id13 = scope.resolve(["month"]);
                    var id14 = scope.resolve(["value"]);
                    params12.push(id13 === id14);
                    option11.params = params12;
                    option11.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n        ';
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
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
                    var option19 = {};
                    var params20 = [];
                    params20.push('month');
                    option19.params = params20;
                    var id18 = callCommandUtil(engine, scope, option19, "getBaseCssClasses", 14);
                    buffer += escapeHtml(id18);
                    buffer += '">\n            ';
                    var id21 = scope.resolve(["content"]);
                    buffer += escapeHtml(id21);
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
t.TPL_NAME = module.name;
return t;
});