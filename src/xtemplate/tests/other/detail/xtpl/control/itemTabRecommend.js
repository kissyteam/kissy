/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemTabRecommend = function (scope, buffer, session, undefined) {
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
            buffer.write('<!--宝贝推荐-->\r\n\r\n<div class="mod-recommand">\r\n</div>\r\n\r\n<textarea class="ks-lazyload hidden">\r\n    <script>\r\n        KISSY.use("detail/recommand/", function(S,Mod) {\r\n            Mod({\r\n                container: \'.mod-recommand\'\r\n            });\r\n        });\r\n    </script>\r\n</textarea>', 0);
            return buffer;
        };
itemTabRecommend.TPL_NAME = module.name;
return itemTabRecommend
});