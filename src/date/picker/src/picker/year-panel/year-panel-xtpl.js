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
            buffer += '">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-';
            var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
            buffer += renderOutputUtil(id3, true);
            buffer += '"\n       class="';
            var config5 = {};
            var params6 = [];
            params6.push('prev-decade-btn');
            config5.params = params6;
            var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
            buffer += renderOutputUtil(id4, true);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousDecadeLabel", 0, 6);
            buffer += renderOutputUtil(id7, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n\n    <a class="';
            var config9 = {};
            var params10 = [];
            params10.push('decade-select');
            config9.params = params10;
            var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 10);
            buffer += renderOutputUtil(id8, true);
            buffer += '"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="';
            var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "decadeSelectLabel", 0, 14);
            buffer += renderOutputUtil(id11, true);
            buffer += '"\n       id="ks-date-picker-year-panel-decade-select-';
            var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 15);
            buffer += renderOutputUtil(id12, true);
            buffer += '">\n            <span id="ks-date-picker-year-panel-decade-select-content-';
            var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 16);
            buffer += renderOutputUtil(id13, true);
            buffer += '">\n                ';
            var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "startYear", 0, 17);
            buffer += renderOutputUtil(id14, true);
            buffer += '-';
            var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 17);
            buffer += renderOutputUtil(id15, true);
            buffer += '\n            </span>\n        <span class="';
            var config17 = {};
            var params18 = [];
            params18.push('decade-select-arrow');
            config17.params = params18;
            var id16 = runInlineCommandUtil(engine, scope, config17, "getBaseCssClasses", 19);
            buffer += renderOutputUtil(id16, true);
            buffer += '">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-';
            var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 22);
            buffer += renderOutputUtil(id19, true);
            buffer += '"\n       class="';
            var config21 = {};
            var params22 = [];
            params22.push('next-decade-btn');
            config21.params = params22;
            var id20 = runInlineCommandUtil(engine, scope, config21, "getBaseCssClasses", 23);
            buffer += renderOutputUtil(id20, true);
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextDecadeLabel", 0, 26);
            buffer += renderOutputUtil(id23, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
            var config25 = {};
            var params26 = [];
            params26.push('body');
            config25.params = params26;
            var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 30);
            buffer += renderOutputUtil(id24, true);
            buffer += '">\n    <table class="';
            var config28 = {};
            var params29 = [];
            params29.push('table');
            config28.params = params29;
            var id27 = runInlineCommandUtil(engine, scope, config28, "getBaseCssClasses", 31);
            buffer += renderOutputUtil(id27, true);
            buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-';
            var id30 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 32);
            buffer += renderOutputUtil(id30, true);
            buffer += '">\n        ';
            var config32 = {};
            var params33 = [];
            params33.push('date/picker/year-panel/years-xtpl');
            config32.params = params33;
            if (moduleWrap) {
                require("date/picker/year-panel/years-xtpl");
                config32.params[0] = moduleWrap.resolveByName(config32.params[0]);
            }
            var id31 = runInlineCommandUtil(engine, scope, config32, "include", 33);
            buffer += renderOutputUtil(id31, false);
            buffer += '\n        </tbody>\n    </table>\n</div>';
            return buffer;
        };
});