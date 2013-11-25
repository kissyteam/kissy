/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        return function (scopes, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module != "undefined") {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils["runBlockCommand"],
                getExpressionUtil = utils["getExpression"],
                getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
            buffer += '';
            var id0 = getPropertyOrRunCommandUtil(engine, scopes, {}, "a", 0, 1, undefined, false);
            buffer += getExpressionUtil(id0, true);
            buffer += '';
            var config2 = {};
            var params3 = [];
            params3.push('./b-xtpl');
            config2.params = params3;
            if (moduleWrap) {
                require("./b-xtpl");
                config2.params[0] = moduleWrap.resolveByName(config2.params[0])
            }
            var id1 = getPropertyOrRunCommandUtil(engine, scopes, config2, "include", 0, 1, true, undefined);
            buffer += id1;
            return buffer;
        }
});