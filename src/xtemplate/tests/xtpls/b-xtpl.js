/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var bXtpl = function (scope, buffer, undefined) {
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
            var id2 = scope.resolve(["b"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('', 0);
                var id3 = scope.resolve(["c"], 0);
                buffer.write(id3, true);
                buffer.write('', 0);
                var id4 = scope.resolve(["d"], 1);
                buffer.write(id4, true);
                buffer.write('', 0);
                return buffer;
            };
            buffer = withCommand.call(tpl, scope, option0, buffer, 1);
            return buffer;
        };
bXtpl.TPL_NAME = module.name;
bXtpl.version = "5.0.0";
return bXtpl
});