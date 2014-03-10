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
            buffer += '<div id="ks-filter-menu-input-wrap-';
            var id0 = scope.resolve(["id"]);
            buffer += escapeHtml(id0);
            buffer += '"\n     class="';
            var option2 = {};
            var params3 = [];
            params3.push('input-wrap');
            option2.params = params3;
            var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
            buffer += escapeHtml(id1);
            buffer += '">\n    <div id="ks-filter-menu-placeholder-';
            var id4 = scope.resolve(["id"]);
            buffer += escapeHtml(id4);
            buffer += '"\n         class="';
            var option6 = {};
            var params7 = [];
            params7.push('placeholder');
            option6.params = params7;
            var id5 = callCommandUtil(engine, scope, option6, "getBaseCssClasses", 4);
            buffer += escapeHtml(id5);
            buffer += '">\n        ';
            var id8 = scope.resolve(["placeholder"]);
            buffer += escapeHtml(id8);
            buffer += '\n    </div>\n    <input id="ks-filter-menu-input-';
            var id9 = scope.resolve(["id"]);
            buffer += escapeHtml(id9);
            buffer += '"\n           class="';
            var option11 = {};
            var params12 = [];
            params12.push('input');
            option11.params = params12;
            var id10 = callCommandUtil(engine, scope, option11, "getBaseCssClasses", 8);
            buffer += escapeHtml(id10);
            buffer += '"\n            autocomplete="off"/>\n</div>\n';
            var option14 = {};
            var params15 = [];
            params15.push('component/extension/content-xtpl');
            option14.params = params15;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                option14.params[0] = moduleWrap.resolveByName(option14.params[0]);
            }
            var id13 = includeCommand.call(engine, scope, option14, payload);
            if (id13 || id13 === 0) {
                buffer += id13;
            }
            return buffer;
        };
t.TPL_NAME = "filter-menu/src/filter-menu/render.xtpl.html";
return t;
});