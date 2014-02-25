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
            buffer += '<div id="ks-scrollbar-arrow-up-';
            var id0 = scope.resolve(["id"]);
            buffer += escapeHtml(id0);
            buffer += '"\n        class="';
            var option2 = {};
            var params3 = [];
            var id4 = scope.resolve(["axis"]);
            params3.push(id4 + ('-arrow-up'));
            option2.params = params3;
            var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
            buffer += escapeHtml(id1);
            buffer += '">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-';
            var id5 = scope.resolve(["id"]);
            buffer += escapeHtml(id5);
            buffer += '"\n        class="';
            var option7 = {};
            var params8 = [];
            var id9 = scope.resolve(["axis"]);
            params8.push(id9 + ('-arrow-down'));
            option7.params = params8;
            var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 6);
            buffer += escapeHtml(id6);
            buffer += '">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-';
            var id10 = scope.resolve(["id"]);
            buffer += escapeHtml(id10);
            buffer += '"\n     class="';
            var option12 = {};
            var params13 = [];
            var id14 = scope.resolve(["axis"]);
            params13.push(id14 + ('-track'));
            option12.params = params13;
            var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 10);
            buffer += escapeHtml(id11);
            buffer += '">\n<div id="ks-scrollbar-drag-';
            var id15 = scope.resolve(["id"]);
            buffer += escapeHtml(id15);
            buffer += '"\n     class="';
            var option17 = {};
            var params18 = [];
            var id19 = scope.resolve(["axis"]);
            params18.push(id19 + ('-drag'));
            option17.params = params18;
            var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 12);
            buffer += escapeHtml(id16);
            buffer += '">\n<div class="';
            var option21 = {};
            var params22 = [];
            var id23 = scope.resolve(["axis"]);
            params22.push(id23 + ('-drag-top'));
            option21.params = params22;
            var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 13);
            buffer += escapeHtml(id20);
            buffer += '">\n</div>\n<div class="';
            var option25 = {};
            var params26 = [];
            var id27 = scope.resolve(["axis"]);
            params26.push(id27 + ('-drag-center'));
            option25.params = params26;
            var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 15);
            buffer += escapeHtml(id24);
            buffer += '">\n</div>\n<div class="';
            var option29 = {};
            var params30 = [];
            var id31 = scope.resolve(["axis"]);
            params30.push(id31 + ('-drag-bottom'));
            option29.params = params30;
            var id28 = callCommandUtil(engine, scope, option29, "getBaseCssClasses", 17);
            buffer += escapeHtml(id28);
            buffer += '">\n</div>\n</div>\n</div>';
            return buffer;
        };
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/scroll-view/sub-modules/plugin/scrollbar/src/scrollbar/scrollbar.xtpl.html";
return t;
});