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
            var config0 = {};
            var params1 = [];
            var id2 = getPropertyUtil(engine, scope, "closable", 0, 1);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<a href="javascript:void(\'close\')"\n   id="ks-overlay-close-';
                var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3);
                buffer += renderOutputUtil(id3, true);
                buffer += '"\n   class="';
                var config5 = {};
                var params6 = [];
                params6.push('close');
                config5.params = params6;
                var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 4);
                buffer += renderOutputUtil(id4, true);
                buffer += '"\n   role=\'button\'>\n    <span class="';
                var config8 = {};
                var params9 = [];
                params9.push('close-x');
                config8.params = params9;
                var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 6);
                buffer += renderOutputUtil(id7, true);
                buffer += '">close</span>\n</a>\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config0, "if", 1);
            buffer += '\n';
            return buffer;
        };
});