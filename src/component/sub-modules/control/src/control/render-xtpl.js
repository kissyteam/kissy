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
            buffer += '<div id="';
            var id0 = scope.resolve(["id"]);
            buffer += escapeHtml(id0);
            buffer += '"\n class="';
            var id1 = callCommandUtil(engine, scope, undefined, "getBaseCssClasses", 2);
            buffer += escapeHtml(id1);
            buffer += '\n';
            var option2 = {};
            var params3 = [];
            var id4 = scope.resolve(["elCls"]);
            params3.push(id4);
            option2.params = params3;
            option2.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id5 = scope.resolve(["this"]);
                buffer += escapeHtml(id5);
                buffer += '\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option2, payload);
            buffer += '\n"\n\n';
            var option6 = {};
            var params7 = [];
            var id8 = scope.resolve(["elAttrs"]);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id9 = scope.resolve(["xindex"]);
                buffer += escapeHtml(id9);
                buffer += '="';
                var id10 = scope.resolve(["this"]);
                buffer += escapeHtml(id10);
                buffer += '"\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option6, payload);
            buffer += '\n\nstyle="\n';
            var option11 = {};
            var params12 = [];
            var id13 = scope.resolve(["elStyle"]);
            params12.push(id13);
            option11.params = params12;
            option11.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id14 = scope.resolve(["xindex"]);
                buffer += escapeHtml(id14);
                buffer += ':';
                var id15 = scope.resolve(["this"]);
                buffer += escapeHtml(id15);
                buffer += ';\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option11, payload);
            buffer += '\n">';
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});