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
            var id2 = scope.resolve(["axis"], 0);
            var exp3 = id2;
            exp3 = (id2) + ('-arrow-up arrow-up');
            params1.push(exp3);
            option0.params = params1;
            var callRet4
            callRet4 = callFnUtil(engine, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
            if (callRet4 && callRet4.isBuffer) {
                buffer = callRet4;
                callRet4 = undefined;
            }
            buffer.write(callRet4, true);
            buffer.write('">\r\n    <a href="javascript:void(\'up\')">up</a>\r\n</div>\r\n<div class="', 0);
            var option5 = {
                escape: 1
            };
            var params6 = [];
            var id7 = scope.resolve(["axis"], 0);
            var exp8 = id7;
            exp8 = (id7) + ('-arrow-down arrow-down');
            params6.push(exp8);
            option5.params = params6;
            var callRet9
            callRet9 = callFnUtil(engine, scope, option5, buffer, ["getBaseCssClasses"], 0, 4);
            if (callRet9 && callRet9.isBuffer) {
                buffer = callRet9;
                callRet9 = undefined;
            }
            buffer.write(callRet9, true);
            buffer.write('">\r\n    <a href="javascript:void(\'down\')">down</a>\r\n</div>\r\n<div class="', 0);
            var option10 = {
                escape: 1
            };
            var params11 = [];
            var id12 = scope.resolve(["axis"], 0);
            var exp13 = id12;
            exp13 = (id12) + ('-track track');
            params11.push(exp13);
            option10.params = params11;
            var callRet14
            callRet14 = callFnUtil(engine, scope, option10, buffer, ["getBaseCssClasses"], 0, 7);
            if (callRet14 && callRet14.isBuffer) {
                buffer = callRet14;
                callRet14 = undefined;
            }
            buffer.write(callRet14, true);
            buffer.write('">\r\n<div class="', 0);
            var option15 = {
                escape: 1
            };
            var params16 = [];
            var id17 = scope.resolve(["axis"], 0);
            var exp18 = id17;
            exp18 = (id17) + ('-drag drag');
            params16.push(exp18);
            option15.params = params16;
            var callRet19
            callRet19 = callFnUtil(engine, scope, option15, buffer, ["getBaseCssClasses"], 0, 8);
            if (callRet19 && callRet19.isBuffer) {
                buffer = callRet19;
                callRet19 = undefined;
            }
            buffer.write(callRet19, true);
            buffer.write('">\r\n<div class="', 0);
            var option20 = {
                escape: 1
            };
            var params21 = [];
            var id22 = scope.resolve(["axis"], 0);
            var exp23 = id22;
            exp23 = (id22) + ('-drag-top');
            params21.push(exp23);
            option20.params = params21;
            var callRet24
            callRet24 = callFnUtil(engine, scope, option20, buffer, ["getBaseCssClasses"], 0, 9);
            if (callRet24 && callRet24.isBuffer) {
                buffer = callRet24;
                callRet24 = undefined;
            }
            buffer.write(callRet24, true);
            buffer.write('">\r\n</div>\r\n<div class="', 0);
            var option25 = {
                escape: 1
            };
            var params26 = [];
            var id27 = scope.resolve(["axis"], 0);
            var exp28 = id27;
            exp28 = (id27) + ('-drag-center');
            params26.push(exp28);
            option25.params = params26;
            var callRet29
            callRet29 = callFnUtil(engine, scope, option25, buffer, ["getBaseCssClasses"], 0, 11);
            if (callRet29 && callRet29.isBuffer) {
                buffer = callRet29;
                callRet29 = undefined;
            }
            buffer.write(callRet29, true);
            buffer.write('">\r\n</div>\r\n<div class="', 0);
            var option30 = {
                escape: 1
            };
            var params31 = [];
            var id32 = scope.resolve(["axis"], 0);
            var exp33 = id32;
            exp33 = (id32) + ('-drag-bottom');
            params31.push(exp33);
            option30.params = params31;
            var callRet34
            callRet34 = callFnUtil(engine, scope, option30, buffer, ["getBaseCssClasses"], 0, 13);
            if (callRet34 && callRet34.isBuffer) {
                buffer = callRet34;
                callRet34 = undefined;
            }
            buffer.write(callRet34, true);
            buffer.write('">\r\n</div>\r\n</div>\r\n</div>', 0);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});