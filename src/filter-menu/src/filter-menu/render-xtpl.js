/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var t = function (scope, buffer, payload, undefined) {
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
            buffer.write('<div class="', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('input-wrap');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(engine, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('">\r\n    <div class="', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('placeholder');
            option3.params = params4;
            var callRet5
            callRet5 = callFnUtil(engine, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
            if (callRet5 && callRet5.isBuffer) {
                buffer = callRet5;
                callRet5 = undefined;
            }
            buffer.write(callRet5, true);
            buffer.write('">\r\n        ', 0);
            var id6 = scope.resolve(["placeholder"], 0);
            buffer.write(id6, true);
            buffer.write('\r\n    </div>\r\n    <input class="', 0);
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('input');
            option7.params = params8;
            var callRet9
            callRet9 = callFnUtil(engine, scope, option7, buffer, ["getBaseCssClasses"], 0, 5);
            if (callRet9 && callRet9.isBuffer) {
                buffer = callRet9;
                callRet9 = undefined;
            }
            buffer.write(callRet9, true);
            buffer.write('"\r\n            autocomplete="off"/>\r\n</div>\r\n<div class="', 0);
            var option10 = {
                escape: 1
            };
            var params11 = [];
            params11.push('content');
            option10.params = params11;
            var callRet12
            callRet12 = callFnUtil(engine, scope, option10, buffer, ["getBaseCssClasses"], 0, 8);
            if (callRet12 && callRet12.isBuffer) {
                buffer = callRet12;
                callRet12 = undefined;
            }
            buffer.write(callRet12, true);
            buffer.write('">', 0);
            var id13 = scope.resolve(["content"], 0);
            buffer.write(id13, false);
            buffer.write('</div>', 0);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});