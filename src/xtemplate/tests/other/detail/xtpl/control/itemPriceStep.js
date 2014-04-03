/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, buffer, payload, undefined) {
            var engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
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
            buffer.write('<script>\n    KISSY.use("detail/mod", function(S,Mod) {\n        Mod.data("g_price_step",JSON.parse(S.unEscapeHTML(\'');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["itemPriceStep", "data"]);
            params1.push(id2);
            option0.params = params1;
            var commandRet3 = callCommandUtil(engine, scope, option0, buffer, "objToStr", 3);
            if (commandRet3 && commandRet3.isBuffer) {
                buffer = commandRet3;
                commandRet3 = undefined;
            }
            buffer.write(commandRet3, true);
            buffer.write('\')));\n    });\n</script>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});