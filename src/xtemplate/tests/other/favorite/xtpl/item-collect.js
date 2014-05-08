/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemCollect = function (scope, buffer, session, undefined) {
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
            params1.push('./layout/item-collect-layout');
            option0.params = params1;
            require("./layout/item-collect-layout");
            var callRet2
            callRet2 = extendCommand.call(engine, scope, option0, buffer, 1, session);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('\n\n', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('content');
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\n    ', 0);
                var option5 = {
                    escape: 1
                };
                var params6 = [];
                params6.push('./page/item-collect-page');
                option5.params = params6;
                require("./page/item-collect-page");
                var callRet7
                callRet7 = includeCommand.call(engine, scope, option5, buffer, 4, session);
                if (callRet7 && callRet7.isBuffer) {
                    buffer = callRet7;
                    callRet7 = undefined;
                }
                buffer.write(callRet7, true);
                buffer.write('\n', 0);
                return buffer;
            };
            buffer = blockCommand.call(engine, scope, option3, buffer, 3, session);
            buffer.write('\n\n', 0);
            return buffer;
        };
itemCollect.TPL_NAME = module.name;
return itemCollect
});