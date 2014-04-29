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
            params1.push('row');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(engine, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('\r\n     ', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["selected"], 0);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\r\n        ', 0);
                var option6 = {
                    escape: 1
                };
                var params7 = [];
                params7.push('selected');
                option6.params = params7;
                var callRet8
                callRet8 = callFnUtil(engine, scope, option6, buffer, ["getBaseCssClasses"], 0, 3);
                if (callRet8 && callRet8.isBuffer) {
                    buffer = callRet8;
                    callRet8 = undefined;
                }
                buffer.write(callRet8, true);
                buffer.write('\r\n     ', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option3, buffer, 2, payload);
            buffer.write('\r\n     ">\r\n    <div class="', 0);
            var option9 = {
                escape: 1
            };
            var params10 = [];
            params10.push('expand-icon');
            option9.params = params10;
            var callRet11
            callRet11 = callFnUtil(engine, scope, option9, buffer, ["getBaseCssClasses"], 0, 6);
            if (callRet11 && callRet11.isBuffer) {
                buffer = callRet11;
                callRet11 = undefined;
            }
            buffer.write(callRet11, true);
            buffer.write('">\r\n    </div>\r\n    ', 0);
            var option12 = {
                escape: 1
            };
            var params13 = [];
            var id14 = scope.resolve(["checkable"], 0);
            params13.push(id14);
            option12.params = params13;
            option12.fn = function (scope, buffer) {
                buffer.write('\r\n    <div class="', 0);
                var option15 = {
                    escape: 1
                };
                var params16 = [];
                var exp18 = 'checked';
                var id17 = scope.resolve(["checkState"], 0);
                exp18 = ('checked') + (id17);
                params16.push(exp18);
                option15.params = params16;
                var callRet19
                callRet19 = callFnUtil(engine, scope, option15, buffer, ["getBaseCssClasses"], 0, 9);
                if (callRet19 && callRet19.isBuffer) {
                    buffer = callRet19;
                    callRet19 = undefined;
                }
                buffer.write(callRet19, true);
                buffer.write(' ', 0);
                var option20 = {
                    escape: 1
                };
                var params21 = [];
                params21.push('checked');
                option20.params = params21;
                var callRet22
                callRet22 = callFnUtil(engine, scope, option20, buffer, ["getBaseCssClasses"], 0, 9);
                if (callRet22 && callRet22.isBuffer) {
                    buffer = callRet22;
                    callRet22 = undefined;
                }
                buffer.write(callRet22, true);
                buffer.write('"></div>\r\n    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option12, buffer, 8, payload);
            buffer.write('\r\n    <div class="', 0);
            var option23 = {
                escape: 1
            };
            var params24 = [];
            params24.push('icon');
            option23.params = params24;
            var callRet25
            callRet25 = callFnUtil(engine, scope, option23, buffer, ["getBaseCssClasses"], 0, 11);
            if (callRet25 && callRet25.isBuffer) {
                buffer = callRet25;
                callRet25 = undefined;
            }
            buffer.write(callRet25, true);
            buffer.write('">\r\n\r\n    </div>\r\n    ', 0);
            var option26 = {};
            var params27 = [];
            params27.push('component/extension/content-xtpl');
            option26.params = params27;
            require("component/extension/content-xtpl");
            var callRet28
            callRet28 = includeCommand.call(engine, scope, option26, buffer, 14, payload);
            if (callRet28 && callRet28.isBuffer) {
                buffer = callRet28;
                callRet28 = undefined;
            }
            buffer.write(callRet28, false);
            buffer.write('\r\n</div>\r\n<div class="', 0);
            var option29 = {
                escape: 1
            };
            var params30 = [];
            params30.push('children');
            option29.params = params30;
            var callRet31
            callRet31 = callFnUtil(engine, scope, option29, buffer, ["getBaseCssClasses"], 0, 16);
            if (callRet31 && callRet31.isBuffer) {
                buffer = callRet31;
                callRet31 = undefined;
            }
            buffer.write(callRet31, true);
            buffer.write('"\r\n', 0);
            var option32 = {
                escape: 1
            };
            var params33 = [];
            var id34 = scope.resolve(["expanded"], 0);
            params33.push(!(id34));
            option32.params = params33;
            option32.fn = function (scope, buffer) {
                buffer.write('\r\nstyle="display:none"\r\n', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option32, buffer, 17, payload);
            buffer.write('\r\n>\r\n</div>', 0);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});