/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var combobox = function (scope, buffer, undefined) {
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
            buffer.write('<div class="', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('invalid-el');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
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
            params4.push('invalid-inner');
            option3.params = params4;
            var callRet5
            callRet5 = callFnUtil(tpl, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
            if (callRet5 && callRet5.isBuffer) {
                buffer = callRet5;
                callRet5 = undefined;
            }
            buffer.write(callRet5, true);
            buffer.write('"></div>\r\n</div>\r\n\r\n', 0);
            var option6 = {
                escape: 1
            };
            var params7 = [];
            var id8 = scope.resolve(["hasTrigger"], 0);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope, buffer) {
                buffer.write('\r\n<div class="', 0);
                var option9 = {
                    escape: 1
                };
                var params10 = [];
                params10.push('trigger');
                option9.params = params10;
                var callRet11
                callRet11 = callFnUtil(tpl, scope, option9, buffer, ["getBaseCssClasses"], 0, 6);
                if (callRet11 && callRet11.isBuffer) {
                    buffer = callRet11;
                    callRet11 = undefined;
                }
                buffer.write(callRet11, true);
                buffer.write('">\r\n    <div class="', 0);
                var option12 = {
                    escape: 1
                };
                var params13 = [];
                params13.push('trigger-inner');
                option12.params = params13;
                var callRet14
                callRet14 = callFnUtil(tpl, scope, option12, buffer, ["getBaseCssClasses"], 0, 7);
                if (callRet14 && callRet14.isBuffer) {
                    buffer = callRet14;
                    callRet14 = undefined;
                }
                buffer.write(callRet14, true);
                buffer.write('">&#x25BC;</div>\r\n</div>\r\n', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option6, buffer, 5);
            buffer.write('\r\n\r\n<div class="', 0);
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('input-wrap');
            option15.params = params16;
            var callRet17
            callRet17 = callFnUtil(tpl, scope, option15, buffer, ["getBaseCssClasses"], 0, 11);
            if (callRet17 && callRet17.isBuffer) {
                buffer = callRet17;
                callRet17 = undefined;
            }
            buffer.write(callRet17, true);
            buffer.write('">\r\n\r\n    <input id="ks-combobox-input-', 0);
            var id18 = scope.resolve(["id"], 0);
            buffer.write(id18, true);
            buffer.write('"\r\n           aria-haspopup="true"\r\n           aria-autocomplete="list"\r\n           aria-haspopup="true"\r\n           role="autocomplete"\r\n           aria-expanded="false"\r\n\r\n    ', 0);
            var option19 = {
                escape: 1
            };
            var params20 = [];
            var id21 = scope.resolve(["disabled"], 0);
            params20.push(id21);
            option19.params = params20;
            option19.fn = function (scope, buffer) {
                buffer.write('\r\n    disabled\r\n    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option19, buffer, 20);
            buffer.write('\r\n\r\n    autocomplete="off"\r\n    class="', 0);
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('input');
            option22.params = params23;
            var callRet24
            callRet24 = callFnUtil(tpl, scope, option22, buffer, ["getBaseCssClasses"], 0, 25);
            if (callRet24 && callRet24.isBuffer) {
                buffer = callRet24;
                callRet24 = undefined;
            }
            buffer.write(callRet24, true);
            buffer.write('"\r\n\r\n    value="', 0);
            var id25 = scope.resolve(["value"], 0);
            buffer.write(id25, true);
            buffer.write('"\r\n    />\r\n\r\n\r\n    <label for="ks-combobox-input-', 0);
            var id26 = scope.resolve(["id"], 0);
            buffer.write(id26, true);
            buffer.write('"\r\n            style=\'display:', 0);
            var option27 = {
                escape: 1
            };
            var params28 = [];
            var id29 = scope.resolve(["value"], 0);
            params28.push(id29);
            option27.params = params28;
            option27.fn = function (scope, buffer) {
                buffer.write('none', 0);
                return buffer;
            };
            option27.inverse = function (scope, buffer) {
                buffer.write('block', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option27, buffer, 32);
            buffer.write(';\'\r\n    class="', 0);
            var option30 = {
                escape: 1
            };
            var params31 = [];
            params31.push('placeholder');
            option30.params = params31;
            var callRet32
            callRet32 = callFnUtil(tpl, scope, option30, buffer, ["getBaseCssClasses"], 0, 33);
            if (callRet32 && callRet32.isBuffer) {
                buffer = callRet32;
                callRet32 = undefined;
            }
            buffer.write(callRet32, true);
            buffer.write('">\r\n    ', 0);
            var id33 = scope.resolve(["placeholder"], 0);
            buffer.write(id33, true);
            buffer.write('\r\n    </label>\r\n\r\n    <div class="', 0);
            var option34 = {
                escape: 1
            };
            var params35 = [];
            params35.push('clear');
            option34.params = params35;
            var callRet36
            callRet36 = callFnUtil(tpl, scope, option34, buffer, ["getBaseCssClasses"], 0, 37);
            if (callRet36 && callRet36.isBuffer) {
                buffer = callRet36;
                callRet36 = undefined;
            }
            buffer.write(callRet36, true);
            buffer.write('"\r\n         unselectable="on"\r\n         ', 0);
            var option37 = {
                escape: 1
            };
            var params38 = [];
            var id39 = scope.resolve(["value"], 0);
            params38.push(!(id39));
            option37.params = params38;
            option37.fn = function (scope, buffer) {
                buffer.write('\r\n         style="display:none"\r\n         ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option37, buffer, 39);
            buffer.write('\r\n         onmousedown="return false;"><div\r\n            class="', 0);
            var option40 = {
                escape: 1
            };
            var params41 = [];
            params41.push('clear-inner');
            option40.params = params41;
            var callRet42
            callRet42 = callFnUtil(tpl, scope, option40, buffer, ["getBaseCssClasses"], 0, 43);
            if (callRet42 && callRet42.isBuffer) {
                buffer = callRet42;
                callRet42 = undefined;
            }
            buffer.write(callRet42, true);
            buffer.write('">clear</div></div>\r\n</div>\r\n', 0);
            return buffer;
        };
combobox.TPL_NAME = module.name;
combobox.version = "5.0.0";
return combobox
});