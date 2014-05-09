/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var months = function (scope, buffer, undefined) {
            var tpl = this,
                nativeCommands = tpl.root.nativeCommands,
                utils = tpl.root.utils;
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
            buffer.write('', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["months"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n<tr role="row">\r\n    ', 0);
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"], 0);
                var id5 = scope.resolve(["months", id6], 0);
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
                    callRet10 = callFnUtil(tpl, scope, option8, buffer, ["getBaseCssClasses"], 0, 6);
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
                    var id13 = scope.resolve(["month"], 0);
                    var exp15 = id13;
                    var id14 = scope.resolve(["value"], 0);
                    exp15 = (id13) === (id14);
                    params12.push(exp15);
                    option11.params = params12;
                    option11.fn = function (scope, buffer) {
                        buffer.write('\r\n        ', 0);
                        var option16 = {
                            escape: 1
                        };
                        var params17 = [];
                        params17.push('selected-cell');
                        option16.params = params17;
                        var callRet18
                        callRet18 = callFnUtil(tpl, scope, option16, buffer, ["getBaseCssClasses"], 0, 8);
                        if (callRet18 && callRet18.isBuffer) {
                            buffer = callRet18;
                            callRet18 = undefined;
                        }
                        buffer.write(callRet18, true);
                        buffer.write('\r\n        ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option11, buffer, 7);
                    buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
                    var option19 = {
                        escape: 1
                    };
                    var params20 = [];
                    params20.push('month');
                    option19.params = params20;
                    var callRet21
                    callRet21 = callFnUtil(tpl, scope, option19, buffer, ["getBaseCssClasses"], 0, 14);
                    if (callRet21 && callRet21.isBuffer) {
                        buffer = callRet21;
                        callRet21 = undefined;
                    }
                    buffer.write(callRet21, true);
                    buffer.write('">\r\n            ', 0);
                    var id22 = scope.resolve(["content"], 0);
                    buffer.write(id22, true);
                    buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
                buffer.write('\r\n</tr>\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option0, buffer, 1);
            return buffer;
        };
months.TPL_NAME = module.name;
months.version = "5.0.0";
return months
});