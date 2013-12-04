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
            params2.push('component/extension/content-xtpl');
            config1.params = params2;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config1.params[0] = moduleWrap.resolveByName(config1.params[0]);
            }
            var id0 = runInlineCommandUtil(engine, scope, config1, "include", 1);
            buffer += renderOutputUtil(id0, false);
            buffer += '\n<div class="';
            var config4 = {};
            var params5 = [];
            params5.push('dropdown');
            config4.params = params5;
            var id3 = runInlineCommandUtil(engine, scope, config4, "getBaseCssClasses", 2);
            buffer += renderOutputUtil(id3, true);
            buffer += '">\n    <div class="';
            var config7 = {};
            var params8 = [];
            params8.push('dropdown-inner');
            config7.params = params8;
            var id6 = runInlineCommandUtil(engine, scope, config7, "getBaseCssClasses", 3);
            buffer += renderOutputUtil(id6, true);
            buffer += '">\n    </div>\n</div>';
            return buffer;
        };
});