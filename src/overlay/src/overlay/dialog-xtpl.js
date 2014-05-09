/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var dialogXtpl = function (scope, buffer, undefined) {
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
            var option0 = {};
            var params1 = [];
            params1.push('./overlay-xtpl');
            option0.params = params1;
            require("./overlay-xtpl");
            var callRet2
            callRet2 = extendCommand.call(tpl, scope, option0, buffer, 1);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, false);
            buffer.write('\r\n', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('ks-overlay-content');
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\r\n    <div class="', 0);
                var option5 = {
                    escape: 1
                };
                var params6 = [];
                params6.push('header');
                option5.params = params6;
                var callRet7
                callRet7 = callFnUtil(tpl, scope, option5, buffer, ["getBaseCssClasses"], 0, 3);
                if (callRet7 && callRet7.isBuffer) {
                    buffer = callRet7;
                    callRet7 = undefined;
                }
                buffer.write(callRet7, true);
                buffer.write('"\r\n         style="\r\n', 0);
                var option8 = {
                    escape: 1
                };
                var params9 = [];
                var id10 = scope.resolve(["headerStyle"], 0);
                params9.push(id10);
                option8.params = params9;
                option8.fn = function (scope, buffer) {
                    buffer.write('\r\n ', 0);
                    var id11 = scope.resolve(["xindex"], 0);
                    buffer.write(id11, true);
                    buffer.write(':', 0);
                    var id12 = scope.resolve(["this"], 0);
                    buffer.write(id12, true);
                    buffer.write(';\r\n', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option8, buffer, 5);
                buffer.write('\r\n">', 0);
                var id13 = scope.resolve(["headerContent"], 0);
                buffer.write(id13, false);
                buffer.write('</div>\r\n\r\n    <div class="', 0);
                var option14 = {
                    escape: 1
                };
                var params15 = [];
                params15.push('body');
                option14.params = params15;
                var callRet16
                callRet16 = callFnUtil(tpl, scope, option14, buffer, ["getBaseCssClasses"], 0, 10);
                if (callRet16 && callRet16.isBuffer) {
                    buffer = callRet16;
                    callRet16 = undefined;
                }
                buffer.write(callRet16, true);
                buffer.write('"\r\n         style="\r\n', 0);
                var option17 = {
                    escape: 1
                };
                var params18 = [];
                var id19 = scope.resolve(["bodyStyle"], 0);
                params18.push(id19);
                option17.params = params18;
                option17.fn = function (scope, buffer) {
                    buffer.write('\r\n ', 0);
                    var id20 = scope.resolve(["xindex"], 0);
                    buffer.write(id20, true);
                    buffer.write(':', 0);
                    var id21 = scope.resolve(["this"], 0);
                    buffer.write(id21, true);
                    buffer.write(';\r\n', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option17, buffer, 12);
                buffer.write('\r\n">', 0);
                var id22 = scope.resolve(["bodyContent"], 0);
                buffer.write(id22, false);
                buffer.write('</div>\r\n\r\n    <div class="', 0);
                var option23 = {
                    escape: 1
                };
                var params24 = [];
                params24.push('footer');
                option23.params = params24;
                var callRet25
                callRet25 = callFnUtil(tpl, scope, option23, buffer, ["getBaseCssClasses"], 0, 17);
                if (callRet25 && callRet25.isBuffer) {
                    buffer = callRet25;
                    callRet25 = undefined;
                }
                buffer.write(callRet25, true);
                buffer.write('"\r\n         style="\r\n', 0);
                var option26 = {
                    escape: 1
                };
                var params27 = [];
                var id28 = scope.resolve(["footerStyle"], 0);
                params27.push(id28);
                option26.params = params27;
                option26.fn = function (scope, buffer) {
                    buffer.write('\r\n ', 0);
                    var id29 = scope.resolve(["xindex"], 0);
                    buffer.write(id29, true);
                    buffer.write(':', 0);
                    var id30 = scope.resolve(["this"], 0);
                    buffer.write(id30, true);
                    buffer.write(';\r\n', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option26, buffer, 19);
                buffer.write('\r\n">', 0);
                var id31 = scope.resolve(["footerContent"], 0);
                buffer.write(id31, false);
                buffer.write('</div>\r\n    <div tabindex="0"></div>\r\n', 0);
                return buffer;
            };
            buffer = blockCommand.call(tpl, scope, option3, buffer, 2);
            return buffer;
        };
dialogXtpl.TPL_NAME = module.name;
dialogXtpl.version = "5.0.0";
return dialogXtpl
});