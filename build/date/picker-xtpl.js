/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:49
*/
/*
 Combined modules by KISSY Module Compiler: 

 date/picker-xtpl
*/

KISSY.add("date/picker-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += '<div class="';
    var option1 = {};
    var params2 = [];
    params2.push("header");
    option1.params = params2;
    var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
    buffer += escapeHtml(id0);
    buffer += '">\n    <a id="ks-date-picker-previous-year-btn-';
    var id3 = scope.resolve(["id"]);
    buffer += escapeHtml(id3);
    buffer += '"\n       class="';
    var option5 = {};
    var params6 = [];
    params6.push("prev-year-btn");
    option5.params = params6;
    var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
    buffer += escapeHtml(id4);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id7 = scope.resolve(["previousYearLabel"]);
    buffer += escapeHtml(id7);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-previous-month-btn-';
    var id8 = scope.resolve(["id"]);
    buffer += escapeHtml(id8);
    buffer += '"\n       class="';
    var option10 = {};
    var params11 = [];
    params11.push("prev-month-btn");
    option10.params = params11;
    var id9 = callCommandUtil(engine, scope, option10, "getBaseCssClasses", 11);
    buffer += escapeHtml(id9);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id12 = scope.resolve(["previousMonthLabel"]);
    buffer += escapeHtml(id12);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <a class="';
    var option14 = {};
    var params15 = [];
    params15.push("month-select");
    option14.params = params15;
    var id13 = callCommandUtil(engine, scope, option14, "getBaseCssClasses", 18);
    buffer += escapeHtml(id13);
    buffer += '"\n       role="button"\n       href="#"\n       tabindex="-1"\n       hidefocus="on"\n       title="';
    var id16 = scope.resolve(["monthSelectLabel"]);
    buffer += escapeHtml(id16);
    buffer += '"\n       id="ks-date-picker-month-select-';
    var id17 = scope.resolve(["id"]);
    buffer += escapeHtml(id17);
    buffer += '">\n        <span id="ks-date-picker-month-select-content-';
    var id18 = scope.resolve(["id"]);
    buffer += escapeHtml(id18);
    buffer += '">';
    var id19 = scope.resolve(["monthYearLabel"]);
    buffer += escapeHtml(id19);
    buffer += '</span>\n        <span class="';
    var option21 = {};
    var params22 = [];
    params22.push("month-select-arrow");
    option21.params = params22;
    var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 26);
    buffer += escapeHtml(id20);
    buffer += '">x</span>\n    </a>\n    <a id="ks-date-picker-next-month-btn-';
    var id23 = scope.resolve(["id"]);
    buffer += escapeHtml(id23);
    buffer += '"\n       class="';
    var option25 = {};
    var params26 = [];
    params26.push("next-month-btn");
    option25.params = params26;
    var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 29);
    buffer += escapeHtml(id24);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id27 = scope.resolve(["nextMonthLabel"]);
    buffer += escapeHtml(id27);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-next-year-btn-';
    var id28 = scope.resolve(["id"]);
    buffer += escapeHtml(id28);
    buffer += '"\n       class="';
    var option30 = {};
    var params31 = [];
    params31.push("next-year-btn");
    option30.params = params31;
    var id29 = callCommandUtil(engine, scope, option30, "getBaseCssClasses", 37);
    buffer += escapeHtml(id29);
    buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
    var id32 = scope.resolve(["nextYearLabel"]);
    buffer += escapeHtml(id32);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var option34 = {};
    var params35 = [];
    params35.push("body");
    option34.params = params35;
    var id33 = callCommandUtil(engine, scope, option34, "getBaseCssClasses", 45);
    buffer += escapeHtml(id33);
    buffer += '">\n    <table class="';
    var option37 = {};
    var params38 = [];
    params38.push("table");
    option37.params = params38;
    var id36 = callCommandUtil(engine, scope, option37, "getBaseCssClasses", 46);
    buffer += escapeHtml(id36);
    buffer += '" cellspacing="0" role="grid">\n        <thead>\n        <tr role="row">\n            ';
    var option39 = {};
    var params40 = [];
    var id41 = scope.resolve(["showWeekNumber"]);
    params40.push(id41);
    option39.params = params40;
    option39.fn = function(scope) {
      var buffer = "";
      buffer += '\n            <th role="columnheader" class="';
      var option43 = {};
      var params44 = [];
      params44.push("column-header");
      option43.params = params44;
      var id42 = callCommandUtil(engine, scope, option43, "getBaseCssClasses", 50);
      buffer += escapeHtml(id42);
      buffer += " ";
      var option46 = {};
      var params47 = [];
      params47.push("week-number-header");
      option46.params = params47;
      var id45 = callCommandUtil(engine, scope, option46, "getBaseCssClasses", 50);
      buffer += escapeHtml(id45);
      buffer += '">\n                <span class="';
      var option49 = {};
      var params50 = [];
      params50.push("column-header-inner");
      option49.params = params50;
      var id48 = callCommandUtil(engine, scope, option49, "getBaseCssClasses", 51);
      buffer += escapeHtml(id48);
      buffer += '">x</span>\n            </th>\n            ';
      return buffer
    };
    buffer += ifCommand.call(engine, scope, option39, payload);
    buffer += "\n            ";
    var option51 = {};
    var params52 = [];
    var id53 = scope.resolve(["weekdays"]);
    params52.push(id53);
    option51.params = params52;
    option51.fn = function(scope) {
      var buffer = "";
      buffer += '\n            <th role="columnheader" title="';
      var id54 = scope.resolve(["this"]);
      buffer += escapeHtml(id54);
      buffer += '" class="';
      var option56 = {};
      var params57 = [];
      params57.push("column-header");
      option56.params = params57;
      var id55 = callCommandUtil(engine, scope, option56, "getBaseCssClasses", 55);
      buffer += escapeHtml(id55);
      buffer += '">\n                <span class="';
      var option59 = {};
      var params60 = [];
      params60.push("column-header-inner");
      option59.params = params60;
      var id58 = callCommandUtil(engine, scope, option59, "getBaseCssClasses", 56);
      buffer += escapeHtml(id58);
      buffer += '">\n                    ';
      var id62 = scope.resolve(["xindex"]);
      var id61 = scope.resolve("veryShortWeekdays." + id62 + "");
      buffer += escapeHtml(id61);
      buffer += "\n                </span>\n            </th>\n            ";
      return buffer
    };
    buffer += eachCommand.call(engine, scope, option51, payload);
    buffer += '\n        </tr>\n        </thead>\n        <tbody id="ks-date-picker-tbody-';
    var id63 = scope.resolve(["id"]);
    buffer += escapeHtml(id63);
    buffer += '">\n        ';
    var id64 = callCommandUtil(engine, scope, undefined, "renderDates", 64);
    if(id64 || id64 === 0) {
      buffer += id64
    }
    buffer += "\n        </tbody>\n    </table>\n</div>\n";
    var option65 = {};
    var params66 = [];
    var id67 = scope.resolve(["showToday"]);
    var id68 = scope.resolve(["showClear"]);
    params66.push(id67 || id68);
    option65.params = params66;
    option65.fn = function(scope) {
      var buffer = "";
      buffer += '\n<div class="';
      var option70 = {};
      var params71 = [];
      params71.push("footer");
      option70.params = params71;
      var id69 = callCommandUtil(engine, scope, option70, "getBaseCssClasses", 69);
      buffer += escapeHtml(id69);
      buffer += '">\n    <a class="';
      var option73 = {};
      var params74 = [];
      params74.push("today-btn");
      option73.params = params74;
      var id72 = callCommandUtil(engine, scope, option73, "getBaseCssClasses", 70);
      buffer += escapeHtml(id72);
      buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-today-btn-';
      var id75 = scope.resolve(["id"]);
      buffer += escapeHtml(id75);
      buffer += '"\n       title="';
      var id76 = scope.resolve(["todayTimeLabel"]);
      buffer += escapeHtml(id76);
      buffer += '">';
      var id77 = scope.resolve(["todayLabel"]);
      buffer += escapeHtml(id77);
      buffer += '</a>\n    <a class="';
      var option79 = {};
      var params80 = [];
      params80.push("clear-btn");
      option79.params = params80;
      var id78 = callCommandUtil(engine, scope, option79, "getBaseCssClasses", 77);
      buffer += escapeHtml(id78);
      buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-clear-btn-';
      var id81 = scope.resolve(["id"]);
      buffer += escapeHtml(id81);
      buffer += '">';
      var id82 = scope.resolve(["clearLabel"]);
      buffer += escapeHtml(id82);
      buffer += "</a>\n</div>\n";
      return buffer
    };
    buffer += ifCommand.call(engine, scope, option65, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});

