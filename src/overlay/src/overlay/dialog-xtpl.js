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
            var option1 = {};
            var params2 = [];
            params2.push('./overlay-xtpl');
            option1.params = params2;
            if (moduleWrap) {
                require("./overlay-xtpl");
                option1.params[0] = moduleWrap.resolveByName(option1.params[0]);
            }
            var id0 = extendCommand.call(engine, scope, option1, payload);
            if (id0 || id0 === 0) {
                buffer += id0;
            }
            buffer += '\n';
            var option3 = {};
            var params4 = [];
            params4.push('ks-overlay-content');
            option3.params = params4;
            option3.fn = function (scope) {
                var buffer = "";
                buffer += '\n    <div class="';
                var option6 = {};
                var params7 = [];
                params7.push('header');
                option6.params = params7;
                var id5 = callCommandUtil(engine, scope, option6, "getBaseCssClasses", 3);
                buffer += escapeHtml(id5);
                buffer += '"\n         style="\n';
                var option8 = {};
                var params9 = [];
                var id10 = scope.resolve(["headerStyle"]);
                params9.push(id10);
                option8.params = params9;
                option8.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n ';
                    var id11 = scope.resolve(["xindex"]);
                    buffer += escapeHtml(id11);
                    buffer += ':';
                    var id12 = scope.resolve(["this"]);
                    buffer += escapeHtml(id12);
                    buffer += ';\n';
                    return buffer;
                };
                buffer += eachCommand.call(engine, scope, option8, payload);
                buffer += '\n"\n         id="ks-stdmod-header-';
                var id13 = scope.resolve(["id"]);
                buffer += escapeHtml(id13);
                buffer += '">';
                var id14 = scope.resolve(["headerContent"]);
                if (id14 || id14 === 0) {
                    buffer += id14;
                }
                buffer += '</div>\n\n    <div class="';
                var option16 = {};
                var params17 = [];
                params17.push('body');
                option16.params = params17;
                var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 11);
                buffer += escapeHtml(id15);
                buffer += '"\n         style="\n';
                var option18 = {};
                var params19 = [];
                var id20 = scope.resolve(["bodyStyle"]);
                params19.push(id20);
                option18.params = params19;
                option18.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n ';
                    var id21 = scope.resolve(["xindex"]);
                    buffer += escapeHtml(id21);
                    buffer += ':';
                    var id22 = scope.resolve(["this"]);
                    buffer += escapeHtml(id22);
                    buffer += ';\n';
                    return buffer;
                };
                buffer += eachCommand.call(engine, scope, option18, payload);
                buffer += '\n"\n         id="ks-stdmod-body-';
                var id23 = scope.resolve(["id"]);
                buffer += escapeHtml(id23);
                buffer += '">';
                var id24 = scope.resolve(["bodyContent"]);
                if (id24 || id24 === 0) {
                    buffer += id24;
                }
                buffer += '</div>\n\n    <div class="';
                var option26 = {};
                var params27 = [];
                params27.push('footer');
                option26.params = params27;
                var id25 = callCommandUtil(engine, scope, option26, "getBaseCssClasses", 19);
                buffer += escapeHtml(id25);
                buffer += '"\n         style="\n';
                var option28 = {};
                var params29 = [];
                var id30 = scope.resolve(["footerStyle"]);
                params29.push(id30);
                option28.params = params29;
                option28.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n ';
                    var id31 = scope.resolve(["xindex"]);
                    buffer += escapeHtml(id31);
                    buffer += ':';
                    var id32 = scope.resolve(["this"]);
                    buffer += escapeHtml(id32);
                    buffer += ';\n';
                    return buffer;
                };
                buffer += eachCommand.call(engine, scope, option28, payload);
                buffer += '\n"\n         id="ks-stdmod-footer-';
                var id33 = scope.resolve(["id"]);
                buffer += escapeHtml(id33);
                buffer += '">';
                var id34 = scope.resolve(["footerContent"]);
                if (id34 || id34 === 0) {
                    buffer += id34;
                }
                buffer += '</div>\n    <div tabindex="0"></div>\n';
                return buffer;
            };
            buffer += blockCommand.call(engine, scope, option3, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});