/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var customCommandXtpl = function (scope, buffer, undefined) {
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
            buffer.write('i am ', 0);
            var option0 = {
                escape: 1
            };
            var callRet1
            callRet1 = callFnUtil(tpl, scope, option0, buffer, ["command"], 0, 1);
            if (callRet1 && callRet1.isBuffer) {
                buffer = callRet1;
                callRet1 = undefined;
            }
            buffer.write(callRet1, true);
            buffer.write('!', 0);
            return buffer;
        };
customCommandXtpl.TPL_NAME = module.name;
customCommandXtpl.version = "5.0.0";
return customCommandXtpl
});