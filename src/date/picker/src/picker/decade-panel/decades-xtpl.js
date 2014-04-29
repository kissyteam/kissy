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
            var id2 = scope.resolve(["decades"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n<tr role="row">\r\n    ', 0);
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"], 0);
                var id5 = scope.resolve(["decades", id6], 0);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {
                    buffer.write('\r\n    <td role="gridcell"\r\n        class="', 0);
                    var option7 = {
                        escape: 1
                    };
                    var params8 = [];
                    params8.push('cell');
                    option7.params = params8;
                    var callRet9
                    callRet9 = callFnUtil(engine, scope, option7, buffer, ["getBaseCssClasses"], 0, 5);
                    if (callRet9 && callRet9.isBuffer) {
                        buffer = callRet9;
                        callRet9 = undefined;
                    }
                    buffer.write(callRet9, true);
                    buffer.write('\r\n        ', 0);
                    var option10 = {
                        escape: 1
                    };
                    var params11 = [];
                    var id12 = scope.resolve(["startDecade"], 0);
                    var exp14 = id12;
                    var id13 = scope.resolve(["year"], 0);
                    exp14 = (id12) <= (id13);
                    var exp18 = exp14;
                    if ((exp14)) {
                        var id15 = scope.resolve(["year"], 0);
                        var exp17 = id15;
                        var id16 = scope.resolve(["endDecade"], 0);
                        exp17 = (id15) <= (id16);
                        exp18 = exp17;
                    }
                    params11.push(exp18);
                    option10.params = params11;
                    option10.fn = function (scope, buffer) {
                        buffer.write('\r\n         ', 0);
                        var option19 = {
                            escape: 1
                        };
                        var params20 = [];
                        params20.push('selected-cell');
                        option19.params = params20;
                        var callRet21
                        callRet21 = callFnUtil(engine, scope, option19, buffer, ["getBaseCssClasses"], 0, 7);
                        if (callRet21 && callRet21.isBuffer) {
                            buffer = callRet21;
                            callRet21 = undefined;
                        }
                        buffer.write(callRet21, true);
                        buffer.write('\r\n        ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option10, buffer, 6, payload);
                    buffer.write('\r\n        ', 0);
                    var option22 = {
                        escape: 1
                    };
                    var params23 = [];
                    var id24 = scope.resolve(["startDecade"], 0);
                    var exp26 = id24;
                    var id25 = scope.resolve(["startYear"], 0);
                    exp26 = (id24) < (id25);
                    params23.push(exp26);
                    option22.params = params23;
                    option22.fn = function (scope, buffer) {
                        buffer.write('\r\n         ', 0);
                        var option27 = {
                            escape: 1
                        };
                        var params28 = [];
                        params28.push('last-century-cell');
                        option27.params = params28;
                        var callRet29
                        callRet29 = callFnUtil(engine, scope, option27, buffer, ["getBaseCssClasses"], 0, 10);
                        if (callRet29 && callRet29.isBuffer) {
                            buffer = callRet29;
                            callRet29 = undefined;
                        }
                        buffer.write(callRet29, true);
                        buffer.write('\r\n        ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option22, buffer, 9, payload);
                    buffer.write('\r\n        ', 0);
                    var option30 = {
                        escape: 1
                    };
                    var params31 = [];
                    var id32 = scope.resolve(["endDecade"], 0);
                    var exp34 = id32;
                    var id33 = scope.resolve(["endYear"], 0);
                    exp34 = (id32) > (id33);
                    params31.push(exp34);
                    option30.params = params31;
                    option30.fn = function (scope, buffer) {
                        buffer.write('\r\n         ', 0);
                        var option35 = {
                            escape: 1
                        };
                        var params36 = [];
                        params36.push('next-century-cell');
                        option35.params = params36;
                        var callRet37
                        callRet37 = callFnUtil(engine, scope, option35, buffer, ["getBaseCssClasses"], 0, 13);
                        if (callRet37 && callRet37.isBuffer) {
                            buffer = callRet37;
                            callRet37 = undefined;
                        }
                        buffer.write(callRet37, true);
                        buffer.write('\r\n        ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option30, buffer, 12, payload);
                    buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
                    var option38 = {
                        escape: 1
                    };
                    var params39 = [];
                    params39.push('decade');
                    option38.params = params39;
                    var callRet40
                    callRet40 = callFnUtil(engine, scope, option38, buffer, ["getBaseCssClasses"], 0, 19);
                    if (callRet40 && callRet40.isBuffer) {
                        buffer = callRet40;
                        callRet40 = undefined;
                    }
                    buffer.write(callRet40, true);
                    buffer.write('">\r\n            ', 0);
                    var id41 = scope.resolve(["startDecade"], 0);
                    buffer.write(id41, true);
                    buffer.write('-', 0);
                    var id42 = scope.resolve(["endDecade"], 0);
                    buffer.write(id42, true);
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