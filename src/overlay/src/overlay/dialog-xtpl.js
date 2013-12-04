/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        return function (scope, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                renderOutputUtil = utils.renderOutput,
                getPropertyUtil = utils.getProperty,
                runInlineCommandUtil = utils.runInlineCommand,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '';
            var config1 = {};
            var params2 = [];
            params2.push('overlay/close-xtpl');
            config1.params = params2;
            if (moduleWrap) {
                require("overlay/close-xtpl");
                config1.params[0] = moduleWrap.resolveByName(config1.params[0]);
            }
            var id0 = runInlineCommandUtil(engine, scope, config1, "include", 1);
            buffer += renderOutputUtil(id0, false);
            buffer += '\n<div id="ks-content-';
            var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
            buffer += renderOutputUtil(id3, true);
            buffer += '"\n     class="';
            var config5 = {};
            var params6 = [];
            params6.push('content');
            config5.params = params6;
            var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
            buffer += renderOutputUtil(id4, true);
            buffer += '">\n    <div class="';
            var config8 = {};
            var params9 = [];
            params9.push('header');
            config8.params = params9;
            var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 4);
            buffer += renderOutputUtil(id7, true);
            buffer += '"\n         style="\n';
            var config10 = {};
            var params11 = [];
            var id12 = getPropertyUtil(engine, scope, "headerStyle", 0, 6);
            params11.push(id12);
            config10.params = params11;
            config10.fn = function (scope) {
                var buffer = "";
                buffer += ' \n ';
                var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 7);
                buffer += renderOutputUtil(id13, true);
                buffer += ':';
                var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 7);
                buffer += renderOutputUtil(id14, true);
                buffer += ';\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config10, "each", 6);
            buffer += '\n"\n         id="ks-stdmod-header-';
            var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10);
            buffer += renderOutputUtil(id15, true);
            buffer += '">';
            var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "headerContent", 0, 10);
            buffer += renderOutputUtil(id16, false);
            buffer += '</div>\n\n    <div class="';
            var config18 = {};
            var params19 = [];
            params19.push('body');
            config18.params = params19;
            var id17 = runInlineCommandUtil(engine, scope, config18, "getBaseCssClasses", 12);
            buffer += renderOutputUtil(id17, true);
            buffer += '"\n         style="\n';
            var config20 = {};
            var params21 = [];
            var id22 = getPropertyUtil(engine, scope, "bodyStyle", 0, 14);
            params21.push(id22);
            config20.params = params21;
            config20.fn = function (scope) {
                var buffer = "";
                buffer += ' \n ';
                var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 15);
                buffer += renderOutputUtil(id23, true);
                buffer += ':';
                var id24 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 15);
                buffer += renderOutputUtil(id24, true);
                buffer += ';\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config20, "each", 14);
            buffer += '\n"\n         id="ks-stdmod-body-';
            var id25 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 18);
            buffer += renderOutputUtil(id25, true);
            buffer += '">';
            var id26 = getPropertyOrRunCommandUtil(engine, scope, {}, "bodyContent", 0, 18);
            buffer += renderOutputUtil(id26, false);
            buffer += '</div>\n\n    <div class="';
            var config28 = {};
            var params29 = [];
            params29.push('footer');
            config28.params = params29;
            var id27 = runInlineCommandUtil(engine, scope, config28, "getBaseCssClasses", 20);
            buffer += renderOutputUtil(id27, true);
            buffer += '"\n         style="\n';
            var config30 = {};
            var params31 = [];
            var id32 = getPropertyUtil(engine, scope, "footerStyle", 0, 22);
            params31.push(id32);
            config30.params = params31;
            config30.fn = function (scope) {
                var buffer = "";
                buffer += ' \n ';
                var id33 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 23);
                buffer += renderOutputUtil(id33, true);
                buffer += ':';
                var id34 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 23);
                buffer += renderOutputUtil(id34, true);
                buffer += ';\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config30, "each", 22);
            buffer += '\n"\n         id="ks-stdmod-footer-';
            var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 26);
            buffer += renderOutputUtil(id35, true);
            buffer += '">';
            var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "footerContent", 0, 26);
            buffer += renderOutputUtil(id36, false);
            buffer += '</div>\n</div>\n<div tabindex="0"></div>';
            return buffer;
        };
});