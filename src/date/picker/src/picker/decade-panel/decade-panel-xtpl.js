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
            params4.push('prev-century-btn');
            option3.params = params4;
            var callRet5
            callRet5 = callFnUtil(engine, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
            if (callRet5 && callRet5.isBuffer) {
                buffer = callRet5;
                callRet5 = undefined;
            }
            buffer.write(callRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
            var id6 = scope.resolve(["previousCenturyLabel"], 0);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <div class="', 0);
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('century');
            option7.params = params8;
            var callRet9
            callRet9 = callFnUtil(engine, scope, option7, buffer, ["getBaseCssClasses"], 0, 8);
            if (callRet9 && callRet9.isBuffer) {
                buffer = callRet9;
                callRet9 = undefined;
            }
            buffer.write(callRet9, true);
            buffer.write('">\r\n                ', 0);
            var id10 = scope.resolve(["startYear"], 0);
            buffer.write(id10, true);
            buffer.write('-', 0);
            var id11 = scope.resolve(["endYear"], 0);
            buffer.write(id11, true);
            buffer.write('\r\n    </div>\r\n    <a class="', 0);
            var option12 = {
                escape: 1
            };
            var params13 = [];
            params13.push('next-century-btn');
            option12.params = params13;
            var callRet14
            callRet14 = callFnUtil(engine, scope, option12, buffer, ["getBaseCssClasses"], 0, 11);
            if (callRet14 && callRet14.isBuffer) {
                buffer = callRet14;
                callRet14 = undefined;
            }
            buffer.write(callRet14, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
            var id15 = scope.resolve(["nextCenturyLabel"], 0);
            buffer.write(id15, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('body');
            option16.params = params17;
            var callRet18
            callRet18 = callFnUtil(engine, scope, option16, buffer, ["getBaseCssClasses"], 0, 18);
            if (callRet18 && callRet18.isBuffer) {
                buffer = callRet18;
                callRet18 = undefined;
            }
            buffer.write(callRet18, true);
            buffer.write('">\r\n    <table class="', 0);
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('table');
            option19.params = params20;
            var callRet21
            callRet21 = callFnUtil(engine, scope, option19, buffer, ["getBaseCssClasses"], 0, 19);
            if (callRet21 && callRet21.isBuffer) {
                buffer = callRet21;
                callRet21 = undefined;
            }
            buffer.write(callRet21, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('tbody');
            option22.params = params23;
            var callRet24
            callRet24 = callFnUtil(engine, scope, option22, buffer, ["getBaseCssClasses"], 0, 20);
            if (callRet24 && callRet24.isBuffer) {
                buffer = callRet24;
                callRet24 = undefined;
            }
            buffer.write(callRet24, true);
            buffer.write('">\r\n        ', 0);
            var option25 = {};
            var params26 = [];
            params26.push('./decades-xtpl');
            option25.params = params26;
            require("./decades-xtpl");
            var callRet27
            callRet27 = includeCommand.call(engine, scope, option25, buffer, 21, payload);
            if (callRet27 && callRet27.isBuffer) {
                buffer = callRet27;
                callRet27 = undefined;
            }
            buffer.write(callRet27, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});