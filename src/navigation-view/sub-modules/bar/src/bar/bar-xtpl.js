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
            var id2 = scope.resolve(["withTitle"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\r\n<div class="');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                params4.push('title-wrap');
                option3.params = params4;
                var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
                if (commandRet5 && commandRet5.isBuffer) {
                    buffer = commandRet5;
                    commandRet5 = undefined;
                }
                buffer.write(commandRet5, true);
                buffer.write('">\r\n    <div class="');
                var option6 = {
                    escape: 1
                };
                var params7 = [];
                params7.push('title');
                option6.params = params7;
                var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
                if (commandRet8 && commandRet8.isBuffer) {
                    buffer = commandRet8;
                    commandRet8 = undefined;
                }
                buffer.write(commandRet8, true);
                buffer.write('">');
                var id9 = scope.resolve(["title"]);
                buffer.write(id9, true);
                buffer.write('</div>\r\n</div>\r\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 1, payload);
            buffer.write('\r\n<div class="');
            var option10 = {
                escape: 1
            };
            var params11 = [];
            params11.push('content');
            option10.params = params11;
            var commandRet12 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 6);
            if (commandRet12 && commandRet12.isBuffer) {
                buffer = commandRet12;
                commandRet12 = undefined;
            }
            buffer.write(commandRet12, true);
            buffer.write('">\r\n    <div class="');
            var option13 = {
                escape: 1
            };
            var params14 = [];
            params14.push('center');
            option13.params = params14;
            var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 7);
            if (commandRet15 && commandRet15.isBuffer) {
                buffer = commandRet15;
                commandRet15 = undefined;
            }
            buffer.write(commandRet15, true);
            buffer.write('"></div>\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});