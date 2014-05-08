/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemPriceStep = function (scope, buffer, session, undefined) {
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
            buffer.write('<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.data("g_price_step",JSON.parse(S.unEscapeHTML(\'', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["itemPriceStep", "data"], 0);
            params1.push(id2);
            option0.params = params1;
            var callRet3
            callRet3 = callFnUtil(engine, scope, option0, buffer, ["objToStr"], 0, 3);
            if (callRet3 && callRet3.isBuffer) {
                buffer = callRet3;
                callRet3 = undefined;
            }
            buffer.write(callRet3, true);
            buffer.write('\')));\r\n    });\r\n</script>', 0);
            return buffer;
        };
itemPriceStep.TPL_NAME = module.name;
return itemPriceStep
});