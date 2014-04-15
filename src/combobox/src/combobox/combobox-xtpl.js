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
            params1.push('invalid-el');
            option0.params = params1;
            var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('">\r\n    <div class="');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('invalid-inner');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"></div>\r\n</div>\r\n\r\n');
            var option6 = {
                escape: 1
            };
            var params7 = [];
            var id8 = scope.resolve(["hasTrigger"]);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope, buffer) {

                buffer.write('\r\n<div class="');
                var option9 = {
                    escape: 1
                };
                var params10 = [];
                params10.push('trigger');
                option9.params = params10;
                var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 6);
                if (commandRet11 && commandRet11.isBuffer) {
                    buffer = commandRet11;
                    commandRet11 = undefined;
                }
                buffer.write(commandRet11, true);
                buffer.write('">\r\n    <div class="');
                var option12 = {
                    escape: 1
                };
                var params13 = [];
                params13.push('trigger-inner');
                option12.params = params13;
                var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 7);
                if (commandRet14 && commandRet14.isBuffer) {
                    buffer = commandRet14;
                    commandRet14 = undefined;
                }
                buffer.write(commandRet14, true);
                buffer.write('">&#x25BC;</div>\r\n</div>\r\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option6, buffer, 5, payload);
            buffer.write('\r\n\r\n<div class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('input-wrap');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 11);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('">\r\n\r\n    <input id="ks-combobox-input-');
            var id18 = scope.resolve(["id"]);
            buffer.write(id18, true);
            buffer.write('"\r\n           aria-haspopup="true"\r\n           aria-autocomplete="list"\r\n           aria-haspopup="true"\r\n           role="autocomplete"\r\n           aria-expanded="false"\r\n\r\n    ');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            var id21 = scope.resolve(["disabled"]);
            params20.push(id21);
            option19.params = params20;
            option19.fn = function (scope, buffer) {

                buffer.write('\r\n    disabled\r\n    ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option19, buffer, 20, payload);
            buffer.write('\r\n\r\n    autocomplete="off"\r\n    class="');
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('input');
            option22.params = params23;
            var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 25);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, true);
            buffer.write('"\r\n\r\n    value="');
            var id25 = scope.resolve(["value"]);
            buffer.write(id25, true);
            buffer.write('"\r\n    />\r\n\r\n\r\n    <label for="ks-combobox-input-');
            var id26 = scope.resolve(["id"]);
            buffer.write(id26, true);
            buffer.write('"\r\n            style=\'display:');
            var option27 = {
                escape: 1
            };
            var params28 = [];
            var id29 = scope.resolve(["value"]);
            params28.push(id29);
            option27.params = params28;
            option27.fn = function (scope, buffer) {

                buffer.write('none');

                return buffer;
            };
            option27.inverse = function (scope, buffer) {

                buffer.write('block');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option27, buffer, 32, payload);
            buffer.write(';\'\r\n    class="');
            var option30 = {
                escape: 1
            };
            var params31 = [];
            params31.push('placeholder');
            option30.params = params31;
            var commandRet32 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 33);
            if (commandRet32 && commandRet32.isBuffer) {
                buffer = commandRet32;
                commandRet32 = undefined;
            }
            buffer.write(commandRet32, true);
            buffer.write('">\r\n    ');
            var id33 = scope.resolve(["placeholder"]);
            buffer.write(id33, true);
            buffer.write('\r\n    </label>\r\n</div>\r\n');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});