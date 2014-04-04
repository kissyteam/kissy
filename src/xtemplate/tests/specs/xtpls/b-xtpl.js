/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
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
            var id2 = scope.resolve(["b"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('');
                var id3 = scope.resolve(["c"]);
                buffer.write(id3, true);
                buffer.write('');
                var id4 = scope.resolve(["d"], 1);
                buffer.write(id4, true);
                buffer.write('');

                return buffer;
            };
            buffer = withCommand.call(engine, scope, option0, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});