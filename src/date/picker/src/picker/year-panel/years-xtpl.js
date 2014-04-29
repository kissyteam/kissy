/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            var callFnUtil = utils["callFn"],
                callCommandUtil = utils["callCommand"],
                eachCommand = nativeCommands["each"],
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands["set"],
                includeCommand = nativeCommands["include"],
                parseCommand = nativeCommands["parse"],
                extendCommand = nativeCommands["extend"],
                blockCommand = nativeCommands["block"],
                macroCommand = nativeCommands["macro"],
                debuggerCommand = nativeCommands["debugger"];
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            buffer.write('', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["years"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n<tr role="row">\r\n    ', 0);
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"], 0);
                var id5 = scope.resolve(["years", id6], 0);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {
                    buffer.write('\r\n    <td role="gridcell"\r\n        title="', 0);
                    var id7 = scope.resolve(["title"], 0);
                    buffer.write(id7, true);
                    buffer.write('"\r\n        class="', 0);
                    var option8 = {
                        escape: 1
                    };
                    var params9 = [];
                    params9.push('cell');
                    option8.params = params9;
                    var callRet10
                    callRet10 = callFnUtil(engine, scope, option8, buffer, ["getBaseCssClasses"], 0, 6);
                    if (callRet10 && callRet10.isBuffer) {
                        buffer = callRet10;
                        callRet10 = undefined;
                    }
                    buffer.write(callRet10, true);
                    buffer.write('\r\n        ', 0);
                    var option11 = {
                        escape: 1
                    };
                    var params12 = [];
                    var id13 = scope.resolve(["content"], 0);
                    var exp15 = id13;
                    var id14 = scope.resolve(["year"], 0);
                    exp15 = (id13) === (id14);
                    params12.push(exp15);
                    option11.params = params12;
                    option11.fn = function (scope, buffer) {
                        buffer.write('\r\n         ', 0);
                        var option16 = {
                            escape: 1
                        };
                        var params17 = [];
                        params17.push('selected-cell');
                        option16.params = params17;
                        var callRet18
                        callRet18 = callFnUtil(engine, scope, option16, buffer, ["getBaseCssClasses"], 0, 8);
                        if (callRet18 && callRet18.isBuffer) {
                            buffer = callRet18;
                            callRet18 = undefined;
                        }
                        buffer.write(callRet18, true);
                        buffer.write('\r\n        ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option11, buffer, 7, payload);
                    buffer.write('\r\n        ', 0);
                    var option19 = {
                        escape: 1
                    };
                    var params20 = [];
                    var id21 = scope.resolve(["content"], 0);
                    var exp23 = id21;
                    var id22 = scope.resolve(["startYear"], 0);
                    exp23 = (id21) < (id22);
                    params20.push(exp23);
                    option19.params = params20;
                    option19.fn = function (scope, buffer) {
                        buffer.write('\r\n         ', 0);
                        var option24 = {
                            escape: 1
                        };
                        var params25 = [];
                        params25.push('last-decade-cell');
                        option24.params = params25;
                        var callRet26
                        callRet26 = callFnUtil(engine, scope, option24, buffer, ["getBaseCssClasses"], 0, 11);
                        if (callRet26 && callRet26.isBuffer) {
                            buffer = callRet26;
                            callRet26 = undefined;
                        }
                        buffer.write(callRet26, true);
                        buffer.write('\r\n        ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option19, buffer, 10, payload);
                    buffer.write('\r\n        ', 0);
                    var option27 = {
                        escape: 1
                    };
                    var params28 = [];
                    var id29 = scope.resolve(["content"], 0);
                    var exp31 = id29;
                    var id30 = scope.resolve(["endYear"], 0);
                    exp31 = (id29) > (id30);
                    params28.push(exp31);
                    option27.params = params28;
                    option27.fn = function (scope, buffer) {
                        buffer.write('\r\n         ', 0);
                        var option32 = {
                            escape: 1
                        };
                        var params33 = [];
                        params33.push('next-decade-cell');
                        option32.params = params33;
                        var callRet34
                        callRet34 = callFnUtil(engine, scope, option32, buffer, ["getBaseCssClasses"], 0, 14);
                        if (callRet34 && callRet34.isBuffer) {
                            buffer = callRet34;
                            callRet34 = undefined;
                        }
                        buffer.write(callRet34, true);
                        buffer.write('\r\n        ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option27, buffer, 13, payload);
                    buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
                    var option35 = {
                        escape: 1
                    };
                    var params36 = [];
                    params36.push('year');
                    option35.params = params36;
                    var callRet37
                    callRet37 = callFnUtil(engine, scope, option35, buffer, ["getBaseCssClasses"], 0, 20);
                    if (callRet37 && callRet37.isBuffer) {
                        buffer = callRet37;
                        callRet37 = undefined;
                    }
                    buffer.write(callRet37, true);
                    buffer.write('">\r\n            ', 0);
                    var id38 = scope.resolve(["content"], 0);
                    buffer.write(id38, true);
                    buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
                buffer.write('\r\n</tr>\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});