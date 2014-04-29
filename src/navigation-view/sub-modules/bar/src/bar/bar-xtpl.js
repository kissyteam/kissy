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
            var id2 = scope.resolve(["withTitle"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n<div class="', 0);
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                params4.push('title-wrap');
                option3.params = params4;
                var callRet5
                callRet5 = callFnUtil(engine, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
                if (callRet5 && callRet5.isBuffer) {
                    buffer = callRet5;
                    callRet5 = undefined;
                }
                buffer.write(callRet5, true);
                buffer.write('">\r\n    <div class="', 0);
                var option6 = {
                    escape: 1
                };
                var params7 = [];
                params7.push('title');
                option6.params = params7;
                var callRet8
                callRet8 = callFnUtil(engine, scope, option6, buffer, ["getBaseCssClasses"], 0, 3);
                if (callRet8 && callRet8.isBuffer) {
                    buffer = callRet8;
                    callRet8 = undefined;
                }
                buffer.write(callRet8, true);
                buffer.write('">', 0);
                var id9 = scope.resolve(["title"], 0);
                buffer.write(id9, true);
                buffer.write('</div>\r\n</div>\r\n', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 1, payload);
            buffer.write('\r\n<div class="', 0);
            var option10 = {
                escape: 1
            };
            var params11 = [];
            params11.push('content');
            option10.params = params11;
            var callRet12
            callRet12 = callFnUtil(engine, scope, option10, buffer, ["getBaseCssClasses"], 0, 6);
            if (callRet12 && callRet12.isBuffer) {
                buffer = callRet12;
                callRet12 = undefined;
            }
            buffer.write(callRet12, true);
            buffer.write('">\r\n    <div class="', 0);
            var option13 = {
                escape: 1
            };
            var params14 = [];
            params14.push('center');
            option13.params = params14;
            var callRet15
            callRet15 = callFnUtil(engine, scope, option13, buffer, ["getBaseCssClasses"], 0, 7);
            if (callRet15 && callRet15.isBuffer) {
                buffer = callRet15;
                callRet15 = undefined;
            }
            buffer.write(callRet15, true);
            buffer.write('"></div>\r\n</div>', 0);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});