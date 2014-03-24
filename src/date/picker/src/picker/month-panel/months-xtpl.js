/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, buffer, payload, undefined) {
            var engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
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
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["months"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\n<tr role="row">\n    ');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve(["months", id6]);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {

                    buffer.write('\n    <td role="gridcell"\n        title="');
                    var id7 = scope.resolve(["title"]);
                    buffer.write(id7, true);
                    buffer.write('"\n        class="');
                    var option8 = {
                        escape: 1
                    };
                    var params9 = [];
                    params9.push('cell');
                    option8.params = params9;
                    var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 6);
                    if (commandRet10 && commandRet10.isBuffer) {
                        buffer = commandRet10;
                        commandRet10 = undefined;
                    }
                    buffer.write(commandRet10, true);
                    buffer.write('\n        ');
                    var option11 = {
                        escape: 1
                    };
                    var params12 = [];
                    var id13 = scope.resolve(["month"]);
                    var exp15 = id13;
                    var id14 = scope.resolve(["value"]);
                    exp15 = (id13) === (id14);
                    params12.push(exp15);
                    option11.params = params12;
                    option11.fn = function (scope, buffer) {

                        buffer.write('\n        ');
                        var option16 = {
                            escape: 1
                        };
                        var params17 = [];
                        params17.push('selected-cell');
                        option16.params = params17;
                        var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 8);
                        if (commandRet18 && commandRet18.isBuffer) {
                            buffer = commandRet18;
                            commandRet18 = undefined;
                        }
                        buffer.write(commandRet18, true);
                        buffer.write('\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option11, buffer, 7, payload);
                    buffer.write('\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="');
                    var option19 = {
                        escape: 1
                    };
                    var params20 = [];
                    params20.push('month');
                    option19.params = params20;
                    var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 14);
                    if (commandRet21 && commandRet21.isBuffer) {
                        buffer = commandRet21;
                        commandRet21 = undefined;
                    }
                    buffer.write(commandRet21, true);
                    buffer.write('">\n            ');
                    var id22 = scope.resolve(["content"]);
                    buffer.write(id22, true);
                    buffer.write('\n        </a>\n    </td>\n    ');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
                buffer.write('\n</tr>\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});