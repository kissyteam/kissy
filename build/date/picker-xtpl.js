/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 27 21:46
*/
/*
 Combined modules by KISSY Module Compiler: 

 date/picker-xtpl
*/

KISSY.add("date/picker-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, buffer, payload, undefined) {
    var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("1.50" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div class="');
    var option0 = {escape:1};
    var params1 = [];
    params1.push("header");
    option0.params = params1;
    var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, true);
    buffer.write('">\n    <a id="ks-date-picker-previous-year-btn-');
    var id3 = scope.resolve(["id"]);
    buffer.write(id3, true);
    buffer.write('"\n       class="');
    var option4 = {escape:1};
    var params5 = [];
    params5.push("prev-year-btn");
    option4.params = params5;
    var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
    if(commandRet6 && commandRet6.isBuffer) {
      buffer = commandRet6;
      commandRet6 = undefined
    }
    buffer.write(commandRet6, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id7 = scope.resolve(["previousYearLabel"]);
    buffer.write(id7, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-previous-month-btn-');
    var id8 = scope.resolve(["id"]);
    buffer.write(id8, true);
    buffer.write('"\n       class="');
    var option9 = {escape:1};
    var params10 = [];
    params10.push("prev-month-btn");
    option9.params = params10;
    var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 11);
    if(commandRet11 && commandRet11.isBuffer) {
      buffer = commandRet11;
      commandRet11 = undefined
    }
    buffer.write(commandRet11, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id12 = scope.resolve(["previousMonthLabel"]);
    buffer.write(id12, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n    <a class="');
    var option13 = {escape:1};
    var params14 = [];
    params14.push("month-select");
    option13.params = params14;
    var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 18);
    if(commandRet15 && commandRet15.isBuffer) {
      buffer = commandRet15;
      commandRet15 = undefined
    }
    buffer.write(commandRet15, true);
    buffer.write('"\n       role="button"\n       href="#"\n       tabindex="-1"\n       hidefocus="on"\n       title="');
    var id16 = scope.resolve(["monthSelectLabel"]);
    buffer.write(id16, true);
    buffer.write('"\n       id="ks-date-picker-month-select-');
    var id17 = scope.resolve(["id"]);
    buffer.write(id17, true);
    buffer.write('">\n        <span id="ks-date-picker-month-select-content-');
    var id18 = scope.resolve(["id"]);
    buffer.write(id18, true);
    buffer.write('">');
    var id19 = scope.resolve(["monthYearLabel"]);
    buffer.write(id19, true);
    buffer.write('</span>\n        <span class="');
    var option20 = {escape:1};
    var params21 = [];
    params21.push("month-select-arrow");
    option20.params = params21;
    var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 26);
    if(commandRet22 && commandRet22.isBuffer) {
      buffer = commandRet22;
      commandRet22 = undefined
    }
    buffer.write(commandRet22, true);
    buffer.write('">x</span>\n    </a>\n    <a id="ks-date-picker-next-month-btn-');
    var id23 = scope.resolve(["id"]);
    buffer.write(id23, true);
    buffer.write('"\n       class="');
    var option24 = {escape:1};
    var params25 = [];
    params25.push("next-month-btn");
    option24.params = params25;
    var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 29);
    if(commandRet26 && commandRet26.isBuffer) {
      buffer = commandRet26;
      commandRet26 = undefined
    }
    buffer.write(commandRet26, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id27 = scope.resolve(["nextMonthLabel"]);
    buffer.write(id27, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-next-year-btn-');
    var id28 = scope.resolve(["id"]);
    buffer.write(id28, true);
    buffer.write('"\n       class="');
    var option29 = {escape:1};
    var params30 = [];
    params30.push("next-year-btn");
    option29.params = params30;
    var commandRet31 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 37);
    if(commandRet31 && commandRet31.isBuffer) {
      buffer = commandRet31;
      commandRet31 = undefined
    }
    buffer.write(commandRet31, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id32 = scope.resolve(["nextYearLabel"]);
    buffer.write(id32, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
    var option33 = {escape:1};
    var params34 = [];
    params34.push("body");
    option33.params = params34;
    var commandRet35 = callCommandUtil(engine, scope, option33, buffer, "getBaseCssClasses", 45);
    if(commandRet35 && commandRet35.isBuffer) {
      buffer = commandRet35;
      commandRet35 = undefined
    }
    buffer.write(commandRet35, true);
    buffer.write('">\n    <table class="');
    var option36 = {escape:1};
    var params37 = [];
    params37.push("table");
    option36.params = params37;
    var commandRet38 = callCommandUtil(engine, scope, option36, buffer, "getBaseCssClasses", 46);
    if(commandRet38 && commandRet38.isBuffer) {
      buffer = commandRet38;
      commandRet38 = undefined
    }
    buffer.write(commandRet38, true);
    buffer.write('" cellspacing="0" role="grid">\n        <thead>\n        <tr role="row">\n            ');
    var option39 = {escape:1};
    var params40 = [];
    var id41 = scope.resolve(["showWeekNumber"]);
    params40.push(id41);
    option39.params = params40;
    option39.fn = function(scope, buffer) {
      buffer.write('\n            <th role="columnheader" class="');
      var option42 = {escape:1};
      var params43 = [];
      params43.push("column-header");
      option42.params = params43;
      var commandRet44 = callCommandUtil(engine, scope, option42, buffer, "getBaseCssClasses", 50);
      if(commandRet44 && commandRet44.isBuffer) {
        buffer = commandRet44;
        commandRet44 = undefined
      }
      buffer.write(commandRet44, true);
      buffer.write(" ");
      var option45 = {escape:1};
      var params46 = [];
      params46.push("week-number-header");
      option45.params = params46;
      var commandRet47 = callCommandUtil(engine, scope, option45, buffer, "getBaseCssClasses", 50);
      if(commandRet47 && commandRet47.isBuffer) {
        buffer = commandRet47;
        commandRet47 = undefined
      }
      buffer.write(commandRet47, true);
      buffer.write('">\n                <span class="');
      var option48 = {escape:1};
      var params49 = [];
      params49.push("column-header-inner");
      option48.params = params49;
      var commandRet50 = callCommandUtil(engine, scope, option48, buffer, "getBaseCssClasses", 51);
      if(commandRet50 && commandRet50.isBuffer) {
        buffer = commandRet50;
        commandRet50 = undefined
      }
      buffer.write(commandRet50, true);
      buffer.write('">x</span>\n            </th>\n            ');
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option39, buffer, 49, payload);
    buffer.write("\n            ");
    var option51 = {escape:1};
    var params52 = [];
    var id53 = scope.resolve(["weekdays"]);
    params52.push(id53);
    option51.params = params52;
    option51.fn = function(scope, buffer) {
      buffer.write('\n            <th role="columnheader" title="');
      var id54 = scope.resolve(["this"]);
      buffer.write(id54, true);
      buffer.write('" class="');
      var option55 = {escape:1};
      var params56 = [];
      params56.push("column-header");
      option55.params = params56;
      var commandRet57 = callCommandUtil(engine, scope, option55, buffer, "getBaseCssClasses", 55);
      if(commandRet57 && commandRet57.isBuffer) {
        buffer = commandRet57;
        commandRet57 = undefined
      }
      buffer.write(commandRet57, true);
      buffer.write('">\n                <span class="');
      var option58 = {escape:1};
      var params59 = [];
      params59.push("column-header-inner");
      option58.params = params59;
      var commandRet60 = callCommandUtil(engine, scope, option58, buffer, "getBaseCssClasses", 56);
      if(commandRet60 && commandRet60.isBuffer) {
        buffer = commandRet60;
        commandRet60 = undefined
      }
      buffer.write(commandRet60, true);
      buffer.write('">\n                    ');
      var id62 = scope.resolve(["xindex"]);
      var id61 = scope.resolve(["veryShortWeekdays", id62]);
      buffer.write(id61, true);
      buffer.write("\n                </span>\n            </th>\n            ");
      return buffer
    };
    buffer = eachCommand.call(engine, scope, option51, buffer, 54, payload);
    buffer.write('\n        </tr>\n        </thead>\n        <tbody id="ks-date-picker-tbody-');
    var id63 = scope.resolve(["id"]);
    buffer.write(id63, true);
    buffer.write('">\n        ');
    var option64 = {};
    var commandRet65 = callCommandUtil(engine, scope, option64, buffer, "renderDates", 64);
    if(commandRet65 && commandRet65.isBuffer) {
      buffer = commandRet65;
      commandRet65 = undefined
    }
    buffer.write(commandRet65, false);
    buffer.write("\n        </tbody>\n    </table>\n</div>\n");
    var option66 = {escape:1};
    var params67 = [];
    var id68 = scope.resolve(["showToday"]);
    var exp70 = id68;
    if(!id68) {
      var id69 = scope.resolve(["showClear"]);
      exp70 = id69
    }
    params67.push(exp70);
    option66.params = params67;
    option66.fn = function(scope, buffer) {
      buffer.write('\n<div class="');
      var option71 = {escape:1};
      var params72 = [];
      params72.push("footer");
      option71.params = params72;
      var commandRet73 = callCommandUtil(engine, scope, option71, buffer, "getBaseCssClasses", 69);
      if(commandRet73 && commandRet73.isBuffer) {
        buffer = commandRet73;
        commandRet73 = undefined
      }
      buffer.write(commandRet73, true);
      buffer.write('">\n    <a class="');
      var option74 = {escape:1};
      var params75 = [];
      params75.push("today-btn");
      option74.params = params75;
      var commandRet76 = callCommandUtil(engine, scope, option74, buffer, "getBaseCssClasses", 70);
      if(commandRet76 && commandRet76.isBuffer) {
        buffer = commandRet76;
        commandRet76 = undefined
      }
      buffer.write(commandRet76, true);
      buffer.write('"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-today-btn-');
      var id77 = scope.resolve(["id"]);
      buffer.write(id77, true);
      buffer.write('"\n       title="');
      var id78 = scope.resolve(["todayTimeLabel"]);
      buffer.write(id78, true);
      buffer.write('">');
      var id79 = scope.resolve(["todayLabel"]);
      buffer.write(id79, true);
      buffer.write('</a>\n    <a class="');
      var option80 = {escape:1};
      var params81 = [];
      params81.push("clear-btn");
      option80.params = params81;
      var commandRet82 = callCommandUtil(engine, scope, option80, buffer, "getBaseCssClasses", 77);
      if(commandRet82 && commandRet82.isBuffer) {
        buffer = commandRet82;
        commandRet82 = undefined
      }
      buffer.write(commandRet82, true);
      buffer.write('"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-clear-btn-');
      var id83 = scope.resolve(["id"]);
      buffer.write(id83, true);
      buffer.write('">');
      var id84 = scope.resolve(["clearLabel"]);
      buffer.write(id84, true);
      buffer.write("</a>\n</div>\n");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option66, buffer, 68, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});

