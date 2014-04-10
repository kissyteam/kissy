/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
            buffer.write('<div class="');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["axis"]);
            var exp3 = id2;
            exp3 = (id2) + ('-arrow-up arrow-up');
            params1.push(exp3);
            option0.params = params1;
            var commandRet4 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet4 && commandRet4.isBuffer) {
                buffer = commandRet4;
                commandRet4 = undefined;
            }
            buffer.write(commandRet4, true);
            buffer.write('">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div class="');
            var option5 = {
                escape: 1
            };
            var params6 = [];
            var id7 = scope.resolve(["axis"]);
            var exp8 = id7;
            exp8 = (id7) + ('-arrow-down arrow-down');
            params6.push(exp8);
            option5.params = params6;
            var commandRet9 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div class="');
            var option10 = {
                escape: 1
            };
            var params11 = [];
            var id12 = scope.resolve(["axis"]);
            var exp13 = id12;
            exp13 = (id12) + ('-track track');
            params11.push(exp13);
            option10.params = params11;
            var commandRet14 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 7);
            if (commandRet14 && commandRet14.isBuffer) {
                buffer = commandRet14;
                commandRet14 = undefined;
            }
            buffer.write(commandRet14, true);
            buffer.write('">\n<div class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            var id17 = scope.resolve(["axis"]);
            var exp18 = id17;
            exp18 = (id17) + ('-drag drag');
            params16.push(exp18);
            option15.params = params16;
            var commandRet19 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 8);
            if (commandRet19 && commandRet19.isBuffer) {
                buffer = commandRet19;
                commandRet19 = undefined;
            }
            buffer.write(commandRet19, true);
            buffer.write('">\n<div class="');
            var option20 = {
                escape: 1
            };
            var params21 = [];
            var id22 = scope.resolve(["axis"]);
            var exp23 = id22;
            exp23 = (id22) + ('-drag-top');
            params21.push(exp23);
            option20.params = params21;
            var commandRet24 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 9);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, true);
            buffer.write('">\n</div>\n<div class="');
            var option25 = {
                escape: 1
            };
            var params26 = [];
            var id27 = scope.resolve(["axis"]);
            var exp28 = id27;
            exp28 = (id27) + ('-drag-center');
            params26.push(exp28);
            option25.params = params26;
            var commandRet29 = callCommandUtil(engine, scope, option25, buffer, "getBaseCssClasses", 11);
            if (commandRet29 && commandRet29.isBuffer) {
                buffer = commandRet29;
                commandRet29 = undefined;
            }
            buffer.write(commandRet29, true);
            buffer.write('">\n</div>\n<div class="');
            var option30 = {
                escape: 1
            };
            var params31 = [];
            var id32 = scope.resolve(["axis"]);
            var exp33 = id32;
            exp33 = (id32) + ('-drag-bottom');
            params31.push(exp33);
            option30.params = params31;
            var commandRet34 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 13);
            if (commandRet34 && commandRet34.isBuffer) {
                buffer = commandRet34;
                commandRet34 = undefined;
            }
            buffer.write(commandRet34, true);
            buffer.write('">\n</div>\n</div>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});