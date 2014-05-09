/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var render = function (scope, buffer, undefined) {
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
            buffer.write('<div class="', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('content');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('">\r\n    ', 0);
            var option3 = {};
            var params4 = [];
            params4.push('date/picker-xtpl');
            option3.params = params4;
            require("date/picker-xtpl");
            var callRet5
            callRet5 = includeCommand.call(tpl, scope, option3, buffer, 2);
            if (callRet5 && callRet5.isBuffer) {
                buffer = callRet5;
                callRet5 = undefined;
            }
            buffer.write(callRet5, false);
            buffer.write('\r\n</div>', 0);
            return buffer;
        };
render.TPL_NAME = module.name;
render.version = "5.0.0";
return render
});