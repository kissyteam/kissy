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
            buffer += '';
            var option1 = {};
            var params2 = [];
            params2.push('overlay/close-xtpl');
            option1.params = params2;
            if (moduleWrap) {
                require("overlay/close-xtpl");
                option1.params[0] = moduleWrap.resolveByName(option1.params[0]);
            }
            var id0 = includeCommand.call(engine, scope, option1, payload);
            if (id0 || id0 === 0) {
                buffer += id0;
            }
            buffer += '\n<div id="ks-content-';
            var id3 = scope.resolve(["id"]);
            buffer += escapeHtml(id3);
            buffer += '"\n     class="';
            var option5 = {};
            var params6 = [];
            params6.push('content');
            option5.params = params6;
            var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
            buffer += escapeHtml(id4);
            buffer += '">\n    <div class="';
            var option8 = {};
            var params9 = [];
            params9.push('header');
            option8.params = params9;
            var id7 = callCommandUtil(engine, scope, option8, "getBaseCssClasses", 4);
            buffer += escapeHtml(id7);
            buffer += '"\n         style="\n';
            var option10 = {};
            var params11 = [];
            var id12 = scope.resolve(["headerStyle"]);
            params11.push(id12);
            option10.params = params11;
            option10.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id13 = scope.resolve(["xindex"]);
                buffer += escapeHtml(id13);
                buffer += ':';
                var id14 = scope.resolve(["this"]);
                buffer += escapeHtml(id14);
                buffer += ';\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option10, payload);
            buffer += '\n"\n         id="ks-stdmod-header-';
            var id15 = scope.resolve(["id"]);
            buffer += escapeHtml(id15);
            buffer += '">';
            var id16 = scope.resolve(["headerContent"]);
            if (id16 || id16 === 0) {
                buffer += id16;
            }
            buffer += '</div>\n\n    <div class="';
            var option18 = {};
            var params19 = [];
            params19.push('body');
            option18.params = params19;
            var id17 = callCommandUtil(engine, scope, option18, "getBaseCssClasses", 12);
            buffer += escapeHtml(id17);
            buffer += '"\n         style="\n';
            var option20 = {};
            var params21 = [];
            var id22 = scope.resolve(["bodyStyle"]);
            params21.push(id22);
            option20.params = params21;
            option20.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id23 = scope.resolve(["xindex"]);
                buffer += escapeHtml(id23);
                buffer += ':';
                var id24 = scope.resolve(["this"]);
                buffer += escapeHtml(id24);
                buffer += ';\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option20, payload);
            buffer += '\n"\n         id="ks-stdmod-body-';
            var id25 = scope.resolve(["id"]);
            buffer += escapeHtml(id25);
            buffer += '">';
            var id26 = scope.resolve(["bodyContent"]);
            if (id26 || id26 === 0) {
                buffer += id26;
            }
            buffer += '</div>\n\n    <div class="';
            var option28 = {};
            var params29 = [];
            params29.push('footer');
            option28.params = params29;
            var id27 = callCommandUtil(engine, scope, option28, "getBaseCssClasses", 20);
            buffer += escapeHtml(id27);
            buffer += '"\n         style="\n';
            var option30 = {};
            var params31 = [];
            var id32 = scope.resolve(["footerStyle"]);
            params31.push(id32);
            option30.params = params31;
            option30.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id33 = scope.resolve(["xindex"]);
                buffer += escapeHtml(id33);
                buffer += ':';
                var id34 = scope.resolve(["this"]);
                buffer += escapeHtml(id34);
                buffer += ';\n';
                return buffer;
            };
            buffer += eachCommand.call(engine, scope, option30, payload);
            buffer += '\n"\n         id="ks-stdmod-footer-';
            var id35 = scope.resolve(["id"]);
            buffer += escapeHtml(id35);
            buffer += '">';
            var id36 = scope.resolve(["footerContent"]);
            if (id36 || id36 === 0) {
                buffer += id36;
            }
            buffer += '</div>\n</div>\n<div tabindex="0"></div>';
            return buffer;
        };
t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/overlay/src/overlay/dialog.xtpl.html";
return t;
});