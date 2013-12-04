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
            params2.push('header');
            config1.params = params2;
            var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '">\n    <a id="ks-date-picker-decade-panel-previous-century-btn-';
            var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
            buffer += renderOutputUtil(id3, true);
            buffer += '"\n       class="';
            var config5 = {};
            var params6 = [];
            params6.push('prev-century-btn');
            config5.params = params6;
            var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
            buffer += renderOutputUtil(id4, true);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousCenturyLabel", 0, 6);
            buffer += renderOutputUtil(id7, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n    <div class="';
            var config9 = {};
            var params10 = [];
            params10.push('century');
            config9.params = params10;
            var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 9);
            buffer += renderOutputUtil(id8, true);
            buffer += '"\n         id="ks-date-picker-decade-panel-century-';
            var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10);
            buffer += renderOutputUtil(id11, true);
            buffer += '">\n                ';
            var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "startYear", 0, 11);
            buffer += renderOutputUtil(id12, true);
            buffer += '-';
            var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 11);
            buffer += renderOutputUtil(id13, true);
            buffer += '\n    </div>\n    <a id="ks-date-picker-decade-panel-next-century-btn-';
            var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 13);
            buffer += renderOutputUtil(id14, true);
            buffer += '"\n       class="';
            var config16 = {};
            var params17 = [];
            params17.push('next-century-btn');
            config16.params = params17;
            var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 14);
            buffer += renderOutputUtil(id15, true);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextCenturyLabel", 0, 17);
            buffer += renderOutputUtil(id18, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
            var config20 = {};
            var params21 = [];
            params21.push('body');
            config20.params = params21;
            var id19 = runInlineCommandUtil(engine, scope, config20, "getBaseCssClasses", 21);
            buffer += renderOutputUtil(id19, true);
            buffer += '">\n    <table class="';
            var config23 = {};
            var params24 = [];
            params24.push('table');
            config23.params = params24;
            var id22 = runInlineCommandUtil(engine, scope, config23, "getBaseCssClasses", 22);
            buffer += renderOutputUtil(id22, true);
            buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-decade-panel-tbody-';
            var id25 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 23);
            buffer += renderOutputUtil(id25, true);
            buffer += '">\n        ';
            var config27 = {};
            var params28 = [];
            params28.push('date/picker/decade-panel/decades-xtpl');
            config27.params = params28;
            if (moduleWrap) {
                require("date/picker/decade-panel/decades-xtpl");
                config27.params[0] = moduleWrap.resolveByName(config27.params[0]);
            }
            var id26 = runInlineCommandUtil(engine, scope, config27, "include", 24);
            buffer += renderOutputUtil(id26, false);
            buffer += '\n        </tbody>\n    </table>\n</div>';
            return buffer;
        };
});