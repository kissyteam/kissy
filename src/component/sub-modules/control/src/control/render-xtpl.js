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
            buffer += '<div id="';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '"\n class="';
            var config2 = {};
            var params3 = [];
            params3.push('');
            config2.params = params3;
            var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
            buffer += renderOutputUtil(id1, true);
            buffer += '\n';
            var config4 = {};
            var params5 = [];
            var id6 = getPropertyUtil(engine, scope, "elCls", 0, 3);
            params5.push(id6);
            config4.params = params5;
            config4.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 4);
                buffer += renderOutputUtil(id7, true);
                buffer += '  \n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config4, "each", 3);
            buffer += '\n"\n\n';
            var config8 = {};
            var params9 = [];
            var id10 = getPropertyUtil(engine, scope, "elAttrs", 0, 8);
            params9.push(id10);
            config8.params = params9;
            config8.fn = function (scope) {
                var buffer = "";
                buffer += ' \n ';
                var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 9);
                buffer += renderOutputUtil(id11, true);
                buffer += '="';
                var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 9);
                buffer += renderOutputUtil(id12, true);
                buffer += '"\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config8, "each", 8);
            buffer += '\n\nstyle="\n';
            var config13 = {};
            var params14 = [];
            var id15 = getPropertyUtil(engine, scope, "elStyle", 0, 13);
            params14.push(id15);
            config13.params = params14;
            config13.fn = function (scope) {
                var buffer = "";
                buffer += ' \n ';
                var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 14);
                buffer += renderOutputUtil(id16, true);
                buffer += ':';
                var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 14);
                buffer += renderOutputUtil(id17, true);
                buffer += ';\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config13, "each", 13);
            buffer += '\n">';
            return buffer;
        };
});