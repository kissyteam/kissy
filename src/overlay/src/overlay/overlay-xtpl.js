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
            buffer += '\n';
            var config4 = {};
            var params5 = [];
            params5.push('component/extension/content-xtpl');
            config4.params = params5;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config4.params[0] = moduleWrap.resolveByName(config4.params[0]);
            }
            var id3 = runInlineCommandUtil(engine, scope, config4, "include", 2);
            buffer += renderOutputUtil(id3, false);
            return buffer;
        };
});