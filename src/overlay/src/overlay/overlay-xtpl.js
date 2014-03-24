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
            buffer.write('');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('ks-overlay-closable');
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\n    ');
                var option2 = {
                    escape: 1
                };
                var params3 = [];
                var id4 = scope.resolve(["closable"]);
                params3.push(id4);
                option2.params = params3;
                option2.fn = function (scope, buffer) {

                    buffer.write('\n        <a href="javascript:void(\'close\')"\n           id="ks-overlay-close-');
                    var id5 = scope.resolve(["id"]);
                    buffer.write(id5, true);
                    buffer.write('"\n           class="');
                    var option6 = {
                        escape: 1
                    };
                    var params7 = [];
                    params7.push('close');
                    option6.params = params7;
                    var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 5);
                    if (commandRet8 && commandRet8.isBuffer) {
                        buffer = commandRet8;
                        commandRet8 = undefined;
                    }
                    buffer.write(commandRet8, true);
                    buffer.write('"\n           role=\'button\'>\n            <span class="');
                    var option9 = {
                        escape: 1
                    };
                    var params10 = [];
                    params10.push('close-x');
                    option9.params = params10;
                    var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 7);
                    if (commandRet11 && commandRet11.isBuffer) {
                        buffer = commandRet11;
                        commandRet11 = undefined;
                    }
                    buffer.write(commandRet11, true);
                    buffer.write('">close</span>\n        </a>\n    ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option2, buffer, 2, payload);
                buffer.write('\n');

                return buffer;
            };
            buffer = blockCommand.call(engine, scope, option0, buffer, 1, payload);
            buffer.write('\n\n<div id="ks-content-');
            var id12 = scope.resolve(["id"]);
            buffer.write(id12, true);
            buffer.write('"\n     class="');
            var option13 = {
                escape: 1
            };
            var params14 = [];
            params14.push('content');
            option13.params = params14;
            var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 13);
            if (commandRet15 && commandRet15.isBuffer) {
                buffer = commandRet15;
                commandRet15 = undefined;
            }
            buffer.write(commandRet15, true);
            buffer.write('">\n    ');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('ks-overlay-content');
            option16.params = params17;
            option16.fn = function (scope, buffer) {

                buffer.write('\n        ');
                var id18 = scope.resolve(["content"]);
                buffer.write(id18, false);
                buffer.write('\n    ');

                return buffer;
            };
            buffer = blockCommand.call(engine, scope, option16, buffer, 14, payload);
            buffer.write('\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});