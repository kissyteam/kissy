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
            buffer += '';
            var option0 = {};
            var params1 = [];
            params1.push('ks-overlay-closable');
            option0.params = params1;
            option0.fn = function (scope) {
                var buffer = "";
                buffer += '\n    ';
                var option2 = {};
                var params3 = [];
                var id4 = scope.resolve(["closable"]);
                params3.push(id4);
                option2.params = params3;
                option2.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n        <a href="javascript:void(\'close\')"\n           id="ks-overlay-close-';
                    var id5 = scope.resolve(["id"]);
                    buffer += escapeHtml(id5);
                    buffer += '"\n           class="';
                    var option7 = {};
                    var params8 = [];
                    params8.push('close');
                    option7.params = params8;
                    var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 5);
                    buffer += escapeHtml(id6);
                    buffer += '"\n           role=\'button\'>\n            <span class="';
                    var option10 = {};
                    var params11 = [];
                    params11.push('close-x');
                    option10.params = params11;
                    var id9 = callCommandUtil(engine, scope, option10, "getBaseCssClasses", 7);
                    buffer += escapeHtml(id9);
                    buffer += '">close</span>\n        </a>\n    ';
                    return buffer;
                };
                buffer += ifCommand.call(engine, scope, option2, payload);
                buffer += '\n';
                return buffer;
            };
            buffer += blockCommand.call(engine, scope, option0, payload);
            buffer += '\n\n<div id="ks-content-';
            var id12 = scope.resolve(["id"]);
            buffer += escapeHtml(id12);
            buffer += '"\n     class="';
            var option14 = {};
            var params15 = [];
            params15.push('content');
            option14.params = params15;
            var id13 = callCommandUtil(engine, scope, option14, "getBaseCssClasses", 13);
            buffer += escapeHtml(id13);
            buffer += '">\n    ';
            var option16 = {};
            var params17 = [];
            params17.push('ks-overlay-content');
            option16.params = params17;
            option16.fn = function (scope) {
                var buffer = "";
                buffer += '\n        ';
                var id18 = scope.resolve(["content"]);
                if (id18 || id18 === 0) {
                    buffer += id18;
                }
                buffer += '\n    ';
                return buffer;
            };
            buffer += blockCommand.call(engine, scope, option16, payload);
            buffer += '\n</div>';
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});