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
            buffer += '';
            var config1 = {};
            var params2 = [];
            params2.push('component/extension/content-xtpl');
            config1.params = params2;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config1.params[0] = moduleWrap.resolveByName(config1.params[0]);
            }
            var id0 = getPropertyOrRunCommandUtil(engine, scope, config1, "include", 0, 1, false, undefined);
            buffer += id0;
            buffer += '\n<div class="';
            var config4 = {};
            var params5 = [];
            params5.push('dropdown');
            config4.params = params5;
            var id3 = getPropertyOrRunCommandUtil(engine, scope, config4, "getBaseCssClasses", 0, 2, true, undefined);
            buffer += id3;
            buffer += '">\n    <div class="';
            var config7 = {};
            var params8 = [];
            params8.push('dropdown-inner');
            config7.params = params8;
            var id6 = getPropertyOrRunCommandUtil(engine, scope, config7, "getBaseCssClasses", 0, 3, true, undefined);
            buffer += id6;
            buffer += '">\n    </div>\n</div>';
            return buffer;
        };
});