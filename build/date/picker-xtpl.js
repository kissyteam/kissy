/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 20:16
*/
/*
 Combined modules by KISSY Module Compiler: 

 date/picker-xtpl
*/

KISSY.add("date/picker-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
    buffer.write('">\n    <a class="');
    var option3 = {escape:1};
    var params4 = [];
    params4.push("prev-year-btn");
    option3.params = params4;
    var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
    if(commandRet5 && commandRet5.isBuffer) {
      buffer = commandRet5;
      commandRet5 = undefined
    }
    buffer.write(commandRet5, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id6 = scope.resolve(["previousYearLabel"]);
    buffer.write(id6, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n    <a class="');
    var option7 = {escape:1};
    var params8 = [];
    params8.push("prev-month-btn");
    option7.params = params8;
    var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
    if(commandRet9 && commandRet9.isBuffer) {
      buffer = commandRet9;
      commandRet9 = undefined
    }
    buffer.write(commandRet9, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id10 = scope.resolve(["previousMonthLabel"]);
    buffer.write(id10, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n    <a class="');
    var option11 = {escape:1};
    var params12 = [];
    params12.push("month-select");
    option11.params = params12;
    var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 16);
    if(commandRet13 && commandRet13.isBuffer) {
      buffer = commandRet13;
      commandRet13 = undefined
    }
    buffer.write(commandRet13, true);
    buffer.write('"\n       role="button"\n       href="#"\n       tabindex="-1"\n       hidefocus="on"\n       title="');
    var id14 = scope.resolve(["monthSelectLabel"]);
    buffer.write(id14, true);
    buffer.write('">\n        <span>');
    var id15 = scope.resolve(["monthYearLabel"]);
    buffer.write(id15, true);
    buffer.write('</span>\n        <span class="');
    var option16 = {escape:1};
    var params17 = [];
    params17.push("month-select-arrow");
    option16.params = params17;
    var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 23);
    if(commandRet18 && commandRet18.isBuffer) {
      buffer = commandRet18;
      commandRet18 = undefined
    }
    buffer.write(commandRet18, true);
    buffer.write('">x</span>\n    </a>\n    <a class="');
    var option19 = {escape:1};
    var params20 = [];
    params20.push("next-month-btn");
    option19.params = params20;
    var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 25);
    if(commandRet21 && commandRet21.isBuffer) {
      buffer = commandRet21;
      commandRet21 = undefined
    }
    buffer.write(commandRet21, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id22 = scope.resolve(["nextMonthLabel"]);
    buffer.write(id22, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n    <a class="');
    var option23 = {escape:1};
    var params24 = [];
    params24.push("next-year-btn");
    option23.params = params24;
    var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 32);
    if(commandRet25 && commandRet25.isBuffer) {
      buffer = commandRet25;
      commandRet25 = undefined
    }
    buffer.write(commandRet25, true);
    buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
    var id26 = scope.resolve(["nextYearLabel"]);
    buffer.write(id26, true);
    buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
    var option27 = {escape:1};
    var params28 = [];
    params28.push("body");
    option27.params = params28;
    var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 40);
    if(commandRet29 && commandRet29.isBuffer) {
      buffer = commandRet29;
      commandRet29 = undefined
    }
    buffer.write(commandRet29, true);
    buffer.write('">\n    <table class="');
    var option30 = {escape:1};
    var params31 = [];
    params31.push("table");
    option30.params = params31;
    var commandRet32 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 41);
    if(commandRet32 && commandRet32.isBuffer) {
      buffer = commandRet32;
      commandRet32 = undefined
    }
    buffer.write(commandRet32, true);
    buffer.write('" cellspacing="0" role="grid">\n        <thead>\n        <tr role="row">\n            ');
    var option33 = {escape:1};
    var params34 = [];
    var id35 = scope.resolve(["showWeekNumber"]);
    params34.push(id35);
    option33.params = params34;
    option33.fn = function(scope, buffer) {
      buffer.write('\n            <th role="columnheader" class="');
      var option36 = {escape:1};
      var params37 = [];
      params37.push("column-header");
      option36.params = params37;
      var commandRet38 = callCommandUtil(engine, scope, option36, buffer, "getBaseCssClasses", 45);
      if(commandRet38 && commandRet38.isBuffer) {
        buffer = commandRet38;
        commandRet38 = undefined
      }
      buffer.write(commandRet38, true);
      buffer.write(" ");
      var option39 = {escape:1};
      var params40 = [];
      params40.push("week-number-header");
      option39.params = params40;
      var commandRet41 = callCommandUtil(engine, scope, option39, buffer, "getBaseCssClasses", 45);
      if(commandRet41 && commandRet41.isBuffer) {
        buffer = commandRet41;
        commandRet41 = undefined
      }
      buffer.write(commandRet41, true);
      buffer.write('">\n                <span class="');
      var option42 = {escape:1};
      var params43 = [];
      params43.push("column-header-inner");
      option42.params = params43;
      var commandRet44 = callCommandUtil(engine, scope, option42, buffer, "getBaseCssClasses", 46);
      if(commandRet44 && commandRet44.isBuffer) {
        buffer = commandRet44;
        commandRet44 = undefined
      }
      buffer.write(commandRet44, true);
      buffer.write('">x</span>\n            </th>\n            ');
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option33, buffer, 44, payload);
    buffer.write("\n            ");
    var option45 = {escape:1};
    var params46 = [];
    var id47 = scope.resolve(["weekdays"]);
    params46.push(id47);
    option45.params = params46;
    option45.fn = function(scope, buffer) {
      buffer.write('\n            <th role="columnheader" title="');
      var id48 = scope.resolve(["this"]);
      buffer.write(id48, true);
      buffer.write('" class="');
      var option49 = {escape:1};
      var params50 = [];
      params50.push("column-header");
      option49.params = params50;
      var commandRet51 = callCommandUtil(engine, scope, option49, buffer, "getBaseCssClasses", 50);
      if(commandRet51 && commandRet51.isBuffer) {
        buffer = commandRet51;
        commandRet51 = undefined
      }
      buffer.write(commandRet51, true);
      buffer.write('">\n                <span class="');
      var option52 = {escape:1};
      var params53 = [];
      params53.push("column-header-inner");
      option52.params = params53;
      var commandRet54 = callCommandUtil(engine, scope, option52, buffer, "getBaseCssClasses", 51);
      if(commandRet54 && commandRet54.isBuffer) {
        buffer = commandRet54;
        commandRet54 = undefined
      }
      buffer.write(commandRet54, true);
      buffer.write('">\n                    ');
      var id56 = scope.resolve(["xindex"]);
      var id55 = scope.resolve(["veryShortWeekdays", id56]);
      buffer.write(id55, true);
      buffer.write("\n                </span>\n            </th>\n            ");
      return buffer
    };
    buffer = eachCommand.call(engine, scope, option45, buffer, 49, payload);
    buffer.write("\n        </tr>\n        </thead>\n        <tbody>\n        ");
    var option57 = {};
    var commandRet58 = callCommandUtil(engine, scope, option57, buffer, "renderDates", 59);
    if(commandRet58 && commandRet58.isBuffer) {
      buffer = commandRet58;
      commandRet58 = undefined
    }
    buffer.write(commandRet58, false);
    buffer.write("\n        </tbody>\n    </table>\n</div>\n");
    var option59 = {escape:1};
    var params60 = [];
    var id61 = scope.resolve(["showToday"]);
    var exp63 = id61;
    if(!id61) {
      var id62 = scope.resolve(["showClear"]);
      exp63 = id62
    }
    params60.push(exp63);
    option59.params = params60;
    option59.fn = function(scope, buffer) {
      buffer.write('\n<div class="');
      var option64 = {escape:1};
      var params65 = [];
      params65.push("footer");
      option64.params = params65;
      var commandRet66 = callCommandUtil(engine, scope, option64, buffer, "getBaseCssClasses", 64);
      if(commandRet66 && commandRet66.isBuffer) {
        buffer = commandRet66;
        commandRet66 = undefined
      }
      buffer.write(commandRet66, true);
      buffer.write('">\n    <a class="');
      var option67 = {escape:1};
      var params68 = [];
      params68.push("today-btn");
      option67.params = params68;
      var commandRet69 = callCommandUtil(engine, scope, option67, buffer, "getBaseCssClasses", 65);
      if(commandRet69 && commandRet69.isBuffer) {
        buffer = commandRet69;
        commandRet69 = undefined
      }
      buffer.write(commandRet69, true);
      buffer.write('"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       title="');
      var id70 = scope.resolve(["todayTimeLabel"]);
      buffer.write(id70, true);
      buffer.write('">');
      var id71 = scope.resolve(["todayLabel"]);
      buffer.write(id71, true);
      buffer.write('</a>\n    <a class="');
      var option72 = {escape:1};
      var params73 = [];
      params73.push("clear-btn");
      option72.params = params73;
      var commandRet74 = callCommandUtil(engine, scope, option72, buffer, "getBaseCssClasses", 71);
      if(commandRet74 && commandRet74.isBuffer) {
        buffer = commandRet74;
        commandRet74 = undefined
      }
      buffer.write(commandRet74, true);
      buffer.write('"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#">');
      var id75 = scope.resolve(["clearLabel"]);
      buffer.write(id75, true);
      buffer.write("</a>\n</div>\n");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option59, buffer, 63, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});

