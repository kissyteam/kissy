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
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro;
            buffer += '<div id="ks-tree-node-row-';
            var id0 = scope.resolve(["id"]);
            buffer += escapeHtml(id0);
            buffer += '"\n     class="';
            var option2 = {};
            var params3 = [];
            params3.push('row');
            option2.params = params3;
            var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
            buffer += escapeHtml(id1);
            buffer += '\n     ';
            var option4 = {};
            var params5 = [];
            var id6 = scope.resolve(["selected"]);
            params5.push(id6);
            option4.params = params5;
            option4.fn = function (scope) {
                var buffer = "";
                buffer += '\n        ';
                var option8 = {};
                var params9 = [];
                params9.push('selected');
                option8.params = params9;
                var id7 = callCommandUtil(engine, scope, option8, "getBaseCssClasses", 4);
                buffer += escapeHtml(id7);
                buffer += '\n     ';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option4, payload);
            buffer += '\n     ">\n    <div id="ks-tree-node-expand-icon-';
            var id10 = scope.resolve(["id"]);
            buffer += escapeHtml(id10);
            buffer += '"\n         class="';
            var option12 = {};
            var params13 = [];
            params13.push('expand-icon');
            option12.params = params13;
            var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 8);
            buffer += escapeHtml(id11);
            buffer += '">\n    </div>\n    ';
            var option14 = {};
            var params15 = [];
            var id16 = scope.resolve(["checkable"]);
            params15.push(id16);
            option14.params = params15;
            option14.fn = function (scope) {
                var buffer = "";
                buffer += '\n    <div id="ks-tree-node-checked-';
                var id17 = scope.resolve(["id"]);
                buffer += escapeHtml(id17);
                buffer += '"\n         class="';
                var option19 = {};
                var params20 = [];
                var id21 = scope.resolve(["checkState"]);
                params20.push(('checked') + id21);
                option19.params = params20;
                var id18 = callCommandUtil(engine, scope, option19, "getBaseCssClasses", 12);
                buffer += escapeHtml(id18);
                buffer += '"></div>\n    ';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option14, payload);
            buffer += '\n    <div id="ks-tree-node-icon-';
            var id22 = scope.resolve(["id"]);
            buffer += escapeHtml(id22);
            buffer += '"\n         class="';
            var option24 = {};
            var params25 = [];
            params25.push('icon');
            option24.params = params25;
            var id23 = callCommandUtil(engine, scope, option24, "getBaseCssClasses", 15);
            buffer += escapeHtml(id23);
            buffer += '">\n\n    </div>\n    ';
            var option27 = {};
            var params28 = [];
            params28.push('component/extension/content-xtpl');
            option27.params = params28;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                option27.params[0] = moduleWrap.resolveByName(option27.params[0]);
            }
            var id26 = includeCommand.call(engine, scope, option27, payload);
            if (id26 || id26 === 0) {
                buffer += id26;
            }
            buffer += '\n</div>\n<div id="ks-tree-node-children-';
            var id29 = scope.resolve(["id"]);
            buffer += escapeHtml(id29);
            buffer += '"\n     class="';
            var option31 = {};
            var params32 = [];
            params32.push('children');
            option31.params = params32;
            var id30 = callCommandUtil(engine, scope, option31, "getBaseCssClasses", 21);
            buffer += escapeHtml(id30);
            buffer += '"\n';
            var option33 = {};
            var params34 = [];
            var id35 = scope.resolve(["expanded"]);
            id35 = !id35;
            params34.push(id35);
            option33.params = params34;
            option33.fn = function (scope) {
                var buffer = "";
                buffer += '\nstyle="display:none"\n';
                return buffer;
            };
            buffer += ifCommand.call(engine, scope, option33, payload);
            buffer += '\n>\n</div>';
            return buffer;
        };
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/tree/src/tree/node.xtpl.html";
return t;
});