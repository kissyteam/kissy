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
            buffer.write('<div id="ks-combobox-invalid-el-');
            var id0 = scope.resolve(["id"]);
            buffer.write(id0, true);
            buffer.write('"\n     class="');
            var option1 = {
                escape: 1
            };
            var params2 = [];
            params2.push('invalid-el');
            option1.params = params2;
            var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
            if (commandRet3 && commandRet3.isBuffer) {
                buffer = commandRet3;
                commandRet3 = undefined;
            }
            buffer.write(commandRet3, true);
            buffer.write('">\n    <div class="');
            var option4 = {
                escape: 1
            };
            var params5 = [];
            params5.push('invalid-inner');
            option4.params = params5;
            var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
            if (commandRet6 && commandRet6.isBuffer) {
                buffer = commandRet6;
                commandRet6 = undefined;
            }
            buffer.write(commandRet6, true);
            buffer.write('"></div>\n</div>\n\n');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            var id9 = scope.resolve(["hasTrigger"]);
            params8.push(id9);
            option7.params = params8;
            option7.fn = function (scope, buffer) {

                buffer.write('\n<div id="ks-combobox-trigger-');
                var id10 = scope.resolve(["id"]);
                buffer.write(id10, true);
                buffer.write('"\n     class="');
                var option11 = {
                    escape: 1
                };
                var params12 = [];
                params12.push('trigger');
                option11.params = params12;
                var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 8);
                if (commandRet13 && commandRet13.isBuffer) {
                    buffer = commandRet13;
                    commandRet13 = undefined;
                }
                buffer.write(commandRet13, true);
                buffer.write('">\n    <div class="');
                var option14 = {
                    escape: 1
                };
                var params15 = [];
                params15.push('trigger-inner');
                option14.params = params15;
                var commandRet16 = callCommandUtil(engine, scope, option14, buffer, "getBaseCssClasses", 9);
                if (commandRet16 && commandRet16.isBuffer) {
                    buffer = commandRet16;
                    commandRet16 = undefined;
                }
                buffer.write(commandRet16, true);
                buffer.write('">&#x25BC;</div>\n</div>\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option7, buffer, 6, payload);
            buffer.write('\n\n<div class="');
            var option17 = {
                escape: 1
            };
            var params18 = [];
            params18.push('input-wrap');
            option17.params = params18;
            var commandRet19 = callCommandUtil(engine, scope, option17, buffer, "getBaseCssClasses", 13);
            if (commandRet19 && commandRet19.isBuffer) {
                buffer = commandRet19;
                commandRet19 = undefined;
            }
            buffer.write(commandRet19, true);
            buffer.write('">\n\n    <input id="ks-combobox-input-');
            var id20 = scope.resolve(["id"]);
            buffer.write(id20, true);
            buffer.write('"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ');
            var option21 = {
                escape: 1
            };
            var params22 = [];
            var id23 = scope.resolve(["disabled"]);
            params22.push(id23);
            option21.params = params22;
            option21.fn = function (scope, buffer) {

                buffer.write('\n    disabled\n    ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option21, buffer, 22, payload);
            buffer.write('\n\n    autocomplete="off"\n    class="');
            var option24 = {
                escape: 1
            };
            var params25 = [];
            params25.push('input');
            option24.params = params25;
            var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 27);
            if (commandRet26 && commandRet26.isBuffer) {
                buffer = commandRet26;
                commandRet26 = undefined;
            }
            buffer.write(commandRet26, true);
            buffer.write('"\n\n    value="');
            var id27 = scope.resolve(["value"]);
            buffer.write(id27, true);
            buffer.write('"\n    />\n\n\n    <label id="ks-combobox-placeholder-');
            var id28 = scope.resolve(["id"]);
            buffer.write(id28, true);
            buffer.write('"\n           for="ks-combobox-input-');
            var id29 = scope.resolve(["id"]);
            buffer.write(id29, true);
            buffer.write('"\n            style=\'display:');
            var option30 = {
                escape: 1
            };
            var params31 = [];
            var id32 = scope.resolve(["value"]);
            params31.push(id32);
            option30.params = params31;
            option30.fn = function (scope, buffer) {

                buffer.write('none');

                return buffer;
            };
            option30.inverse = function (scope, buffer) {

                buffer.write('block');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option30, buffer, 35, payload);
            buffer.write(';\'\n    class="');
            var option33 = {
                escape: 1
            };
            var params34 = [];
            params34.push('placeholder');
            option33.params = params34;
            var commandRet35 = callCommandUtil(engine, scope, option33, buffer, "getBaseCssClasses", 36);
            if (commandRet35 && commandRet35.isBuffer) {
                buffer = commandRet35;
                commandRet35 = undefined;
            }
            buffer.write(commandRet35, true);
            buffer.write('">\n    ');
            var id36 = scope.resolve(["placeholder"]);
            buffer.write(id36, true);
            buffer.write('\n    </label>\n</div>\n');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});