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
            buffer.write('editor-tools"\n     id="ks-editor-tools-');
            var id1 = scope.resolve(["id"]);
            buffer.write(id1, true);
            buffer.write('">\n\n</div>\n\n<!--\nhttp://johanbrook.com/browsers/native-momentum-scrolling-ios-5/\nios 不能放在 iframe 上！\n-->\n\n<div class="');
            var id2 = scope.resolve(["prefixCls"]);
            buffer.write(id2, true);
            buffer.write('editor-textarea-wrap"\n\n');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["mobile"]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {

                buffer.write('\nstyle="overflow:scroll;-webkit-overflow-scrolling:touch;"\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option3, buffer, 13, payload);
            buffer.write('\n\nid="ks-editor-textarea-wrap-');
            var id6 = scope.resolve(["id"]);
            buffer.write(id6, true);
            buffer.write('"\n>\n\n<textarea\n        id="ks-editor-textarea-');
            var id7 = scope.resolve(["id"]);
            buffer.write(id7, true);
            buffer.write('"\n        class="');
            var id8 = scope.resolve(["prefixCls"]);
            buffer.write(id8, true);
            buffer.write('editor-textarea"\n\n');
            var option9 = {
                escape: 1
            };
            var params10 = [];
            var id11 = scope.resolve(["textareaAttrs"]);
            params10.push(id11);
            option9.params = params10;
            option9.fn = function (scope, buffer) {

                buffer.write('\n');
                var id12 = scope.resolve(["xindex"]);
                buffer.write(id12, true);
                buffer.write('="');
                var id13 = scope.resolve(["this"]);
                buffer.write(id13, true);
                buffer.write('"\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option9, buffer, 24, payload);
            buffer.write('\n\n');
            var option14 = {
                escape: 1
            };
            var params15 = [];
            var id16 = scope.resolve(["mode"]);
            params15.push(id16);
            option14.params = params15;
            option14.fn = function (scope, buffer) {

                buffer.write('\nstyle="display:none"\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option14, buffer, 28, payload);
            buffer.write('\n\n>');
            var id17 = scope.resolve(["data"]);
            buffer.write(id17, true);
            buffer.write('</textarea>\n\n</div>\n\n<div class="');
            var id18 = scope.resolve(["prefixCls"]);
            buffer.write(id18, true);
            buffer.write('editor-status"\n     id="ks-editor-status-');
            var id19 = scope.resolve(["id"]);
            buffer.write(id19, true);
            buffer.write('">\n\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});