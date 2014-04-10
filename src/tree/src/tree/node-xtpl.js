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
            params1.push('row');
            option0.params = params1;
            var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('\n     ');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["selected"]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {

                buffer.write('\n        ');
                var option6 = {
                    escape: 1
                };
                var params7 = [];
                params7.push('selected');
                option6.params = params7;
                var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
                if (commandRet8 && commandRet8.isBuffer) {
                    buffer = commandRet8;
                    commandRet8 = undefined;
                }
                buffer.write(commandRet8, true);
                buffer.write('\n     ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option3, buffer, 2, payload);
            buffer.write('\n     ">\n    <div class="');
            var option9 = {
                escape: 1
            };
            var params10 = [];
            params10.push('expand-icon');
            option9.params = params10;
            var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 6);
            if (commandRet11 && commandRet11.isBuffer) {
                buffer = commandRet11;
                commandRet11 = undefined;
            }
            buffer.write(commandRet11, true);
            buffer.write('">\n    </div>\n    ');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            var id14 = scope.resolve(["checkable"]);
            params13.push(id14);
            option12.params = params13;
            option12.fn = function (scope, buffer) {

                buffer.write('\n    <div class="');
                var option15 = {
                    escape: 1
                };
                var params16 = [];
                var exp18 = 'checked';
                var id17 = scope.resolve(["checkState"]);
                exp18 = ('checked') + (id17);
                params16.push(exp18);
                option15.params = params16;
                var commandRet19 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 9);
                if (commandRet19 && commandRet19.isBuffer) {
                    buffer = commandRet19;
                    commandRet19 = undefined;
                }
                buffer.write(commandRet19, true);
                buffer.write(' ');
                var option20 = {
                    escape: 1
                };
                var params21 = [];
                params21.push('checked');
                option20.params = params21;
                var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 9);
                if (commandRet22 && commandRet22.isBuffer) {
                    buffer = commandRet22;
                    commandRet22 = undefined;
                }
                buffer.write(commandRet22, true);
                buffer.write('"></div>\n    ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option12, buffer, 8, payload);
            buffer.write('\n    <div class="');
            var option23 = {
                escape: 1
            };
            var params24 = [];
            params24.push('icon');
            option23.params = params24;
            var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 11);
            if (commandRet25 && commandRet25.isBuffer) {
                buffer = commandRet25;
                commandRet25 = undefined;
            }
            buffer.write(commandRet25, true);
            buffer.write('">\n\n    </div>\n    ');
            var option26 = {};
            var params27 = [];
            params27.push('component/extension/content-xtpl');
            option26.params = params27;
            require("component/extension/content-xtpl");
            option26.params[0] = module.resolve(option26.params[0]);
            var commandRet28 = includeCommand.call(engine, scope, option26, buffer, 14, payload);
            if (commandRet28 && commandRet28.isBuffer) {
                buffer = commandRet28;
                commandRet28 = undefined;
            }
            buffer.write(commandRet28, false);
            buffer.write('\n</div>\n<div class="');
            var option29 = {
                escape: 1
            };
            var params30 = [];
            params30.push('children');
            option29.params = params30;
            var commandRet31 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 16);
            if (commandRet31 && commandRet31.isBuffer) {
                buffer = commandRet31;
                commandRet31 = undefined;
            }
            buffer.write(commandRet31, true);
            buffer.write('"\n');
            var option32 = {
                escape: 1
            };
            var params33 = [];
            var id34 = scope.resolve(["expanded"]);
            params33.push(!(id34));
            option32.params = params33;
            option32.fn = function (scope, buffer) {

                buffer.write('\nstyle="display:none"\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option32, buffer, 17, payload);
            buffer.write('\n>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});