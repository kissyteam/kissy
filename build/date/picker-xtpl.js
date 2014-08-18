/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:17
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 date/picker-xtpl
*/

KISSY.add("date/picker-xtpl", [], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div class="';
    var config1 = {};
    var params2 = [];
    params2.push("header");
    config1.params = params2;
    var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '">\n    <a id="ks-date-picker-previous-year-btn-';
    var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
    buffer += renderOutputUtil(id3, true);
    buffer += '"\n       class="';
    var config5 = {};
    var params6 = [];
    params6.push("prev-year-btn");
    config5.params = params6;
    var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
    buffer += renderOutputUtil(id4, true);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousYearLabel", 0, 7);
    buffer += renderOutputUtil(id7, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-previous-month-btn-';
    var id8 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10);
    buffer += renderOutputUtil(id8, true);
    buffer += '"\n       class="';
    var config10 = {};
    var params11 = [];
    params11.push("prev-month-btn");
    config10.params = params11;
    var id9 = runInlineCommandUtil(engine, scope, config10, "getBaseCssClasses", 11);
    buffer += renderOutputUtil(id9, true);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousMonthLabel", 0, 15);
    buffer += renderOutputUtil(id12, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <a class="';
    var config14 = {};
    var params15 = [];
    params15.push("month-select");
    config14.params = params15;
    var id13 = runInlineCommandUtil(engine, scope, config14, "getBaseCssClasses", 18);
    buffer += renderOutputUtil(id13, true);
    buffer += '"\n       role="button"\n       href="#"\n       tabindex="-1"\n       hidefocus="on"\n       title="';
    var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "monthSelectLabel", 0, 23);
    buffer += renderOutputUtil(id16, true);
    buffer += '"\n       id="ks-date-picker-month-select-';
    var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 24);
    buffer += renderOutputUtil(id17, true);
    buffer += '">\n        <span id="ks-date-picker-month-select-content-';
    var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 25);
    buffer += renderOutputUtil(id18, true);
    buffer += '">';
    var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "monthYearLabel", 0, 25);
    buffer += renderOutputUtil(id19, true);
    buffer += '</span>\n        <span class="';
    var config21 = {};
    var params22 = [];
    params22.push("month-select-arrow");
    config21.params = params22;
    var id20 = runInlineCommandUtil(engine, scope, config21, "getBaseCssClasses", 26);
    buffer += renderOutputUtil(id20, true);
    buffer += '">x</span>\n    </a>\n    <a id="ks-date-picker-next-month-btn-';
    var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 28);
    buffer += renderOutputUtil(id23, true);
    buffer += '"\n       class="';
    var config25 = {};
    var params26 = [];
    params26.push("next-month-btn");
    config25.params = params26;
    var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 29);
    buffer += renderOutputUtil(id24, true);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id27 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextMonthLabel", 0, 33);
    buffer += renderOutputUtil(id27, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-next-year-btn-';
    var id28 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 36);
    buffer += renderOutputUtil(id28, true);
    buffer += '"\n       class="';
    var config30 = {};
    var params31 = [];
    params31.push("next-year-btn");
    config30.params = params31;
    var id29 = runInlineCommandUtil(engine, scope, config30, "getBaseCssClasses", 37);
    buffer += renderOutputUtil(id29, true);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id32 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextYearLabel", 0, 41);
    buffer += renderOutputUtil(id32, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var config34 = {};
    var params35 = [];
    params35.push("body");
    config34.params = params35;
    var id33 = runInlineCommandUtil(engine, scope, config34, "getBaseCssClasses", 45);
    buffer += renderOutputUtil(id33, true);
    buffer += '">\n    <table class="';
    var config37 = {};
    var params38 = [];
    params38.push("table");
    config37.params = params38;
    var id36 = runInlineCommandUtil(engine, scope, config37, "getBaseCssClasses", 46);
    buffer += renderOutputUtil(id36, true);
    buffer += '" cellspacing="0" role="grid">\n        <thead>\n        <tr role="row">\n            ';
    var config39 = {};
    var params40 = [];
    var id41 = getPropertyUtil(engine, scope, "showWeekNumber", 0, 49);
    params40.push(id41);
    config39.params = params40;
    config39.fn = function(scope) {
      var buffer = "";
      buffer += '\n            <th role="columnheader" class="';
      var config43 = {};
      var params44 = [];
      params44.push("column-header");
      config43.params = params44;
      var id42 = runInlineCommandUtil(engine, scope, config43, "getBaseCssClasses", 50);
      buffer += renderOutputUtil(id42, true);
      buffer += " ";
      var config46 = {};
      var params47 = [];
      params47.push("week-number-header");
      config46.params = params47;
      var id45 = runInlineCommandUtil(engine, scope, config46, "getBaseCssClasses", 50);
      buffer += renderOutputUtil(id45, true);
      buffer += '">\n                <span class="';
      var config49 = {};
      var params50 = [];
      params50.push("column-header-inner");
      config49.params = params50;
      var id48 = runInlineCommandUtil(engine, scope, config49, "getBaseCssClasses", 51);
      buffer += renderOutputUtil(id48, true);
      buffer += '">x</span>\n            </th>\n            ';
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config39, "if", 49);
    buffer += "\n            ";
    var config51 = {};
    var params52 = [];
    var id53 = getPropertyUtil(engine, scope, "weekdays", 0, 54);
    params52.push(id53);
    config51.params = params52;
    config51.fn = function(scope) {
      var buffer = "";
      buffer += '\n            <th role="columnheader" title="';
      var id54 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 55);
      buffer += renderOutputUtil(id54, true);
      buffer += '" class="';
      var config56 = {};
      var params57 = [];
      params57.push("column-header");
      config56.params = params57;
      var id55 = runInlineCommandUtil(engine, scope, config56, "getBaseCssClasses", 55);
      buffer += renderOutputUtil(id55, true);
      buffer += '">\n                <span class="';
      var config59 = {};
      var params60 = [];
      params60.push("column-header-inner");
      config59.params = params60;
      var id58 = runInlineCommandUtil(engine, scope, config59, "getBaseCssClasses", 56);
      buffer += renderOutputUtil(id58, true);
      buffer += '">\n                    ';
      var id62 = getPropertyUtil(engine, scope, "xindex", 0, 57);
      var id61 = getPropertyOrRunCommandUtil(engine, scope, {}, "veryShortWeekdays." + id62 + "", 0, 57);
      buffer += renderOutputUtil(id61, true);
      buffer += "\n                </span>\n            </th>\n            ";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config51, "each", 54);
    buffer += '\n        </tr>\n        </thead>\n        <tbody id="ks-date-picker-tbody-';
    var id63 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 63);
    buffer += renderOutputUtil(id63, true);
    buffer += '">\n        ';
    var id64 = getPropertyOrRunCommandUtil(engine, scope, {}, "renderDates", 0, 64);
    buffer += renderOutputUtil(id64, false);
    buffer += "\n        </tbody>\n    </table>\n</div>\n";
    var config65 = {};
    var params66 = [];
    var id67 = getPropertyUtil(engine, scope, "showToday", 0, 68);
    var id68 = getPropertyUtil(engine, scope, "showClear", 0, 68);
    params66.push(id67 || id68);
    config65.params = params66;
    config65.fn = function(scope) {
      var buffer = "";
      buffer += '\n<div class="';
      var config70 = {};
      var params71 = [];
      params71.push("footer");
      config70.params = params71;
      var id69 = runInlineCommandUtil(engine, scope, config70, "getBaseCssClasses", 69);
      buffer += renderOutputUtil(id69, true);
      buffer += '">\n    <a class="';
      var config73 = {};
      var params74 = [];
      params74.push("today-btn");
      config73.params = params74;
      var id72 = runInlineCommandUtil(engine, scope, config73, "getBaseCssClasses", 70);
      buffer += renderOutputUtil(id72, true);
      buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-today-btn-';
      var id75 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 75);
      buffer += renderOutputUtil(id75, true);
      buffer += '"\n       title="';
      var id76 = getPropertyOrRunCommandUtil(engine, scope, {}, "todayTimeLabel", 0, 76);
      buffer += renderOutputUtil(id76, true);
      buffer += '">';
      var id77 = getPropertyOrRunCommandUtil(engine, scope, {}, "todayLabel", 0, 76);
      buffer += renderOutputUtil(id77, true);
      buffer += '</a>\n    <a class="';
      var config79 = {};
      var params80 = [];
      params80.push("clear-btn");
      config79.params = params80;
      var id78 = runInlineCommandUtil(engine, scope, config79, "getBaseCssClasses", 77);
      buffer += renderOutputUtil(id78, true);
      buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-clear-btn-';
      var id81 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 82);
      buffer += renderOutputUtil(id81, true);
      buffer += '">';
      var id82 = getPropertyOrRunCommandUtil(engine, scope, {}, "clearLabel", 0, 82);
      buffer += renderOutputUtil(id82, true);
      buffer += "</a>\n</div>\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config65, "if", 68);
    return buffer
  }
});

