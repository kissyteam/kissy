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
            buffer += '">\n    <a id="ks-date-picker-month-panel-previous-year-btn-';
            var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
            buffer += renderOutputUtil(id3, true);
            buffer += '"\n       class="';
            var config5 = {};
            var params6 = [];
            params6.push('prev-year-btn');
            config5.params = params6;
            var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
            buffer += renderOutputUtil(id4, true);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousYearLabel", 0, 6);
            buffer += renderOutputUtil(id7, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n\n\n        <a class="';
            var config9 = {};
            var params10 = [];
            params10.push('year-select');
            config9.params = params10;
            var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 11);
            buffer += renderOutputUtil(id8, true);
            buffer += '"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="';
            var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "yearSelectLabel", 0, 15);
            buffer += renderOutputUtil(id11, true);
            buffer += '"\n           id="ks-date-picker-month-panel-year-select-';
            var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 16);
            buffer += renderOutputUtil(id12, true);
            buffer += '">\n            <span id="ks-date-picker-month-panel-year-select-content-';
            var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 17);
            buffer += renderOutputUtil(id13, true);
            buffer += '">';
            var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "year", 0, 17);
            buffer += renderOutputUtil(id14, true);
            buffer += '</span>\n            <span class="';
            var config16 = {};
            var params17 = [];
            params17.push('year-select-arrow');
            config16.params = params17;
            var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 18);
            buffer += renderOutputUtil(id15, true);
            buffer += '">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-';
            var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 21);
            buffer += renderOutputUtil(id18, true);
            buffer += '"\n       class="';
            var config20 = {};
            var params21 = [];
            params21.push('next-year-btn');
            config20.params = params21;
            var id19 = runInlineCommandUtil(engine, scope, config20, "getBaseCssClasses", 22);
            buffer += renderOutputUtil(id19, true);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id22 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextYearLabel", 0, 25);
            buffer += renderOutputUtil(id22, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
            var config24 = {};
            var params25 = [];
            params25.push('body');
            config24.params = params25;
            var id23 = runInlineCommandUtil(engine, scope, config24, "getBaseCssClasses", 29);
            buffer += renderOutputUtil(id23, true);
            buffer += '">\n    <table class="';
            var config27 = {};
            var params28 = [];
            params28.push('table');
            config27.params = params28;
            var id26 = runInlineCommandUtil(engine, scope, config27, "getBaseCssClasses", 30);
            buffer += renderOutputUtil(id26, true);
            buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-';
            var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 31);
            buffer += renderOutputUtil(id29, true);
            buffer += '">\n        ';
            var config31 = {};
            var params32 = [];
            params32.push('date/picker/month-panel/months-xtpl');
            config31.params = params32;
            if (moduleWrap) {
                require("date/picker/month-panel/months-xtpl");
                config31.params[0] = moduleWrap.resolveByName(config31.params[0]);
            }
            var id30 = runInlineCommandUtil(engine, scope, config31, "include", 32);
            buffer += renderOutputUtil(id30, false);
            buffer += '\n        </tbody>\n    </table>\n</div>';
            return buffer;
        };
});