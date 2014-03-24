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
            var id2 = scope.resolve(["decades"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\n<tr role="row">\n    ');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve(["decades", id6]);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {

                    buffer.write('\n    <td role="gridcell"\n        class="');
                    var option7 = {
                        escape: 1
                    };
                    var params8 = [];
                    params8.push('cell');
                    option7.params = params8;
                    var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 5);
                    if (commandRet9 && commandRet9.isBuffer) {
                        buffer = commandRet9;
                        commandRet9 = undefined;
                    }
                    buffer.write(commandRet9, true);
                    buffer.write('\n        ');
                    var option10 = {
                        escape: 1
                    };
                    var params11 = [];
                    var id12 = scope.resolve(["startDecade"]);
                    var exp14 = id12;
                    var id13 = scope.resolve(["year"]);
                    exp14 = (id12) <= (id13);
                    var exp18 = exp14;
                    if ((exp14)) {
                        var id15 = scope.resolve(["year"]);
                        var exp17 = id15;
                        var id16 = scope.resolve(["endDecade"]);
                        exp17 = (id15) <= (id16);
                        exp18 = exp17;
                    }
                    params11.push(exp18);
                    option10.params = params11;
                    option10.fn = function (scope, buffer) {

                        buffer.write('\n         ');
                        var option19 = {
                            escape: 1
                        };
                        var params20 = [];
                        params20.push('selected-cell');
                        option19.params = params20;
                        var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 7);
                        if (commandRet21 && commandRet21.isBuffer) {
                            buffer = commandRet21;
                            commandRet21 = undefined;
                        }
                        buffer.write(commandRet21, true);
                        buffer.write('\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option10, buffer, 6, payload);
                    buffer.write('\n        ');
                    var option22 = {
                        escape: 1
                    };
                    var params23 = [];
                    var id24 = scope.resolve(["startDecade"]);
                    var exp26 = id24;
                    var id25 = scope.resolve(["startYear"]);
                    exp26 = (id24) < (id25);
                    params23.push(exp26);
                    option22.params = params23;
                    option22.fn = function (scope, buffer) {

                        buffer.write('\n         ');
                        var option27 = {
                            escape: 1
                        };
                        var params28 = [];
                        params28.push('last-century-cell');
                        option27.params = params28;
                        var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 10);
                        if (commandRet29 && commandRet29.isBuffer) {
                            buffer = commandRet29;
                            commandRet29 = undefined;
                        }
                        buffer.write(commandRet29, true);
                        buffer.write('\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option22, buffer, 9, payload);
                    buffer.write('\n        ');
                    var option30 = {
                        escape: 1
                    };
                    var params31 = [];
                    var id32 = scope.resolve(["endDecade"]);
                    var exp34 = id32;
                    var id33 = scope.resolve(["endYear"]);
                    exp34 = (id32) > (id33);
                    params31.push(exp34);
                    option30.params = params31;
                    option30.fn = function (scope, buffer) {

                        buffer.write('\n         ');
                        var option35 = {
                            escape: 1
                        };
                        var params36 = [];
                        params36.push('next-century-cell');
                        option35.params = params36;
                        var commandRet37 = callCommandUtil(engine, scope, option35, buffer, "getBaseCssClasses", 13);
                        if (commandRet37 && commandRet37.isBuffer) {
                            buffer = commandRet37;
                            commandRet37 = undefined;
                        }
                        buffer.write(commandRet37, true);
                        buffer.write('\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option30, buffer, 12, payload);
                    buffer.write('\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="');
                    var option38 = {
                        escape: 1
                    };
                    var params39 = [];
                    params39.push('decade');
                    option38.params = params39;
                    var commandRet40 = callCommandUtil(engine, scope, option38, buffer, "getBaseCssClasses", 19);
                    if (commandRet40 && commandRet40.isBuffer) {
                        buffer = commandRet40;
                        commandRet40 = undefined;
                    }
                    buffer.write(commandRet40, true);
                    buffer.write('">\n            ');
                    var id41 = scope.resolve(["startDecade"]);
                    buffer.write(id41, true);
                    buffer.write('-');
                    var id42 = scope.resolve(["endDecade"]);
                    buffer.write(id42, true);
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