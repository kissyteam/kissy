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
            buffer += '<div class="';
            var config1 = {};
            var params2 = [];
            params2.push('content');
            config1.params = params2;
            var id0 = getPropertyOrRunCommandUtil(engine, scope, config1, "getBaseCssClasses", 0, 1, true, undefined);
            buffer += id0;
            buffer += '">\n    ';
            var config4 = {};
            var params5 = [];
            params5.push('date/picker/picker-xtpl');
            config4.params = params5;
            if (moduleWrap) {
                require("date/picker/picker-xtpl");
                config4.params[0] = moduleWrap.resolveByName(config4.params[0]);
            }
            var id3 = getPropertyOrRunCommandUtil(engine, scope, config4, "include", 0, 2, false, undefined);
            buffer += id3;
            buffer += '\n</div>';
            return buffer;
        };
});