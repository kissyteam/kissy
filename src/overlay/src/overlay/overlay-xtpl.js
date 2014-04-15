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
            buffer.write('');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('ks-overlay-closable');
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\r\n    ');
                var option2 = {
                    escape: 1
                };
                var params3 = [];
                var id4 = scope.resolve(["closable"]);
                params3.push(id4);
                option2.params = params3;
                option2.fn = function (scope, buffer) {

                    buffer.write('\r\n        <a href="javascript:void(\'close\')"\r\n           class="');
                    var option5 = {
                        escape: 1
                    };
                    var params6 = [];
                    params6.push('close');
                    option5.params = params6;
                    var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
                    if (commandRet7 && commandRet7.isBuffer) {
                        buffer = commandRet7;
                        commandRet7 = undefined;
                    }
                    buffer.write(commandRet7, true);
                    buffer.write('"\r\n           role=\'button\'>\r\n            <span class="');
                    var option8 = {
                        escape: 1
                    };
                    var params9 = [];
                    params9.push('close-x');
                    option8.params = params9;
                    var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 6);
                    if (commandRet10 && commandRet10.isBuffer) {
                        buffer = commandRet10;
                        commandRet10 = undefined;
                    }
                    buffer.write(commandRet10, true);
                    buffer.write('">close</span>\r\n        </a>\r\n    ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option2, buffer, 2, payload);
                buffer.write('\r\n');

                return buffer;
            };
            buffer = blockCommand.call(engine, scope, option0, buffer, 1, payload);
            buffer.write('\r\n\r\n<div class="');
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('content');
            option11.params = params12;
            var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 11);
            if (commandRet13 && commandRet13.isBuffer) {
                buffer = commandRet13;
                commandRet13 = undefined;
            }
            buffer.write(commandRet13, true);
            buffer.write('">\r\n    ');
            var option14 = {
                escape: 1
            };
            var params15 = [];
            params15.push('ks-overlay-content');
            option14.params = params15;
            option14.fn = function (scope, buffer) {

                buffer.write('\r\n        ');
                var id16 = scope.resolve(["content"]);
                buffer.write(id16, false);
                buffer.write('\r\n    ');

                return buffer;
            };
            buffer = blockCommand.call(engine, scope, option14, buffer, 12, payload);
            buffer.write('\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});