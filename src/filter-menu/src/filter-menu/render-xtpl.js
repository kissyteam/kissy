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
            buffer += '<div id="ks-filter-menu-input-wrap-';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1, undefined, false);
            buffer += getExpressionUtil(id0, true);
            buffer += '"\n     class="';
            var config2 = {};
            var params3 = [];
            params3.push('input-wrap');
            config2.params = params3;
            var id1 = getPropertyOrRunCommandUtil(engine, scope, config2, "getBaseCssClasses", 0, 2, true, undefined);
            buffer += id1;
            buffer += '">\n    <div id="ks-filter-menu-placeholder-';
            var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3, undefined, false);
            buffer += getExpressionUtil(id4, true);
            buffer += '"\n         class="';
            var config6 = {};
            var params7 = [];
            params7.push('placeholder');
            config6.params = params7;
            var id5 = getPropertyOrRunCommandUtil(engine, scope, config6, "getBaseCssClasses", 0, 4, true, undefined);
            buffer += id5;
            buffer += '">\n        ';
            var id8 = getPropertyOrRunCommandUtil(engine, scope, {}, "placeholder", 0, 5, undefined, false);
            buffer += getExpressionUtil(id8, true);
            buffer += '\n    </div>\n    <input id="ks-filter-menu-input-';
            var id9 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7, undefined, false);
            buffer += getExpressionUtil(id9, true);
            buffer += '"\n           class="';
            var config11 = {};
            var params12 = [];
            params12.push('input');
            config11.params = params12;
            var id10 = getPropertyOrRunCommandUtil(engine, scope, config11, "getBaseCssClasses", 0, 8, true, undefined);
            buffer += id10;
            buffer += '"\n            autocomplete="off"/>\n</div>\n';
            var config14 = {};
            var params15 = [];
            params15.push('component/extension/content-xtpl');
            config14.params = params15;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config14.params[0] = moduleWrap.resolveByName(config14.params[0]);
            }
            var id13 = getPropertyOrRunCommandUtil(engine, scope, config14, "include", 0, 11, false, undefined);
            buffer += id13;
            return buffer;
        };
});