/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, payload, undefined) {
            var buffer = "",
                engine = this,
                moduleWrap, escapeHtml = S.escapeHtml,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var callCommandUtil = utils.callCommand,
                debuggerCommand = nativeCommands["debugger"],
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro;
            buffer += '<div class="';
            var id0 = scope.resolve(["prefixCls"]);
            buffer += escapeHtml(id0);
            buffer += 'editor-tools"\n     id="ks-editor-tools-';
            var id1 = scope.resolve(["id"]);
            buffer += escapeHtml(id1);
            buffer += '">\n\n</div>\n\n<!--\nhttp://johanbrook.com/browsers/native-momentum-scrolling-ios-5/\nios 不能放在 iframe 上！\n-->\n\n<div class="';
            var id2 = scope.resolve(["prefixCls"]);
            buffer += escapeHtml(id2);
            buffer += 'editor-textarea-wrap"\n\n';
            var option3 = {};
            var params4 = [];
            var id5 = scope.resolve(["mobile"]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope) {
                var buffer = "";
                buffer += '\nstyle="overflow:scroll;-webkit-overflow-scrolling:touch;"\n';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option3, payload);
            buffer += '\n\nid="ks-editor-textarea-wrap-';
            var id6 = scope.resolve(["id"]);
            buffer += escapeHtml(id6);
            buffer += '"\n>\n\n<textarea\n        id="ks-editor-textarea-';
            var id7 = scope.resolve(["id"]);
            buffer += escapeHtml(id7);
            buffer += '"\n        class="';
            var id8 = scope.resolve(["prefixCls"]);
            buffer += escapeHtml(id8);
            buffer += 'editor-textarea"\n\n';
            var option9 = {};
            var params10 = [];
            var id11 = scope.resolve(["textareaAttrs"]);
            params10.push(id11);
            option9.params = params10;
            option9.fn = function (scope) {
                var buffer = "";
                buffer += '\n';
                var id12 = scope.resolve(["xindex"]);
                buffer += escapeHtml(id12);
                buffer += '="';
                var id13 = scope.resolve(["this"]);
                buffer += escapeHtml(id13);
                buffer += '"\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option9, payload);
            buffer += '\n\n';
            var option14 = {};
            var params15 = [];
            var id16 = scope.resolve(["mode"]);
            params15.push(id16);
            option14.params = params15;
            option14.fn = function (scope) {
                var buffer = "";
                buffer += '\nstyle="display:none"\n';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option14, payload);
            buffer += '\n\n>';
            var id17 = scope.resolve(["data"]);
            buffer += escapeHtml(id17);
            buffer += '</textarea>\n\n</div>\n\n<div class="';
            var id18 = scope.resolve(["prefixCls"]);
            buffer += escapeHtml(id18);
            buffer += 'editor-status"\n     id="ks-editor-status-';
            var id19 = scope.resolve(["id"]);
            buffer += escapeHtml(id19);
            buffer += '">\n\n</div>';
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});