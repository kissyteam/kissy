/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark: false, unused:false, indent:false*/
        return function (scope, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                getExpressionUtil = utils.getExpression,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '<div id="';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1, undefined, false);
            buffer += getExpressionUtil(id0, true);
            buffer += '"\n class="';
            var config2 = {};
            var params3 = [];
            params3.push('');
            config2.params = params3;
            var id1 = getPropertyOrRunCommandUtil(engine, scope, config2, "getBaseCssClasses", 0, 2, true, undefined);
            buffer += id1;
            buffer += '\n';
            var config4 = {};
            var params5 = [];
            var id6 = getPropertyOrRunCommandUtil(engine, scope, {}, "elCls", 0, 3, undefined, true);
            params5.push(id6);
            config4.params = params5;
            config4.fn = function (scope) {
                var buffer = "";
                buffer += '\n ';
                var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 4, undefined, false);
                buffer += getExpressionUtil(id7, true);
                buffer += '  \n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config4, "each", 3);
            buffer += '\n"\n\n';
            var config8 = {};
            var params9 = [];
            var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "elAttrs", 0, 8, undefined, true);
            params9.push(id10);
            config8.params = params9;
            config8.fn = function (scope) {
                var buffer = "";
                buffer += ' \n ';
                var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 9, undefined, false);
                buffer += getExpressionUtil(id11, true);
                buffer += '="';
                var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 9, undefined, false);
                buffer += getExpressionUtil(id12, true);
                buffer += '"\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config8, "each", 8);
            buffer += '\n\nstyle="\n';
            var config13 = {};
            var params14 = [];
            var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "elStyle", 0, 13, undefined, true);
            params14.push(id15);
            config13.params = params14;
            config13.fn = function (scope) {
                var buffer = "";
                buffer += ' \n ';
                var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 14, undefined, false);
                buffer += getExpressionUtil(id16, true);
                buffer += ':';
                var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 14, undefined, false);
                buffer += getExpressionUtil(id17, true);
                buffer += ';\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config13, "each", 13);
            buffer += '\n">';
            return buffer;
        };
});