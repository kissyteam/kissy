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
                getExpressionUtil = utils.getExpression,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '<div class="';
            var config1 = {};
            var params2 = [];
            params2.push('header');
            config1.params = params2;
            var id0 = getPropertyOrRunCommandUtil(engine, scope, config1, "getBaseCssClasses", 0, 1, true, undefined);
            buffer += id0;
            buffer += '">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-';
            var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2, undefined, false);
            buffer += getExpressionUtil(id3, true);
            buffer += '"\n       class="';
            var config5 = {};
            var params6 = [];
            params6.push('prev-decade-btn');
            config5.params = params6;
            var id4 = getPropertyOrRunCommandUtil(engine, scope, config5, "getBaseCssClasses", 0, 3, true, undefined);
            buffer += id4;
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousDecadeLabel", 0, 6, undefined, false);
            buffer += getExpressionUtil(id7, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n\n    <a class="';
            var config9 = {};
            var params10 = [];
            params10.push('decade-select');
            config9.params = params10;
            var id8 = getPropertyOrRunCommandUtil(engine, scope, config9, "getBaseCssClasses", 0, 10, true, undefined);
            buffer += id8;
            buffer += '"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="';
            var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "decadeSelectLabel", 0, 14, undefined, false);
            buffer += getExpressionUtil(id11, true);
            buffer += '"\n       id="ks-date-picker-year-panel-decade-select-';
            var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 15, undefined, false);
            buffer += getExpressionUtil(id12, true);
            buffer += '">\n            <span id="ks-date-picker-year-panel-decade-select-content-';
            var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 16, undefined, false);
            buffer += getExpressionUtil(id13, true);
            buffer += '">\n                ';
            var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "startYear", 0, 17, undefined, false);
            buffer += getExpressionUtil(id14, true);
            buffer += '-';
            var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 17, undefined, false);
            buffer += getExpressionUtil(id15, true);
            buffer += '\n            </span>\n        <span class="';
            var config17 = {};
            var params18 = [];
            params18.push('decade-select-arrow');
            config17.params = params18;
            var id16 = getPropertyOrRunCommandUtil(engine, scope, config17, "getBaseCssClasses", 0, 19, true, undefined);
            buffer += id16;
            buffer += '">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-';
            var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 22, undefined, false);
            buffer += getExpressionUtil(id19, true);
            buffer += '"\n       class="';
            var config21 = {};
            var params22 = [];
            params22.push('next-decade-btn');
            config21.params = params22;
            var id20 = getPropertyOrRunCommandUtil(engine, scope, config21, "getBaseCssClasses", 0, 23, true, undefined);
            buffer += id20;
            buffer += '"\n       href="#"\n       role="button"\n       title="';
            var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextDecadeLabel", 0, 26, undefined, false);
            buffer += getExpressionUtil(id23, true);
            buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
            var config25 = {};
            var params26 = [];
            params26.push('body');
            config25.params = params26;
            var id24 = getPropertyOrRunCommandUtil(engine, scope, config25, "getBaseCssClasses", 0, 30, true, undefined);
            buffer += id24;
            buffer += '">\n    <table class="';
            var config28 = {};
            var params29 = [];
            params29.push('table');
            config28.params = params29;
            var id27 = getPropertyOrRunCommandUtil(engine, scope, config28, "getBaseCssClasses", 0, 31, true, undefined);
            buffer += id27;
            buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-';
            var id30 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 32, undefined, false);
            buffer += getExpressionUtil(id30, true);
            buffer += '">\n        ';
            var config32 = {};
            var params33 = [];
            params33.push('date/picker/year-panel/years-xtpl');
            config32.params = params33;
            if (moduleWrap) {
                require("date/picker/year-panel/years-xtpl");
                config32.params[0] = moduleWrap.resolveByName(config32.params[0]);
            }
            var id31 = getPropertyOrRunCommandUtil(engine, scope, config32, "include", 0, 33, false, undefined);
            buffer += id31;
            buffer += '\n        </tbody>\n    </table>\n</div>';
            return buffer;
        };
});