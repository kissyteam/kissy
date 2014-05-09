/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var aXtpl = function (scope, buffer, undefined) {
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
            var id0 = scope.resolve(["a"], 0);
            buffer.write(id0, true);
            buffer.write('', 0);
            var option1 = {
                escape: 1
            };
            var params2 = [];
            params2.push('./b-xtpl');
            option1.params = params2;
            require("./b-xtpl");
            var callRet3
            callRet3 = includeCommand.call(tpl, scope, option1, buffer, 1);
            if (callRet3 && callRet3.isBuffer) {
                buffer = callRet3;
                callRet3 = undefined;
            }
            buffer.write(callRet3, true);
            buffer.write('', 0);
            var option4 = {
                escape: 1
            };
            var params5 = [];
            var id6 = scope.resolve(["x"], 0);
            params5.push(id6);
            option4.params = params5;
            option4.fn = function (scope, buffer) {
                buffer.write('', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option4, buffer, 1);
            return buffer;
        };
aXtpl.TPL_NAME = module.name;
aXtpl.version = "5.0.0";
return aXtpl
});