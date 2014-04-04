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
            buffer.write('<!doctype html>\n\n<html>\n<head>\n    <title>API Documentation</title>\n    <style type="text/css">\n        .toctree-wrapper  ul{\n            list-style: none;\n            margin:0 0 0 20px;\n        }\n\n        .toctree-wrapper  ul li{\n            list-style: none;\n            margin:0 0  5px 0;\n        }\n\n        .toctree-wrapper  ul li a{\n            font-size:14px;\n            color:rgb(19, 100, 196);\n        }\n        ul li .collapsed,  ul li .expanded{\n            float:left;\n            width:17px;\n            height:17px;\n            background-image:url(\'http://gtms01.alicdn.com/tps/i1/T1zNTDFj0fXXcSRtsq-1828-52.png\');\n            cursor:pointer;\n        }\n\n        ul li .collapsed{\n            background-position:-329px -3px;\n        }\n\n        ul li .expanded{\n            background-position:-352px -3px;\n        }\n    </style>\n    <script type="text/javascript" src="http://a.tbcdn.cn/s/kissy/1.3.0/kissy.js"></script>\n    <script type="text/javascript">\n        KISSY.use("sizzle", function(S){\n            var $=S.all;\n            $(".toctree-wrapper a").each(function(item){\n                if($(item).parent().all("ul").length>0){\n                    var handler = $(\'<s class="collapsed"></s>\');\n                    handler.insertBefore(item);\n                    $(item).parent().all("ul").hide();\n                }\n            });\n            $(".toctree-wrapper").delegate("click","s",function(ev){\n                var tg = $(ev.currentTarget);\n                if(tg.hasClass("collapsed")){\n                    tg.parent().all("ul").show(.3);\n                    tg.addClass("expanded").removeClass("collapsed");\n                }else{\n                    tg.parent().all("ul").hide(.3);\n                    tg.removeClass("expanded").addClass("collapsed");\n                }\n            })\n        })\n    </script>\n</head>\n<body>\n<div class="section" id="api-documentation">\n    <div class="body">\n        <div class="section" id="api-documentation">\n            <span id="api"></span><h1>Detail Modulet API Documentation</h1>\n            <div class="toctree-wrapper compound">\n                <ul>\n                    #foreach($api in $apis)\n                    <li class="toctree-l1">\n                        <a class="reference internal" href="seed/index.html"><B>${api.name}</a></B>${api.desc}\n                        <ul>\n                            #set($dataDesc = $api.moduletDesc.getReturnClassDesc())\n                            #foreach($fd in $dataDesc.getFieldsDesc())\n                            $control.setTemplate(\'apiDesc.vm\').setParameter(\'fd\',$fd)\n                            #end\n                        </ul>\n                    </li>\n                    #end\n                </ul>\n            </div>\n        </div>\n    </div>\n</div>\n</body>\n</html>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});