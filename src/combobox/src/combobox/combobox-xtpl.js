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
            buffer += '<div id="ks-combobox-invalid-el-';
            var id0 = scope.resolve(["id"]);
            buffer += escapeHtml(id0);
            buffer += '"\n     class="';
            var option2 = {};
            var params3 = [];
            params3.push('invalid-el');
            option2.params = params3;
            var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
            buffer += escapeHtml(id1);
            buffer += '">\n    <div class="';
            var option5 = {};
            var params6 = [];
            params6.push('invalid-inner');
            option5.params = params6;
            var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
            buffer += escapeHtml(id4);
            buffer += '"></div>\n</div>\n\n';
            var option7 = {};
            var params8 = [];
            var id9 = scope.resolve(["hasTrigger"]);
            params8.push(id9);
            option7.params = params8;
            option7.fn = function (scope) {
                var buffer = "";
                buffer += '\n<div id="ks-combobox-trigger-';
                var id10 = scope.resolve(["id"]);
                buffer += escapeHtml(id10);
                buffer += '"\n     class="';
                var option12 = {};
                var params13 = [];
                params13.push('trigger');
                option12.params = params13;
                var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 8);
                buffer += escapeHtml(id11);
                buffer += '">\n    <div class="';
                var option15 = {};
                var params16 = [];
                params16.push('trigger-inner');
                option15.params = params16;
                var id14 = callCommandUtil(engine, scope, option15, "getBaseCssClasses", 9);
                buffer += escapeHtml(id14);
                buffer += '">&#x25BC;</div>\n</div>\n';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option7, payload);
            buffer += '\n\n<div class="';
            var option18 = {};
            var params19 = [];
            params19.push('input-wrap');
            option18.params = params19;
            var id17 = callCommandUtil(engine, scope, option18, "getBaseCssClasses", 13);
            buffer += escapeHtml(id17);
            buffer += '">\n\n    <input id="ks-combobox-input-';
            var id20 = scope.resolve(["id"]);
            buffer += escapeHtml(id20);
            buffer += '"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ';
            var option21 = {};
            var params22 = [];
            var id23 = scope.resolve(["disabled"]);
            params22.push(id23);
            option21.params = params22;
            option21.fn = function (scope) {
                var buffer = "";
                buffer += '\n    disabled\n    ';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option21, payload);
            buffer += '\n\n    autocomplete="off"\n    class="';
            var option25 = {};
            var params26 = [];
            params26.push('input');
            option25.params = params26;
            var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 27);
            buffer += escapeHtml(id24);
            buffer += '"\n\n    value="';
            var id27 = scope.resolve(["value"]);
            buffer += escapeHtml(id27);
            buffer += '"\n    />\n\n\n    <label id="ks-combobox-placeholder-';
            var id28 = scope.resolve(["id"]);
            buffer += escapeHtml(id28);
            buffer += '"\n           for="ks-combobox-input-';
            var id29 = scope.resolve(["id"]);
            buffer += escapeHtml(id29);
            buffer += '"\n            style=\'display:';
            var option30 = {};
            var params31 = [];
            var id32 = scope.resolve(["value"]);
            params31.push(id32);
            option30.params = params31;
            option30.fn = function (scope) {
                var buffer = "";
                buffer += 'none';
                return buffer;
            };
            option30.inverse = function (scope) {
                var buffer = "";
                buffer += 'block';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option30, payload);
            buffer += ';\'\n    class="';
            var option34 = {};
            var params35 = [];
            params35.push('placeholder');
            option34.params = params35;
            var id33 = callCommandUtil(engine, scope, option34, "getBaseCssClasses", 36);
            buffer += escapeHtml(id33);
            buffer += '">\n    ';
            var id36 = scope.resolve(["placeholder"]);
            buffer += escapeHtml(id36);
            buffer += '\n    </label>\n</div>\n';
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});