/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemTabDesc = function (scope, buffer, undefined) {
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
            buffer.write('<!--商品描述-->\r\n\r\n<div class="pg-description">\r\n    <div id="J_ItemDescribe" class="mod-describe-content">\r\n        <div class="J_hd"></div>\r\n        <div class="J_bd" id="J_Describe-bd"></div>\r\n    </div>\r\n</div>\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        var config = S.mix({\r\n            "panel": "#J_ItemDescribe"\r\n        });\r\n        Mod.add({\r\n            name:"detail/describe/",\r\n            data: config\r\n        });\r\n\r\n    });\r\n</script>', 0);
            return buffer;
        };
itemTabDesc.TPL_NAME = module.name;
itemTabDesc.version = "5.0.0";
return itemTabDesc
});