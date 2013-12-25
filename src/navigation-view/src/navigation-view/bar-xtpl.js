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
            params2.push('title-wrap');
            config1.params = params2;
            var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '">\r\n    <div class="';
            var config4 = {};
            var params5 = [];
            params5.push('title');
            config4.params = params5;
            var id3 = runInlineCommandUtil(engine, scope, config4, "getBaseCssClasses", 2);
            buffer += renderOutputUtil(id3, true);
            buffer += '" id="ks-navigation-bar-title-';
            var id6 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
            buffer += renderOutputUtil(id6, true);
            buffer += '">';
            var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 2);
            buffer += renderOutputUtil(id7, true);
            buffer += '</div>\r\n</div>\r\n<div class="';
            var config9 = {};
            var params10 = [];
            params10.push('content');
            config9.params = params10;
            var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 4);
            buffer += renderOutputUtil(id8, true);
            buffer += '" id="ks-navigation-bar-content-';
            var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 4);
            buffer += renderOutputUtil(id11, true);
            buffer += '">\r\n    <div class="';
            var config13 = {};
            var params14 = [];
            params14.push('back');
            config13.params = params14;
            var id12 = runInlineCommandUtil(engine, scope, config13, "getBaseCssClasses", 5);
            buffer += renderOutputUtil(id12, true);
            buffer += '" style="display: none"\r\n         id="ks-navigation-bar-back-';
            var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 6);
            buffer += renderOutputUtil(id15, true);
            buffer += '">';
            var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "backText", 0, 6);
            buffer += renderOutputUtil(id16, true);
            buffer += '</div>\r\n    <div class="';
            var config18 = {};
            var params19 = [];
            params19.push('center');
            config18.params = params19;
            var id17 = runInlineCommandUtil(engine, scope, config18, "getBaseCssClasses", 7);
            buffer += renderOutputUtil(id17, true);
            buffer += '"></div>\r\n</div>';
            return buffer;
        };
});