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
            buffer += '<div class="';
            var config1 = {};
            var params2 = [];
            params2.push('checkbox');
            config1.params = params2;
            var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '">\n</div>\n';
            var config4 = {};
            var params5 = [];
            params5.push('component/extension/content-xtpl');
            config4.params = params5;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config4.params[0] = moduleWrap.resolveByName(config4.params[0]);
            }
            var id3 = runInlineCommandUtil(engine, scope, config4, "include", 3);
            buffer += renderOutputUtil(id3, false);
            return buffer;
        };
});