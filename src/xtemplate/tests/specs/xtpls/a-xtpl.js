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
                renderOutputUtil = utils.renderOutput,
                getPropertyUtil = utils.getProperty,
                runInlineCommandUtil = utils.runInlineCommand,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "a", 0, 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '';
            var config2 = {};
            var params3 = [];
            params3.push('./b-xtpl');
            config2.params = params3;
            if (moduleWrap) {
                require("./b-xtpl");
                config2.params[0] = moduleWrap.resolveByName(config2.params[0]);
            }
            var id1 = runInlineCommandUtil(engine, scope, config2, "include", 1);
            buffer += renderOutputUtil(id1, true);
            return buffer;
        };
});