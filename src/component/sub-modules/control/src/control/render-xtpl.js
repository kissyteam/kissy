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
            buffer.write('<div id="', 0);
            var id0 = scope.resolve(["id"], 0);
            buffer.write(id0, true);
            buffer.write('"\r\n class="', 0);
            var option1 = {
                escape: 1
            };
            var callRet2
            callRet2 = callFnUtil(tpl, scope, option1, buffer, ["getBaseCssClasses"], 0, 2);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('\r\n', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["elCls"], 0);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\r\n ', 0);
                var id6 = scope.resolve(["this"], 0);
                buffer.write(id6, true);
                buffer.write('\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
            buffer.write('\r\n"\r\n\r\n', 0);
            var option7 = {
                escape: 1
            };
            var params8 = [];
            var id9 = scope.resolve(["elAttrs"], 0);
            params8.push(id9);
            option7.params = params8;
            option7.fn = function (scope, buffer) {
                buffer.write('\r\n ', 0);
                var id10 = scope.resolve(["xindex"], 0);
                buffer.write(id10, true);
                buffer.write('="', 0);
                var id11 = scope.resolve(["this"], 0);
                buffer.write(id11, true);
                buffer.write('"\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option7, buffer, 8);
            buffer.write('\r\n\r\nstyle="\r\n', 0);
            var option12 = {
                escape: 1
            };
            var params13 = [];
            var id14 = scope.resolve(["elStyle"], 0);
            params13.push(id14);
            option12.params = params13;
            option12.fn = function (scope, buffer) {
                buffer.write('\r\n ', 0);
                var id15 = scope.resolve(["xindex"], 0);
                buffer.write(id15, true);
                buffer.write(':', 0);
                var id16 = scope.resolve(["this"], 0);
                buffer.write(id16, true);
                buffer.write(';\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option12, buffer, 13);
            buffer.write('\r\n">', 0);
            return buffer;
        };
render.TPL_NAME = module.name;
render.version = "5.0.0";
return render
});