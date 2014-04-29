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
            var option0 = {};
            var params1 = [];
            params1.push('component/extension/content-xtpl');
            option0.params = params1;
            require("component/extension/content-xtpl");
            var callRet2
            callRet2 = includeCommand.call(engine, scope, option0, buffer, 1, payload);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, false);
            buffer.write('\r\n<div class="', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('dropdown');
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
            params7.push('dropdown-inner');
            option6.params = params7;
            var callRet8
            callRet8 = callFnUtil(engine, scope, option6, buffer, ["getBaseCssClasses"], 0, 3);
            if (callRet8 && callRet8.isBuffer) {
                buffer = callRet8;
                callRet8 = undefined;
            }
            buffer.write(callRet8, true);
            buffer.write('">\r\n    </div>\r\n</div>', 0);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});