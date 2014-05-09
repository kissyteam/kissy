/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var yearPanel = function (scope, buffer, undefined) {
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
            params1.push('header');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('">\r\n    <a class="', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('prev-decade-btn');
            option3.params = params4;
            var callRet5
            callRet5 = callFnUtil(tpl, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
            if (callRet5 && callRet5.isBuffer) {
                buffer = callRet5;
                callRet5 = undefined;
            }
            buffer.write(callRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
            var id6 = scope.resolve(["previousDecadeLabel"], 0);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="', 0);
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('decade-select');
            option7.params = params8;
            var callRet9
            callRet9 = callFnUtil(tpl, scope, option7, buffer, ["getBaseCssClasses"], 0, 9);
            if (callRet9 && callRet9.isBuffer) {
                buffer = callRet9;
                callRet9 = undefined;
            }
            buffer.write(callRet9, true);
            buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="', 0);
            var id10 = scope.resolve(["decadeSelectLabel"], 0);
            buffer.write(id10, true);
            buffer.write('">\r\n            <span class="', 0);
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('decade-select-content');
            option11.params = params12;
            var callRet13
            callRet13 = callFnUtil(tpl, scope, option11, buffer, ["getBaseCssClasses"], 0, 14);
            if (callRet13 && callRet13.isBuffer) {
                buffer = callRet13;
                callRet13 = undefined;
            }
            buffer.write(callRet13, true);
            buffer.write('">\r\n                ', 0);
            var id14 = scope.resolve(["startYear"], 0);
            buffer.write(id14, true);
            buffer.write('-', 0);
            var id15 = scope.resolve(["endYear"], 0);
            buffer.write(id15, true);
            buffer.write('\r\n            </span>\r\n        <span class="', 0);
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('decade-select-arrow');
            option16.params = params17;
            var callRet18
            callRet18 = callFnUtil(tpl, scope, option16, buffer, ["getBaseCssClasses"], 0, 17);
            if (callRet18 && callRet18.isBuffer) {
                buffer = callRet18;
                callRet18 = undefined;
            }
            buffer.write(callRet18, true);
            buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="', 0);
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('next-decade-btn');
            option19.params = params20;
            var callRet21
            callRet21 = callFnUtil(tpl, scope, option19, buffer, ["getBaseCssClasses"], 0, 20);
            if (callRet21 && callRet21.isBuffer) {
                buffer = callRet21;
                callRet21 = undefined;
            }
            buffer.write(callRet21, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
            var id22 = scope.resolve(["nextDecadeLabel"], 0);
            buffer.write(id22, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
            var option23 = {
                escape: 1
            };
            var params24 = [];
            params24.push('body');
            option23.params = params24;
            var callRet25
            callRet25 = callFnUtil(tpl, scope, option23, buffer, ["getBaseCssClasses"], 0, 27);
            if (callRet25 && callRet25.isBuffer) {
                buffer = callRet25;
                callRet25 = undefined;
            }
            buffer.write(callRet25, true);
            buffer.write('">\r\n    <table class="', 0);
            var option26 = {
                escape: 1
            };
            var params27 = [];
            params27.push('table');
            option26.params = params27;
            var callRet28
            callRet28 = callFnUtil(tpl, scope, option26, buffer, ["getBaseCssClasses"], 0, 28);
            if (callRet28 && callRet28.isBuffer) {
                buffer = callRet28;
                callRet28 = undefined;
            }
            buffer.write(callRet28, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
            var option29 = {
                escape: 1
            };
            var params30 = [];
            params30.push('tbody');
            option29.params = params30;
            var callRet31
            callRet31 = callFnUtil(tpl, scope, option29, buffer, ["getBaseCssClasses"], 0, 29);
            if (callRet31 && callRet31.isBuffer) {
                buffer = callRet31;
                callRet31 = undefined;
            }
            buffer.write(callRet31, true);
            buffer.write('">\r\n        ', 0);
            var option32 = {};
            var params33 = [];
            params33.push('./years-xtpl');
            option32.params = params33;
            require("./years-xtpl");
            var callRet34
            callRet34 = includeCommand.call(tpl, scope, option32, buffer, 30);
            if (callRet34 && callRet34.isBuffer) {
                buffer = callRet34;
                callRet34 = undefined;
            }
            buffer.write(callRet34, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
            return buffer;
        };
yearPanel.TPL_NAME = module.name;
yearPanel.version = "5.0.0";
return yearPanel
});