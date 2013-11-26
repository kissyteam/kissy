/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        return function (scopes, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module != "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils["runBlockCommand"],
                getExpressionUtil = utils["getExpression"],
                getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
            buffer += '';
            var config1 = {};
            var params2 = [];
            params2.push('overlay/close-xtpl');
            config1.params = params2;
            if (moduleWrap) {
                require("overlay/close-xtpl");
                config1.params[0] = moduleWrap.resolveByName(config1.params[0])
            }
            var id0 = getPropertyOrRunCommandUtil(engine, scopes, config1, "include", 0, 1, false, undefined);
            buffer += id0;
            buffer += '\n';
            var config4 = {};
            var params5 = [];
            params5.push('component/extension/content-xtpl');
            config4.params = params5;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config4.params[0] = moduleWrap.resolveByName(config4.params[0])
            }
            var id3 = getPropertyOrRunCommandUtil(engine, scopes, config4, "include", 0, 2, false, undefined);
            buffer += id3;
            return buffer;
        }
});