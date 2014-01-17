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
            var id2 = getPropertyUtil(engine, scope, "withTitle", 0, 1);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '\r\n<div class="';
                var config4 = {};
                var params5 = [];
                params5.push('title-wrap');
                config4.params = params5;
                var id3 = runInlineCommandUtil(engine, scope, config4, "getBaseCssClasses", 2);
                buffer += renderOutputUtil(id3, true);
                buffer += '">\r\n    <div class="';
                var config7 = {};
                var params8 = [];
                params8.push('title');
                config7.params = params8;
                var id6 = runInlineCommandUtil(engine, scope, config7, "getBaseCssClasses", 3);
                buffer += renderOutputUtil(id6, true);
                buffer += '" id="ks-navigation-bar-title-';
                var id9 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3);
                buffer += renderOutputUtil(id9, true);
                buffer += '">';
                var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 3);
                buffer += renderOutputUtil(id10, true);
                buffer += '</div>\r\n</div>\r\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config0, "if", 1);
            buffer += '\r\n<div class="';
            var config12 = {};
            var params13 = [];
            params13.push('content');
            config12.params = params13;
            var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 6);
            buffer += renderOutputUtil(id11, true);
            buffer += '" id="ks-navigation-bar-content-';
            var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 6);
            buffer += renderOutputUtil(id14, true);
            buffer += '">\r\n    <div class="';
            var config16 = {};
            var params17 = [];
            params17.push('center');
            config16.params = params17;
            var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 7);
            buffer += renderOutputUtil(id15, true);
            buffer += '" id="ks-navigation-bar-center-';
            var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
            buffer += renderOutputUtil(id18, true);
            buffer += '"></div>\r\n</div>';
            return buffer;
        };
});