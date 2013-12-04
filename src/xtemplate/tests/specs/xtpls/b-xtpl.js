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
            var config0 = {};
            var params1 = [];
            var id2 = getPropertyUtil(engine, scope, "b", 0, 1);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '';
                var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "c", 0, 1);
                buffer += renderOutputUtil(id3, true);
                buffer += '';
                var id4 = getPropertyUtil(engine, scope, "d", 1, 1);
                buffer += renderOutputUtil(id4, true);
                buffer += '';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config0, "with", 1);
            return buffer;
        };
});