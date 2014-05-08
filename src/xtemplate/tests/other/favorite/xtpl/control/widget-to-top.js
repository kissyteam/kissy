/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var widgetToTop = function (scope, buffer, session, undefined) {
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
            buffer.write('<div class="J_UpTOTop up-to-top">\n    <div class="update-gotop">\n        <a class="feedback" target="_blank" href="http://ur.taobao.com/survey/view.htm?id=2052">反馈</a>\n\n        <p title="回到顶部" class="go-to-top J_GoToTop">\n            <a pointname="tbscj.11.1" class="J_HotPoint" target="_self" href="javascript:scrollTo(0,0);">top</a>\n        </p>\n    </div>\n</div>\n', 0);
            return buffer;
        };
widgetToTop.TPL_NAME = module.name;
return widgetToTop
});