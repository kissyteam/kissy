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
            params1.push('header');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(engine, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
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
            params4.push('prev-year-btn');
            option3.params = params4;
            var callRet5
            callRet5 = callFnUtil(engine, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
            if (callRet5 && callRet5.isBuffer) {
                buffer = callRet5;
                callRet5 = undefined;
            }
            buffer.write(callRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
            var id6 = scope.resolve(["previousYearLabel"], 0);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="', 0);
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('year-select');
            option7.params = params8;
            var callRet9
            callRet9 = callFnUtil(engine, scope, option7, buffer, ["getBaseCssClasses"], 0, 9);
            if (callRet9 && callRet9.isBuffer) {
                buffer = callRet9;
                callRet9 = undefined;
            }
            buffer.write(callRet9, true);
            buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="', 0);
            var id10 = scope.resolve(["yearSelectLabel"], 0);
            buffer.write(id10, true);
            buffer.write('">\r\n        <span class="', 0);
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('year-select-content');
            option11.params = params12;
            var callRet13
            callRet13 = callFnUtil(engine, scope, option11, buffer, ["getBaseCssClasses"], 0, 14);
            if (callRet13 && callRet13.isBuffer) {
                buffer = callRet13;
                callRet13 = undefined;
            }
            buffer.write(callRet13, true);
            buffer.write('">', 0);
            var id14 = scope.resolve(["year"], 0);
            buffer.write(id14, true);
            buffer.write('</span>\r\n        <span class="', 0);
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('year-select-arrow');
            option15.params = params16;
            var callRet17
            callRet17 = callFnUtil(engine, scope, option15, buffer, ["getBaseCssClasses"], 0, 15);
            if (callRet17 && callRet17.isBuffer) {
                buffer = callRet17;
                callRet17 = undefined;
            }
            buffer.write(callRet17, true);
            buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="', 0);
            var option18 = {
                escape: 1
            };
            var params19 = [];
            params19.push('next-year-btn');
            option18.params = params19;
            var callRet20
            callRet20 = callFnUtil(engine, scope, option18, buffer, ["getBaseCssClasses"], 0, 18);
            if (callRet20 && callRet20.isBuffer) {
                buffer = callRet20;
                callRet20 = undefined;
            }
            buffer.write(callRet20, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
            var id21 = scope.resolve(["nextYearLabel"], 0);
            buffer.write(id21, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('body');
            option22.params = params23;
            var callRet24
            callRet24 = callFnUtil(engine, scope, option22, buffer, ["getBaseCssClasses"], 0, 25);
            if (callRet24 && callRet24.isBuffer) {
                buffer = callRet24;
                callRet24 = undefined;
            }
            buffer.write(callRet24, true);
            buffer.write('">\r\n    <table class="', 0);
            var option25 = {
                escape: 1
            };
            var params26 = [];
            params26.push('table');
            option25.params = params26;
            var callRet27
            callRet27 = callFnUtil(engine, scope, option25, buffer, ["getBaseCssClasses"], 0, 26);
            if (callRet27 && callRet27.isBuffer) {
                buffer = callRet27;
                callRet27 = undefined;
            }
            buffer.write(callRet27, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
            var option28 = {
                escape: 1
            };
            var params29 = [];
            params29.push('tbody');
            option28.params = params29;
            var callRet30
            callRet30 = callFnUtil(engine, scope, option28, buffer, ["getBaseCssClasses"], 0, 27);
            if (callRet30 && callRet30.isBuffer) {
                buffer = callRet30;
                callRet30 = undefined;
            }
            buffer.write(callRet30, true);
            buffer.write('">\r\n        ', 0);
            var option31 = {};
            var params32 = [];
            params32.push('./months-xtpl');
            option31.params = params32;
            require("./months-xtpl");
            var callRet33
            callRet33 = includeCommand.call(engine, scope, option31, buffer, 28, payload);
            if (callRet33 && callRet33.isBuffer) {
                buffer = callRet33;
                callRet33 = undefined;
            }
            buffer.write(callRet33, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});