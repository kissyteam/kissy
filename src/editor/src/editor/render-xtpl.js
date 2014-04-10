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
            var id0 = scope.resolve(["prefixCls"]);
            buffer.write(id0, true);
            buffer.write('editor-tools">\n\n</div>\n\n<!--\nhttp://johanbrook.com/browsers/native-momentum-scrolling-ios-5/\nios 不能放在 iframe 上！\n-->\n\n<div class="');
            var id1 = scope.resolve(["prefixCls"]);
            buffer.write(id1, true);
            buffer.write('editor-textarea-wrap"\n\n');
            var option2 = {
                escape: 1
            };
            var params3 = [];
            var id4 = scope.resolve(["mobile"]);
            params3.push(id4);
            option2.params = params3;
            option2.fn = function (scope, buffer) {

                buffer.write('\nstyle="overflow:scroll;-webkit-overflow-scrolling:touch;"\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option2, buffer, 12, payload);
            buffer.write('\n>\n\n<textarea class="');
            var id5 = scope.resolve(["prefixCls"]);
            buffer.write(id5, true);
            buffer.write('editor-textarea"\n\n');
            var option6 = {
                escape: 1
            };
            var params7 = [];
            var id8 = scope.resolve(["textareaAttrs"]);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope, buffer) {

                buffer.write('\n');
                var id9 = scope.resolve(["xindex"]);
                buffer.write(id9, true);
                buffer.write('="');
                var id10 = scope.resolve(["this"]);
                buffer.write(id10, true);
                buffer.write('"\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option6, buffer, 19, payload);
            buffer.write('\n\n');
            var option11 = {
                escape: 1
            };
            var params12 = [];
            var id13 = scope.resolve(["mode"]);
            params12.push(id13);
            option11.params = params12;
            option11.fn = function (scope, buffer) {

                buffer.write('\nstyle="display:none"\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option11, buffer, 23, payload);
            buffer.write('\n\n>');
            var id14 = scope.resolve(["data"]);
            buffer.write(id14, true);
            buffer.write('</textarea>\n\n</div>\n\n<div class="');
            var id15 = scope.resolve(["prefixCls"]);
            buffer.write(id15, true);
            buffer.write('editor-status">\n\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});