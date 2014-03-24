/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, buffer, payload, undefined) {
            var engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<div id="ks-scrollbar-arrow-up-');
            var id0 = scope.resolve(["id"]);
            buffer.write(id0, true);
            buffer.write('"\n        class="');
            var option1 = {
                escape: 1
            };
            var params2 = [];
            var id3 = scope.resolve(["axis"]);
            var exp4 = id3;
            exp4 = (id3) + ('-arrow-up');
            params2.push(exp4);
            option1.params = params2;
            var commandRet5 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-');
            var id6 = scope.resolve(["id"]);
            buffer.write(id6, true);
            buffer.write('"\n        class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            var id9 = scope.resolve(["axis"]);
            var exp10 = id9;
            exp10 = (id9) + ('-arrow-down');
            params8.push(exp10);
            option7.params = params8;
            var commandRet11 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 6);
            if (commandRet11 && commandRet11.isBuffer) {
                buffer = commandRet11;
                commandRet11 = undefined;
            }
            buffer.write(commandRet11, true);
            buffer.write('">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-');
            var id12 = scope.resolve(["id"]);
            buffer.write(id12, true);
            buffer.write('"\n     class="');
            var option13 = {
                escape: 1
            };
            var params14 = [];
            var id15 = scope.resolve(["axis"]);
            var exp16 = id15;
            exp16 = (id15) + ('-track');
            params14.push(exp16);
            option13.params = params14;
            var commandRet17 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 10);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('">\n<div id="ks-scrollbar-drag-');
            var id18 = scope.resolve(["id"]);
            buffer.write(id18, true);
            buffer.write('"\n     class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            var id21 = scope.resolve(["axis"]);
            var exp22 = id21;
            exp22 = (id21) + ('-drag');
            params20.push(exp22);
            option19.params = params20;
            var commandRet23 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 12);
            if (commandRet23 && commandRet23.isBuffer) {
                buffer = commandRet23;
                commandRet23 = undefined;
            }
            buffer.write(commandRet23, true);
            buffer.write('">\n<div class="');
            var option24 = {
                escape: 1
            };
            var params25 = [];
            var id26 = scope.resolve(["axis"]);
            var exp27 = id26;
            exp27 = (id26) + ('-drag-top');
            params25.push(exp27);
            option24.params = params25;
            var commandRet28 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 13);
            if (commandRet28 && commandRet28.isBuffer) {
                buffer = commandRet28;
                commandRet28 = undefined;
            }
            buffer.write(commandRet28, true);
            buffer.write('">\n</div>\n<div class="');
            var option29 = {
                escape: 1
            };
            var params30 = [];
            var id31 = scope.resolve(["axis"]);
            var exp32 = id31;
            exp32 = (id31) + ('-drag-center');
            params30.push(exp32);
            option29.params = params30;
            var commandRet33 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 15);
            if (commandRet33 && commandRet33.isBuffer) {
                buffer = commandRet33;
                commandRet33 = undefined;
            }
            buffer.write(commandRet33, true);
            buffer.write('">\n</div>\n<div class="');
            var option34 = {
                escape: 1
            };
            var params35 = [];
            var id36 = scope.resolve(["axis"]);
            var exp37 = id36;
            exp37 = (id36) + ('-drag-bottom');
            params35.push(exp37);
            option34.params = params35;
            var commandRet38 = callCommandUtil(engine, scope, option34, buffer, "getBaseCssClasses", 17);
            if (commandRet38 && commandRet38.isBuffer) {
                buffer = commandRet38;
                commandRet38 = undefined;
            }
            buffer.write(commandRet38, true);
            buffer.write('">\n</div>\n</div>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});