/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
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
            buffer.write('<!--商品描述-->\n\n<div class="pg-description">\n    <div id="J_ItemDescribe" class="mod-describe-content">\n        <div class="J_hd"></div>\n        <div class="J_bd" id="J_Describe-bd"></div>\n    </div>\n</div>\n\n<script>\n    KISSY.use("detail/mod", function(S,Mod) {\n        var config = S.mix({\n            "panel": "#J_ItemDescribe"\n        });\n        Mod.add({\n            name:"detail/describe/",\n            data: config\n        });\n\n    });\n</script>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});