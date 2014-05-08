/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemPic = function (scope, buffer, session, undefined) {
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
            buffer.write('<!--主图片区 模块-->\r\n<div class="mod-gallery ks-scroll-view" id="mod-gallery" data-spm="991222349">\r\n    <ul class="J_pic mod-gallery-picpanel ks-scroll-view-content">\r\n\r\n    </ul>\r\n</div>\r\n\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.add({\r\n            name:"detail/gallery/",\r\n            data:{\r\n                container: "#mod-gallery",\r\n                sname: "itemPic",\r\n                response: JSON.parse(S.unEscapeHTML(\'', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["itemPic", "data"], 0);
            params1.push(id2);
            option0.params = params1;
            var callRet3
            callRet3 = callFnUtil(engine, scope, option0, buffer, ["objToStr"], 0, 16);
            if (callRet3 && callRet3.isBuffer) {
                buffer = callRet3;
                callRet3 = undefined;
            }
            buffer.write(callRet3, true);
            buffer.write('\'))\r\n            }\r\n        });\r\n    });\r\n</script>\r\n', 0);
            return buffer;
        };
itemPic.TPL_NAME = module.name;
return itemPic
});