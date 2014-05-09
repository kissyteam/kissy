/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var overlayXtpl = function (scope, buffer, undefined) {
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
            buffer.write('', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('ks-overlay-closable');
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n    ', 0);
                var option2 = {
                    escape: 1
                };
                var params3 = [];
                var id4 = scope.resolve(["closable"], 0);
                params3.push(id4);
                option2.params = params3;
                option2.fn = function (scope, buffer) {
                    buffer.write('\r\n        <a href="javascript:void(\'close\')"\r\n           class="', 0);
                    var option5 = {
                        escape: 1
                    };
                    var params6 = [];
                    params6.push('close');
                    option5.params = params6;
                    var callRet7
                    callRet7 = callFnUtil(tpl, scope, option5, buffer, ["getBaseCssClasses"], 0, 4);
                    if (callRet7 && callRet7.isBuffer) {
                        buffer = callRet7;
                        callRet7 = undefined;
                    }
                    buffer.write(callRet7, true);
                    buffer.write('"\r\n           role=\'button\'>\r\n            <span class="', 0);
                    var option8 = {
                        escape: 1
                    };
                    var params9 = [];
                    params9.push('close-x');
                    option8.params = params9;
                    var callRet10
                    callRet10 = callFnUtil(tpl, scope, option8, buffer, ["getBaseCssClasses"], 0, 6);
                    if (callRet10 && callRet10.isBuffer) {
                        buffer = callRet10;
                        callRet10 = undefined;
                    }
                    buffer.write(callRet10, true);
                    buffer.write('">close</span>\r\n        </a>\r\n    ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option2, buffer, 2);
                buffer.write('\r\n', 0);
                return buffer;
            };
            buffer = blockCommand.call(tpl, scope, option0, buffer, 1);
            buffer.write('\r\n\r\n<div class="', 0);
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('content');
            option11.params = params12;
            var callRet13
            callRet13 = callFnUtil(tpl, scope, option11, buffer, ["getBaseCssClasses"], 0, 11);
            if (callRet13 && callRet13.isBuffer) {
                buffer = callRet13;
                callRet13 = undefined;
            }
            buffer.write(callRet13, true);
            buffer.write('">\r\n    ', 0);
            var option14 = {
                escape: 1
            };
            var params15 = [];
            params15.push('ks-overlay-content');
            option14.params = params15;
            option14.fn = function (scope, buffer) {
                buffer.write('\r\n        ', 0);
                var id16 = scope.resolve(["content"], 0);
                buffer.write(id16, false);
                buffer.write('\r\n    ', 0);
                return buffer;
            };
            buffer = blockCommand.call(tpl, scope, option14, buffer, 12);
            buffer.write('\r\n</div>', 0);
            return buffer;
        };
overlayXtpl.TPL_NAME = module.name;
overlayXtpl.version = "5.0.0";
return overlayXtpl
});