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
            buffer.write('<div class="', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('content');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(engine, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('">', 0);
            var id3 = scope.resolve(["content"], 0);
            buffer.write(id3, false);
            buffer.write('</div>\r\n', 0);
            var option4 = {
                escape: 1
            };
            var params5 = [];
            var id6 = scope.resolve(["closable"], 0);
            params5.push(id6);
            option4.params = params5;
            option4.fn = function (scope, buffer) {
                buffer.write('\r\n<span class="', 0);
                var option7 = {
                    escape: 1
                };
                var params8 = [];
                params8.push('close');
                option7.params = params8;
                var callRet9
                callRet9 = callFnUtil(engine, scope, option7, buffer, ["getBaseCssClasses"], 0, 3);
                if (callRet9 && callRet9.isBuffer) {
                    buffer = callRet9;
                    callRet9 = undefined;
                }
                buffer.write(callRet9, true);
                buffer.write('">close</span>\r\n', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option4, buffer, 2, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});