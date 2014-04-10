/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<div id="ks-content-');
            var id0 = scope.resolve(["id"]);
            buffer.write(id0, true);
            buffer.write('"\n     class="');
            var option1 = {
                escape: 1
            };
            var params2 = [];
            params2.push('content');
            option1.params = params2;
            var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
            if (commandRet3 && commandRet3.isBuffer) {
                buffer = commandRet3;
                commandRet3 = undefined;
            }
            buffer.write(commandRet3, true);
            buffer.write('">');
            var id4 = scope.resolve(["content"]);
            buffer.write(id4, false);
            buffer.write('</div>\n<span class="');
            var id5 = scope.resolve(["prefixCls"]);
            buffer.write(id5, true);
            buffer.write('submenu-arrow">►</span>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});