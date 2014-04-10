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
                buffer.write('" id="ks-navigation-bar-title-');
                var id9 = scope.resolve(["id"]);
                buffer.write(id9, true);
                buffer.write('">');
                var id10 = scope.resolve(["title"]);
                buffer.write(id10, true);
                buffer.write('</div>\r\n</div>\r\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 1, payload);
            buffer.write('\r\n<div class="');
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('content');
            option11.params = params12;
            var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 6);
            if (commandRet13 && commandRet13.isBuffer) {
                buffer = commandRet13;
                commandRet13 = undefined;
            }
            buffer.write(commandRet13, true);
            buffer.write('" id="ks-navigation-bar-content-');
            var id14 = scope.resolve(["id"]);
            buffer.write(id14, true);
            buffer.write('">\r\n    <div class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('center');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 7);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('" id="ks-navigation-bar-center-');
            var id18 = scope.resolve(["id"]);
            buffer.write(id18, true);
            buffer.write('"></div>\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});