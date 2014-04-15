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
            buffer.write('<div id="');
            var id0 = scope.resolve(["id"]);
            buffer.write(id0, true);
            buffer.write('"\r\n class="');
            var option1 = {
                escape: 1
            };
            var commandRet2 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('\r\n');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["elCls"]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {

                buffer.write('\r\n ');
                var id6 = scope.resolve(["this"]);
                buffer.write(id6, true);
                buffer.write('\r\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
            buffer.write('\r\n"\r\n\r\n');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            var id9 = scope.resolve(["elAttrs"]);
            params8.push(id9);
            option7.params = params8;
            option7.fn = function (scope, buffer) {

                buffer.write('\r\n ');
                var id10 = scope.resolve(["xindex"]);
                buffer.write(id10, true);
                buffer.write('="');
                var id11 = scope.resolve(["this"]);
                buffer.write(id11, true);
                buffer.write('"\r\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option7, buffer, 8, payload);
            buffer.write('\r\n\r\nstyle="\r\n');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            var id14 = scope.resolve(["elStyle"]);
            params13.push(id14);
            option12.params = params13;
            option12.fn = function (scope, buffer) {

                buffer.write('\r\n ');
                var id15 = scope.resolve(["xindex"]);
                buffer.write(id15, true);
                buffer.write(':');
                var id16 = scope.resolve(["this"]);
                buffer.write(id16, true);
                buffer.write(';\r\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option12, buffer, 13, payload);
            buffer.write('\r\n">');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});