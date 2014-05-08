/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemTabDealRecord = function (scope, buffer, session, undefined) {
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
            buffer.write('<!--成交记录-->\r\n<div class="mod-deal ks-scroll-view" id="mod-deal">\r\n\r\n</div>\r\n\r\n<textarea class="ks-lazyload hidden">\r\n    <script>\r\n        KISSY.use("detail/deal/", function(S,Mod) {\r\n            Mod({\r\n                container: "#mod-deal"\r\n            })\r\n        });\r\n    </script>\r\n</textarea>', 0);
            return buffer;
        };
itemTabDealRecord.TPL_NAME = module.name;
return itemTabDealRecord
});