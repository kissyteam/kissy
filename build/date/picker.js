/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:49
*/
/*
 Combined modules by KISSY Module Compiler: 

 date/picker/render
 date/picker/year-panel/years-xtpl
 date/picker/year-panel/year-panel-xtpl
 date/picker/year-panel/render
 date/picker/decade-panel/decades-xtpl
 date/picker/decade-panel/decade-panel-xtpl
 date/picker/decade-panel/render
 date/picker/decade-panel/control
 date/picker/year-panel/control
 date/picker/month-panel/months-xtpl
 date/picker/month-panel/month-panel-xtpl
 date/picker/month-panel/render
 date/picker/month-panel/control
 date/picker/control
 date/picker
*/

KISSY.add("date/picker/render", ["date/format", "date/picker-xtpl", "component/control"], function(S, require) {
  var DateTimeFormat = require("date/format"), PickerTpl = require("date/picker-xtpl"), Control = require("component/control");
  var dateRowTplStart = '<tr role="row">';
  var dateRowTplEnd = "</tr>";
  var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
  var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
  var dateTpl = "<a " + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
  var DATE_ROW_COUNT = 6;
  var DATE_COL_COUNT = 7;
  function getIdFromDate(d) {
    return"ks-date-picker-date-" + d.getYear() + "-" + d.getMonth() + "-" + d.getDayOfMonth()
  }
  function isSameDay(one, two) {
    return one.getYear() === two.getYear() && one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth()
  }
  function isSameMonth(one, two) {
    return one.getYear() === two.getYear() && one.getMonth() === two.getMonth()
  }
  function beforeCurrentMonthYear(current, today) {
    if(current.getYear() < today.getYear()) {
      return 1
    }
    return current.getYear() === today.getYear() && current.getMonth() < today.getMonth()
  }
  function afterCurrentMonthYear(current, today) {
    if(current.getYear() > today.getYear()) {
      return 1
    }
    return current.getYear() === today.getYear() && current.getMonth() > today.getMonth()
  }
  function renderDatesCmd() {
    return this.config.view.renderDates()
  }
  return Control.getDefaultRender().extend({getMonthYearLabel:function() {
    var self = this;
    var control = self.control;
    var locale = control.get("locale");
    var value = control.get("value");
    var dateLocale = value.getLocale();
    return(new DateTimeFormat(locale.monthYearFormat, dateLocale)).format(value)
  }, getTodayTimeLabel:function() {
    var self = this;
    var control = self.control;
    var locale = control.get("locale");
    var value = control.get("value");
    var dateLocale = value.getLocale();
    var today = value.clone();
    today.setTime(S.now());
    return(new DateTimeFormat(locale.dateFormat, dateLocale)).format(today)
  }, beforeCreateDom:function(renderData, childrenSelectors, renderCommands) {
    var self = this;
    var control = self.control;
    var locale = control.get("locale");
    var value = control.get("value");
    var dateLocale = value.getLocale();
    S.mix(childrenSelectors, {monthSelectEl:"#ks-date-picker-month-select-{id}", monthSelectContentEl:"#ks-date-picker-month-select-content-{id}", previousMonthBtn:"#ks-date-picker-previous-month-btn-{id}", nextMonthBtn:"#ks-date-picker-next-month-btn-{id}", previousYearBtn:"#ks-date-picker-previous-year-btn-{id}", nextYearBtn:"#ks-date-picker-next-year-btn-{id}", todayBtnEl:"#ks-date-picker-today-btn-{id}", clearBtnEl:"#ks-date-picker-clear-btn-{id}", tbodyEl:"#ks-date-picker-tbody-{id}"});
    var veryShortWeekdays = [];
    var weekDays = [];
    var firstDayOfWeek = value.getFirstDayOfWeek();
    for(var i = 0;i < DATE_COL_COUNT;i++) {
      var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
      veryShortWeekdays[i] = locale.veryShortWeekdays[index];
      weekDays[i] = dateLocale.weekdays[index]
    }
    S.mix(renderData, {monthSelectLabel:locale.monthSelect, monthYearLabel:self.getMonthYearLabel(), previousMonthLabel:locale.previousMonth, nextMonthLabel:locale.nextMonth, previousYearLabel:locale.previousYear, nextYearLabel:locale.nextYear, weekdays:weekDays, veryShortWeekdays:veryShortWeekdays, todayLabel:locale.today, clearLabel:locale.clear, todayTimeLabel:self.getTodayTimeLabel()});
    renderCommands.renderDates = renderDatesCmd
  }, renderDates:function() {
    var self = this, i, j, dateTable = [], current, control = self.control, isClear = control.get("clear"), showWeekNumber = control.get("showWeekNumber"), locale = control.get("locale"), value = control.get("value"), today = value.clone(), cellClass = self.getBaseCssClasses("cell"), weekNumberCellClass = self.getBaseCssClasses("week-number-cell"), dateClass = self.getBaseCssClasses("date"), dateRender = control.get("dateRender"), disabledDate = control.get("disabledDate"), dateLocale = value.getLocale(), 
    dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses("today"), selectedClass = self.getBaseCssClasses("selected-day"), lastMonthDayClass = self.getBaseCssClasses("last-month-cell"), nextMonthDayClass = self.getBaseCssClasses("next-month-btn-day"), disabledClass = self.getBaseCssClasses("disabled-cell");
    today.setTime(S.now());
    var month1 = value.clone();
    month1.set(value.getYear(), value.getMonth(), 1);
    var day = month1.getDayOfWeek();
    var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
    var lastMonth1 = month1.clone();
    lastMonth1.addDayOfMonth(-lastMonthDiffDay);
    var passed = 0;
    for(i = 0;i < DATE_ROW_COUNT;i++) {
      for(j = 0;j < DATE_COL_COUNT;j++) {
        current = lastMonth1;
        if(passed) {
          current = current.clone();
          current.addDayOfMonth(passed)
        }
        dateTable.push(current);
        passed++
      }
    }
    var tableHtml = "";
    passed = 0;
    for(i = 0;i < DATE_ROW_COUNT;i++) {
      var rowHtml = dateRowTplStart;
      if(showWeekNumber) {
        rowHtml += S.substitute(weekNumberCellTpl, {cls:weekNumberCellClass, content:dateTable[passed].getWeekOfYear()})
      }
      for(j = 0;j < DATE_COL_COUNT;j++) {
        current = dateTable[passed];
        var cls = cellClass;
        var disabled = false;
        var selected = false;
        if(isSameDay(current, today)) {
          cls += " " + todayClass
        }
        if(!isClear && isSameDay(current, value)) {
          cls += " " + selectedClass;
          selected = true
        }
        if(beforeCurrentMonthYear(current, value)) {
          cls += " " + lastMonthDayClass
        }
        if(afterCurrentMonthYear(current, value)) {
          cls += " " + nextMonthDayClass
        }
        if(disabledDate && disabledDate(current, value)) {
          cls += " " + disabledClass;
          disabled = true
        }
        var dateHtml = "";
        if(!(dateRender && (dateHtml = dateRender(current, value)))) {
          dateHtml = S.substitute(dateTpl, {cls:dateClass, id:getIdFromDate(current), selected:selected, disabled:disabled, content:current.getDayOfMonth()})
        }
        rowHtml += S.substitute(dateCellTpl, {cls:cls, index:passed, title:dateFormatter.format(current), content:dateHtml});
        passed++
      }
      tableHtml += rowHtml + dateRowTplEnd
    }
    control.dateTable = dateTable;
    return tableHtml
  }, createDom:function() {
    this.$el.attr("aria-activedescendant", getIdFromDate(this.control.get("value")))
  }, _onSetClear:function(v) {
    var control = this.control;
    var value = control.get("value");
    var selectedCls = this.getBaseCssClasses("selected-day");
    var id = getIdFromDate(value);
    var currentA = this.$("#" + id);
    if(v) {
      currentA.parent().removeClass(selectedCls);
      currentA.attr("aria-selected", false);
      this.$el.attr("aria-activedescendant", "")
    }else {
      currentA.parent().addClass(selectedCls);
      currentA.attr("aria-selected", true);
      this.$el.attr("aria-activedescendant", id)
    }
  }, _onSetValue:function(value, e) {
    var control = this.control;
    var preValue = e.prevVal;
    if(isSameMonth(preValue, value)) {
      var disabledDate = control.get("disabledDate");
      var selectedCls = this.getBaseCssClasses("selected-day");
      var prevA = this.$("#" + getIdFromDate(preValue));
      prevA.parent().removeClass(selectedCls);
      prevA.attr("aria-selected", false);
      if(!(disabledDate && disabledDate(value, value))) {
        var currentA = this.$("#" + getIdFromDate(value));
        currentA.parent().addClass(selectedCls);
        currentA.attr("aria-selected", true)
      }
    }else {
      var tbodyEl = control.get("tbodyEl");
      var monthSelectContentEl = control.get("monthSelectContentEl");
      var todayBtnEl = control.get("todayBtnEl");
      monthSelectContentEl.html(this.getMonthYearLabel());
      todayBtnEl.attr("title", this.getTodayTimeLabel());
      tbodyEl.html(this.renderDates())
    }
    this.$el.attr("aria-activedescendant", getIdFromDate(value))
  }}, {name:"date-picker-render", ATTRS:{contentTpl:{value:PickerTpl}}})
});
KISSY.add("date/picker/year-panel/years-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += "";
    var option0 = {};
    var params1 = [];
    var id2 = scope.resolve(["years"]);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function(scope) {
      var buffer = "";
      buffer += '\n<tr role="row">\n    ';
      var option3 = {};
      var params4 = [];
      var id6 = scope.resolve(["xindex"]);
      var id5 = scope.resolve("years." + id6 + "");
      params4.push(id5);
      option3.params = params4;
      option3.fn = function(scope) {
        var buffer = "";
        buffer += '\n    <td role="gridcell"\n        title="';
        var id7 = scope.resolve(["title"]);
        buffer += escapeHtml(id7);
        buffer += '"\n        class="';
        var option9 = {};
        var params10 = [];
        params10.push("cell");
        option9.params = params10;
        var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 6);
        buffer += escapeHtml(id8);
        buffer += "\n        ";
        var option11 = {};
        var params12 = [];
        var id13 = scope.resolve(["content"]);
        var id14 = scope.resolve(["year"]);
        params12.push(id13 === id14);
        option11.params = params12;
        option11.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var option16 = {};
          var params17 = [];
          params17.push("selected-cell");
          option16.params = params17;
          var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 8);
          buffer += escapeHtml(id15);
          buffer += "\n        ";
          return buffer
        };
        buffer += ifCommand.call(engine, scope, option11, payload);
        buffer += "\n        ";
        var option18 = {};
        var params19 = [];
        var id20 = scope.resolve(["content"]);
        var id21 = scope.resolve(["startYear"]);
        params19.push(id20 < id21);
        option18.params = params19;
        option18.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var option23 = {};
          var params24 = [];
          params24.push("last-decade-cell");
          option23.params = params24;
          var id22 = callCommandUtil(engine, scope, option23, "getBaseCssClasses", 11);
          buffer += escapeHtml(id22);
          buffer += "\n        ";
          return buffer
        };
        buffer += ifCommand.call(engine, scope, option18, payload);
        buffer += "\n        ";
        var option25 = {};
        var params26 = [];
        var id27 = scope.resolve(["content"]);
        var id28 = scope.resolve(["endYear"]);
        params26.push(id27 > id28);
        option25.params = params26;
        option25.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var option30 = {};
          var params31 = [];
          params31.push("next-decade-cell");
          option30.params = params31;
          var id29 = callCommandUtil(engine, scope, option30, "getBaseCssClasses", 14);
          buffer += escapeHtml(id29);
          buffer += "\n        ";
          return buffer
        };
        buffer += ifCommand.call(engine, scope, option25, payload);
        buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
        var option33 = {};
        var params34 = [];
        params34.push("year");
        option33.params = params34;
        var id32 = callCommandUtil(engine, scope, option33, "getBaseCssClasses", 20);
        buffer += escapeHtml(id32);
        buffer += '">\n            ';
        var id35 = scope.resolve(["content"]);
        buffer += escapeHtml(id35);
        buffer += "\n        </a>\n    </td>\n    ";
        return buffer
      };
      buffer += eachCommand.call(engine, scope, option3, payload);
      buffer += "\n</tr>\n";
      return buffer
    };
    buffer += eachCommand.call(engine, scope, option0, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("date/picker/year-panel/year-panel-xtpl", ["date/picker/year-panel/years-xtpl"], function(S, require, exports, module) {
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
    buffer += '">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-';
    var id3 = scope.resolve(["id"]);
    buffer += escapeHtml(id3);
    buffer += '"\n       class="';
    var option5 = {};
    var params6 = [];
    params6.push("prev-decade-btn");
    option5.params = params6;
    var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
    buffer += escapeHtml(id4);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id7 = scope.resolve(["previousDecadeLabel"]);
    buffer += escapeHtml(id7);
    buffer += '"\n       hidefocus="on">\n    </a>\n\n    <a class="';
    var option9 = {};
    var params10 = [];
    params10.push("decade-select");
    option9.params = params10;
    var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 10);
    buffer += escapeHtml(id8);
    buffer += '"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="';
    var id11 = scope.resolve(["decadeSelectLabel"]);
    buffer += escapeHtml(id11);
    buffer += '"\n       id="ks-date-picker-year-panel-decade-select-';
    var id12 = scope.resolve(["id"]);
    buffer += escapeHtml(id12);
    buffer += '">\n            <span id="ks-date-picker-year-panel-decade-select-content-';
    var id13 = scope.resolve(["id"]);
    buffer += escapeHtml(id13);
    buffer += '">\n                ';
    var id14 = scope.resolve(["startYear"]);
    buffer += escapeHtml(id14);
    buffer += "-";
    var id15 = scope.resolve(["endYear"]);
    buffer += escapeHtml(id15);
    buffer += '\n            </span>\n        <span class="';
    var option17 = {};
    var params18 = [];
    params18.push("decade-select-arrow");
    option17.params = params18;
    var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 19);
    buffer += escapeHtml(id16);
    buffer += '">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-';
    var id19 = scope.resolve(["id"]);
    buffer += escapeHtml(id19);
    buffer += '"\n       class="';
    var option21 = {};
    var params22 = [];
    params22.push("next-decade-btn");
    option21.params = params22;
    var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 23);
    buffer += escapeHtml(id20);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id23 = scope.resolve(["nextDecadeLabel"]);
    buffer += escapeHtml(id23);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var option25 = {};
    var params26 = [];
    params26.push("body");
    option25.params = params26;
    var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 30);
    buffer += escapeHtml(id24);
    buffer += '">\n    <table class="';
    var option28 = {};
    var params29 = [];
    params29.push("table");
    option28.params = params29;
    var id27 = callCommandUtil(engine, scope, option28, "getBaseCssClasses", 31);
    buffer += escapeHtml(id27);
    buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-';
    var id30 = scope.resolve(["id"]);
    buffer += escapeHtml(id30);
    buffer += '">\n        ';
    var option32 = {};
    var params33 = [];
    params33.push("date/picker/year-panel/years-xtpl");
    option32.params = params33;
    if(moduleWrap) {
      require("date/picker/year-panel/years-xtpl");
      option32.params[0] = moduleWrap.resolveByName(option32.params[0])
    }
    var id31 = includeCommand.call(engine, scope, option32, payload);
    if(id31 || id31 === 0) {
      buffer += id31
    }
    buffer += "\n        </tbody>\n    </table>\n</div>";
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("date/picker/year-panel/render", ["date/format", "component/control", "./years-xtpl", "./year-panel-xtpl"], function(S, require) {
  var DateFormat = require("date/format"), Control = require("component/control"), YearsTpl = require("./years-xtpl"), YearPanelTpl = require("./year-panel-xtpl");
  function prepareYears(control) {
    var value = control.get("value");
    var currentYear = value.getYear();
    var startYear = parseInt(currentYear / 10, 10) * 10;
    var preYear = startYear - 1;
    var current = value.clone();
    var locale = control.get("locale");
    var yearFormat = locale.yearFormat;
    var dateLocale = value.getLocale();
    var dateFormatter = new DateFormat(yearFormat, dateLocale);
    var years = [];
    var index = 0;
    for(var i = 0;i < 3;i++) {
      years[i] = [];
      for(var j = 0;j < 4;j++) {
        current.setYear(preYear + index);
        years[i][j] = {content:preYear + index, title:dateFormatter.format(current)};
        index++
      }
    }
    control.years = years;
    return years
  }
  return Control.getDefaultRender().extend({beforeCreateDom:function(renderData, childrenSelectors) {
    var control = this.control;
    var value = control.get("value");
    var currentYear = value.getYear();
    var startYear = parseInt(currentYear / 10, 10) * 10;
    var endYear = startYear + 9;
    var locale = control.get("locale");
    S.mix(renderData, {decadeSelectLabel:locale.decadeSelect, years:prepareYears(control), startYear:startYear, endYear:endYear, year:value.getYear(), previousDecadeLabel:locale.previousDecade, nextDecadeLabel:locale.nextDecade});
    S.mix(childrenSelectors, {tbodyEl:"#ks-date-picker-year-panel-tbody-{id}", previousDecadeBtn:"#ks-date-picker-year-panel-previous-decade-btn-{id}", decadeSelectEl:"#ks-date-picker-year-panel-decade-select-{id}", decadeSelectContentEl:"#ks-date-picker-year-panel-decade-select-content-{id}", nextDecadeBtn:"#ks-date-picker-year-panel-next-decade-btn-{id}"})
  }, _onSetValue:function(value) {
    var control = this.control;
    var currentYear = value.getYear();
    var startYear = parseInt(currentYear / 10, 10) * 10;
    var endYear = startYear + 9;
    S.mix(this.renderData, {startYear:startYear, endYear:endYear, years:prepareYears(control), year:value.getYear()});
    control.get("tbodyEl").html(this.renderTpl(YearsTpl));
    control.get("decadeSelectContentEl").html(startYear + "-" + endYear)
  }}, {ATTRS:{contentTpl:{value:YearPanelTpl}}})
});
KISSY.add("date/picker/decade-panel/decades-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += "";
    var option0 = {};
    var params1 = [];
    var id2 = scope.resolve(["decades"]);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function(scope) {
      var buffer = "";
      buffer += '\n<tr role="row">\n    ';
      var option3 = {};
      var params4 = [];
      var id6 = scope.resolve(["xindex"]);
      var id5 = scope.resolve("decades." + id6 + "");
      params4.push(id5);
      option3.params = params4;
      option3.fn = function(scope) {
        var buffer = "";
        buffer += '\n    <td role="gridcell"\n        class="';
        var option8 = {};
        var params9 = [];
        params9.push("cell");
        option8.params = params9;
        var id7 = callCommandUtil(engine, scope, option8, "getBaseCssClasses", 5);
        buffer += escapeHtml(id7);
        buffer += "\n        ";
        var option10 = {};
        var params11 = [];
        var id12 = scope.resolve(["startDecade"]);
        var id13 = scope.resolve(["year"]);
        var id14 = scope.resolve(["year"]);
        var id15 = scope.resolve(["endDecade"]);
        params11.push(id12 <= id13 && id14 <= id15);
        option10.params = params11;
        option10.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var option17 = {};
          var params18 = [];
          params18.push("selected-cell");
          option17.params = params18;
          var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 7);
          buffer += escapeHtml(id16);
          buffer += "\n        ";
          return buffer
        };
        buffer += ifCommand.call(engine, scope, option10, payload);
        buffer += "\n        ";
        var option19 = {};
        var params20 = [];
        var id21 = scope.resolve(["startDecade"]);
        var id22 = scope.resolve(["startYear"]);
        params20.push(id21 < id22);
        option19.params = params20;
        option19.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var option24 = {};
          var params25 = [];
          params25.push("last-century-cell");
          option24.params = params25;
          var id23 = callCommandUtil(engine, scope, option24, "getBaseCssClasses", 10);
          buffer += escapeHtml(id23);
          buffer += "\n        ";
          return buffer
        };
        buffer += ifCommand.call(engine, scope, option19, payload);
        buffer += "\n        ";
        var option26 = {};
        var params27 = [];
        var id28 = scope.resolve(["endDecade"]);
        var id29 = scope.resolve(["endYear"]);
        params27.push(id28 > id29);
        option26.params = params27;
        option26.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var option31 = {};
          var params32 = [];
          params32.push("next-century-cell");
          option31.params = params32;
          var id30 = callCommandUtil(engine, scope, option31, "getBaseCssClasses", 13);
          buffer += escapeHtml(id30);
          buffer += "\n        ";
          return buffer
        };
        buffer += ifCommand.call(engine, scope, option26, payload);
        buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
        var option34 = {};
        var params35 = [];
        params35.push("decade");
        option34.params = params35;
        var id33 = callCommandUtil(engine, scope, option34, "getBaseCssClasses", 19);
        buffer += escapeHtml(id33);
        buffer += '">\n            ';
        var id36 = scope.resolve(["startDecade"]);
        buffer += escapeHtml(id36);
        buffer += "-";
        var id37 = scope.resolve(["endDecade"]);
        buffer += escapeHtml(id37);
        buffer += "\n        </a>\n    </td>\n    ";
        return buffer
      };
      buffer += eachCommand.call(engine, scope, option3, payload);
      buffer += "\n</tr>\n";
      return buffer
    };
    buffer += eachCommand.call(engine, scope, option0, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("date/picker/decade-panel/decade-panel-xtpl", ["date/picker/decade-panel/decades-xtpl"], function(S, require, exports, module) {
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
    buffer += '">\n    <a id="ks-date-picker-decade-panel-previous-century-btn-';
    var id3 = scope.resolve(["id"]);
    buffer += escapeHtml(id3);
    buffer += '"\n       class="';
    var option5 = {};
    var params6 = [];
    params6.push("prev-century-btn");
    option5.params = params6;
    var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
    buffer += escapeHtml(id4);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id7 = scope.resolve(["previousCenturyLabel"]);
    buffer += escapeHtml(id7);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <div class="';
    var option9 = {};
    var params10 = [];
    params10.push("century");
    option9.params = params10;
    var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 9);
    buffer += escapeHtml(id8);
    buffer += '"\n         id="ks-date-picker-decade-panel-century-';
    var id11 = scope.resolve(["id"]);
    buffer += escapeHtml(id11);
    buffer += '">\n                ';
    var id12 = scope.resolve(["startYear"]);
    buffer += escapeHtml(id12);
    buffer += "-";
    var id13 = scope.resolve(["endYear"]);
    buffer += escapeHtml(id13);
    buffer += '\n    </div>\n    <a id="ks-date-picker-decade-panel-next-century-btn-';
    var id14 = scope.resolve(["id"]);
    buffer += escapeHtml(id14);
    buffer += '"\n       class="';
    var option16 = {};
    var params17 = [];
    params17.push("next-century-btn");
    option16.params = params17;
    var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 14);
    buffer += escapeHtml(id15);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id18 = scope.resolve(["nextCenturyLabel"]);
    buffer += escapeHtml(id18);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var option20 = {};
    var params21 = [];
    params21.push("body");
    option20.params = params21;
    var id19 = callCommandUtil(engine, scope, option20, "getBaseCssClasses", 21);
    buffer += escapeHtml(id19);
    buffer += '">\n    <table class="';
    var option23 = {};
    var params24 = [];
    params24.push("table");
    option23.params = params24;
    var id22 = callCommandUtil(engine, scope, option23, "getBaseCssClasses", 22);
    buffer += escapeHtml(id22);
    buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-decade-panel-tbody-';
    var id25 = scope.resolve(["id"]);
    buffer += escapeHtml(id25);
    buffer += '">\n        ';
    var option27 = {};
    var params28 = [];
    params28.push("date/picker/decade-panel/decades-xtpl");
    option27.params = params28;
    if(moduleWrap) {
      require("date/picker/decade-panel/decades-xtpl");
      option27.params[0] = moduleWrap.resolveByName(option27.params[0])
    }
    var id26 = includeCommand.call(engine, scope, option27, payload);
    if(id26 || id26 === 0) {
      buffer += id26
    }
    buffer += "\n        </tbody>\n    </table>\n</div>";
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("date/picker/decade-panel/render", ["component/control", "./decade-panel-xtpl", "./decades-xtpl"], function(S, require) {
  var Control = require("component/control"), DecadePanelTpl = require("./decade-panel-xtpl"), MonthsTpl = require("./decades-xtpl");
  function prepareYears(control, view) {
    var value = control.get("value");
    var currentYear = value.getYear();
    var startYear = parseInt(currentYear / 100, 10) * 100;
    var preYear = startYear - 10;
    var endYear = startYear + 99;
    var decades = [];
    var index = 0;
    for(var i = 0;i < 3;i++) {
      decades[i] = [];
      for(var j = 0;j < 4;j++) {
        decades[i][j] = {startDecade:preYear + index * 10, endDecade:preYear + index * 10 + 9};
        index++
      }
    }
    control.decades = decades;
    S.mix(view.renderData, {startYear:startYear, endYear:endYear, year:currentYear, decades:decades})
  }
  return Control.getDefaultRender().extend({beforeCreateDom:function(renderData, childrenSelectors) {
    var control = this.control;
    var locale = control.get("locale");
    prepareYears(control, this);
    S.mix(renderData, {previousCenturyLabel:locale.previousCentury, nextCenturyLabel:locale.nextCentury});
    S.mix(childrenSelectors, {tbodyEl:"#ks-date-picker-decade-panel-tbody-{id}", previousCenturyBtn:"#ks-date-picker-decade-panel-previous-century-btn-{id}", centuryEl:"#ks-date-picker-decade-panel-century-{id}", nextCenturyBtn:"#ks-date-picker-decade-panel-next-century-btn-{id}"})
  }, _onSetValue:function() {
    var control = this.control;
    prepareYears(control, this);
    var startYear = this.renderData.startYear;
    var endYear = this.renderData.endYear;
    control.get("tbodyEl").html(this.renderTpl(MonthsTpl));
    control.get("centuryEl").html(startYear + "-" + endYear)
  }}, {ATTRS:{contentTpl:{value:DecadePanelTpl}}})
});
KISSY.add("date/picker/decade-panel/control", ["node", "component/control", "./render"], function(S, require) {
  var Node = require("node"), Control = require("component/control"), CenturyPanelRender = require("./render");
  var tap = Node.Gesture.tap;
  var $ = Node.all;
  function goYear(self, direction) {
    var next = self.get("value").clone();
    next.addYear(direction);
    self.set("value", next)
  }
  function nextCentury(e) {
    e.preventDefault();
    goYear(this, 100)
  }
  function prevCentury(e) {
    e.preventDefault();
    goYear(this, -100)
  }
  function chooseCell(e) {
    e.preventDefault();
    var td = $(e.currentTarget);
    var tr = td.parent();
    var tdIndex = td.index();
    var trIndex = tr.index();
    var value = this.get("value").clone();
    var y = value.getYear() % 10;
    value.setYear(this.decades[trIndex][tdIndex].startDecade + y);
    this.set("value", value);
    this.fire("select", {value:value})
  }
  return Control.extend({bindUI:function() {
    var self = this;
    self.get("nextCenturyBtn").on(tap, nextCentury, self);
    self.get("previousCenturyBtn").on(tap, prevCentury, self);
    self.get("tbodyEl").delegate(tap, "." + self.view.getBaseCssClass("cell"), chooseCell, self)
  }}, {xclass:"date-picker-decade-panel", ATTRS:{focusable:{value:false}, value:{view:1}, xrender:{value:CenturyPanelRender}}})
});
KISSY.add("date/picker/year-panel/control", ["node", "component/control", "./render", "../decade-panel/control"], function(S, require) {
  var Node = require("node"), Control = require("component/control"), DecadePanelRender = require("./render"), DecadePanel = require("../decade-panel/control");
  var tap = Node.Gesture.tap;
  var $ = Node.all;
  function goYear(self, direction) {
    var next = self.get("value").clone();
    next.addYear(direction);
    self.set("value", next)
  }
  function nextDecade(e) {
    e.preventDefault();
    goYear(this, 10)
  }
  function prevDecade(e) {
    e.preventDefault();
    goYear(this, -10)
  }
  function chooseCell(e) {
    e.preventDefault();
    var td = $(e.currentTarget);
    var tr = td.parent();
    var tdIndex = td.index();
    var trIndex = tr.index();
    var value = this.get("value").clone();
    value.setYear(this.years[trIndex][tdIndex].content);
    this.set("value", value);
    this.fire("select", {value:value})
  }
  function showDecadePanel(e) {
    e.preventDefault();
    var decadePanel = this.get("decadePanel");
    decadePanel.set("value", this.get("value"));
    decadePanel.show()
  }
  function setUpDecadePanel() {
    var self = this;
    var decadePanel = new DecadePanel({locale:this.get("locale"), render:self.get("render")});
    decadePanel.on("select", onDecadePanelSelect, self);
    return decadePanel
  }
  function onDecadePanelSelect(e) {
    this.set("value", e.value);
    this.get("decadePanel").hide()
  }
  return Control.extend({bindUI:function() {
    var self = this;
    self.get("nextDecadeBtn").on(tap, nextDecade, self);
    self.get("previousDecadeBtn").on(tap, prevDecade, self);
    self.get("tbodyEl").delegate(tap, "." + self.view.getBaseCssClass("cell"), chooseCell, self);
    self.get("decadeSelectEl").on(tap, showDecadePanel, self)
  }}, {xclass:"date-picker-year-panel", ATTRS:{focusable:{value:false}, value:{view:1}, decadePanel:{valueFn:setUpDecadePanel}, xrender:{value:DecadePanelRender}}})
});
KISSY.add("date/picker/month-panel/months-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += "";
    var option0 = {};
    var params1 = [];
    var id2 = scope.resolve(["months"]);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function(scope) {
      var buffer = "";
      buffer += '\n<tr role="row">\n    ';
      var option3 = {};
      var params4 = [];
      var id6 = scope.resolve(["xindex"]);
      var id5 = scope.resolve("months." + id6 + "");
      params4.push(id5);
      option3.params = params4;
      option3.fn = function(scope) {
        var buffer = "";
        buffer += '\n    <td role="gridcell"\n        title="';
        var id7 = scope.resolve(["title"]);
        buffer += escapeHtml(id7);
        buffer += '"\n        class="';
        var option9 = {};
        var params10 = [];
        params10.push("cell");
        option9.params = params10;
        var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 6);
        buffer += escapeHtml(id8);
        buffer += "\n        ";
        var option11 = {};
        var params12 = [];
        var id13 = scope.resolve(["month"]);
        var id14 = scope.resolve(["value"]);
        params12.push(id13 === id14);
        option11.params = params12;
        option11.fn = function(scope) {
          var buffer = "";
          buffer += "\n        ";
          var option16 = {};
          var params17 = [];
          params17.push("selected-cell");
          option16.params = params17;
          var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 8);
          buffer += escapeHtml(id15);
          buffer += "\n        ";
          return buffer
        };
        buffer += ifCommand.call(engine, scope, option11, payload);
        buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
        var option19 = {};
        var params20 = [];
        params20.push("month");
        option19.params = params20;
        var id18 = callCommandUtil(engine, scope, option19, "getBaseCssClasses", 14);
        buffer += escapeHtml(id18);
        buffer += '">\n            ';
        var id21 = scope.resolve(["content"]);
        buffer += escapeHtml(id21);
        buffer += "\n        </a>\n    </td>\n    ";
        return buffer
      };
      buffer += eachCommand.call(engine, scope, option3, payload);
      buffer += "\n</tr>\n";
      return buffer
    };
    buffer += eachCommand.call(engine, scope, option0, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("date/picker/month-panel/month-panel-xtpl", ["date/picker/month-panel/months-xtpl"], function(S, require, exports, module) {
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
    buffer += '">\n    <a id="ks-date-picker-month-panel-previous-year-btn-';
    var id3 = scope.resolve(["id"]);
    buffer += escapeHtml(id3);
    buffer += '"\n       class="';
    var option5 = {};
    var params6 = [];
    params6.push("prev-year-btn");
    option5.params = params6;
    var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
    buffer += escapeHtml(id4);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id7 = scope.resolve(["previousYearLabel"]);
    buffer += escapeHtml(id7);
    buffer += '"\n       hidefocus="on">\n    </a>\n\n\n        <a class="';
    var option9 = {};
    var params10 = [];
    params10.push("year-select");
    option9.params = params10;
    var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 11);
    buffer += escapeHtml(id8);
    buffer += '"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="';
    var id11 = scope.resolve(["yearSelectLabel"]);
    buffer += escapeHtml(id11);
    buffer += '"\n           id="ks-date-picker-month-panel-year-select-';
    var id12 = scope.resolve(["id"]);
    buffer += escapeHtml(id12);
    buffer += '">\n            <span id="ks-date-picker-month-panel-year-select-content-';
    var id13 = scope.resolve(["id"]);
    buffer += escapeHtml(id13);
    buffer += '">';
    var id14 = scope.resolve(["year"]);
    buffer += escapeHtml(id14);
    buffer += '</span>\n            <span class="';
    var option16 = {};
    var params17 = [];
    params17.push("year-select-arrow");
    option16.params = params17;
    var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 18);
    buffer += escapeHtml(id15);
    buffer += '">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-';
    var id18 = scope.resolve(["id"]);
    buffer += escapeHtml(id18);
    buffer += '"\n       class="';
    var option20 = {};
    var params21 = [];
    params21.push("next-year-btn");
    option20.params = params21;
    var id19 = callCommandUtil(engine, scope, option20, "getBaseCssClasses", 22);
    buffer += escapeHtml(id19);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id22 = scope.resolve(["nextYearLabel"]);
    buffer += escapeHtml(id22);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var option24 = {};
    var params25 = [];
    params25.push("body");
    option24.params = params25;
    var id23 = callCommandUtil(engine, scope, option24, "getBaseCssClasses", 29);
    buffer += escapeHtml(id23);
    buffer += '">\n    <table class="';
    var option27 = {};
    var params28 = [];
    params28.push("table");
    option27.params = params28;
    var id26 = callCommandUtil(engine, scope, option27, "getBaseCssClasses", 30);
    buffer += escapeHtml(id26);
    buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-';
    var id29 = scope.resolve(["id"]);
    buffer += escapeHtml(id29);
    buffer += '">\n        ';
    var option31 = {};
    var params32 = [];
    params32.push("date/picker/month-panel/months-xtpl");
    option31.params = params32;
    if(moduleWrap) {
      require("date/picker/month-panel/months-xtpl");
      option31.params[0] = moduleWrap.resolveByName(option31.params[0])
    }
    var id30 = includeCommand.call(engine, scope, option31, payload);
    if(id30 || id30 === 0) {
      buffer += id30
    }
    buffer += "\n        </tbody>\n    </table>\n</div>";
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("date/picker/month-panel/render", ["date/format", "component/control", "./months-xtpl", "./month-panel-xtpl"], function(S, require) {
  var DateFormat = require("date/format"), Control = require("component/control"), MonthsTpl = require("./months-xtpl"), MonthPanelTpl = require("./month-panel-xtpl");
  function prepareMonths(control) {
    var value = control.get("value");
    var currentMonth = value.getMonth();
    var current = value.clone();
    var locale = control.get("locale");
    var monthYearFormat = locale.monthYearFormat;
    var dateLocale = value.getLocale();
    var dateFormatter = new DateFormat(monthYearFormat, dateLocale);
    var months = [];
    var shortMonths = dateLocale.shortMonths;
    var index = 0;
    for(var i = 0;i < 3;i++) {
      months[i] = [];
      for(var j = 0;j < 4;j++) {
        current.setMonth(index);
        months[i][j] = {value:index, content:shortMonths[index], title:dateFormatter.format(current)};
        index++
      }
    }
    S.mix(control.view.renderData, {months:months, year:value.getYear(), month:currentMonth});
    control.months = months;
    return months
  }
  return Control.getDefaultRender().extend({beforeCreateDom:function(renderData, childrenSelectors) {
    var control = this.control;
    var locale = control.get("locale");
    S.mix(renderData, {yearSelectLabel:locale.yearSelect, previousYearLabel:locale.previousYear, nextYearLabel:locale.nextYear});
    S.mix(childrenSelectors, {tbodyEl:"#ks-date-picker-month-panel-tbody-{id}", previousYearBtn:"#ks-date-picker-month-panel-previous-year-btn-{id}", yearSelectEl:"#ks-date-picker-month-panel-year-select-{id}", yearSelectContentEl:"#ks-date-picker-month-panel-year-select-content-{id}", nextYearBtn:"#ks-date-picker-month-panel-next-year-btn-{id}"});
    prepareMonths(control)
  }, _onSetValue:function(value) {
    var control = this.control;
    prepareMonths(control);
    control.get("tbodyEl").html(this.renderTpl(MonthsTpl));
    control.get("yearSelectContentEl").html(value.getYear())
  }}, {ATTRS:{contentTpl:{value:MonthPanelTpl}}})
});
KISSY.add("date/picker/month-panel/control", ["node", "component/control", "../year-panel/control", "./render"], function(S, require) {
  var Node = require("node"), Control = require("component/control"), YearPanel = require("../year-panel/control"), MonthPanelRender = require("./render");
  var tap = Node.Gesture.tap;
  var $ = Node.all;
  function goYear(self, direction) {
    var next = self.get("value").clone();
    next.addYear(direction);
    self.set("value", next)
  }
  function nextYear(e) {
    e.preventDefault();
    goYear(this, 1)
  }
  function prevYear(e) {
    e.preventDefault();
    goYear(this, -1)
  }
  function chooseCell(e) {
    e.preventDefault();
    var td = $(e.currentTarget);
    var tr = td.parent();
    var tdIndex = td.index();
    var trIndex = tr.index();
    var value = this.get("value").clone();
    value.setMonth(trIndex * 4 + tdIndex);
    this.fire("select", {value:value})
  }
  function showYearPanel(e) {
    e.preventDefault();
    var yearPanel = this.get("yearPanel");
    yearPanel.set("value", this.get("value"));
    yearPanel.show()
  }
  function setUpYearPanel() {
    var self = this;
    var yearPanel = new YearPanel({locale:this.get("locale"), render:self.get("render")});
    yearPanel.on("select", onYearPanelSelect, self);
    return yearPanel
  }
  function onYearPanelSelect(e) {
    this.set("value", e.value);
    this.get("yearPanel").hide()
  }
  return Control.extend({bindUI:function() {
    var self = this;
    self.get("nextYearBtn").on(tap, nextYear, self);
    self.get("previousYearBtn").on(tap, prevYear, self);
    self.get("tbodyEl").delegate(tap, "." + self.view.getBaseCssClass("cell"), chooseCell, self);
    self.get("yearSelectEl").on(tap, showYearPanel, self)
  }}, {xclass:"date-picker-month-panel", ATTRS:{focusable:{value:false}, value:{view:1}, yearPanel:{valueFn:setUpYearPanel}, xrender:{value:MonthPanelRender}}})
});
KISSY.add("date/picker/control", ["node", "date/gregorian", "i18n!date/picker", "component/control", "./render", "./month-panel/control"], function(S, require) {
  var Node = require("node"), GregorianCalendar = require("date/gregorian"), locale = require("i18n!date/picker"), Control = require("component/control"), PickerRender = require("./render"), MonthPanel = require("./month-panel/control");
  var tap = Node.Gesture.tap;
  var $ = Node.all;
  var KeyCode = Node.KeyCode;
  function goStartMonth(self) {
    var next = self.get("value").clone();
    next.setDayOfMonth(1);
    self.set("value", next)
  }
  function goEndMonth(self) {
    var next = self.get("value").clone();
    next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
    self.set("value", next)
  }
  function goMonth(self, direction) {
    var next = self.get("value").clone();
    next.addMonth(direction);
    self.set("value", next)
  }
  function goYear(self, direction) {
    var next = self.get("value").clone();
    next.addYear(direction);
    self.set("value", next)
  }
  function goWeek(self, direction) {
    var next = self.get("value").clone();
    next.addWeekOfYear(direction);
    self.set("value", next)
  }
  function goDay(self, direction) {
    var next = self.get("value").clone();
    next.addDayOfMonth(direction);
    self.set("value", next)
  }
  function nextMonth(e) {
    e.preventDefault();
    goMonth(this, 1)
  }
  function prevMonth(e) {
    e.preventDefault();
    goMonth(this, -1)
  }
  function nextYear(e) {
    e.preventDefault();
    goYear(this, 1)
  }
  function prevYear(e) {
    e.preventDefault();
    goYear(this, -1)
  }
  function chooseCell(e) {
    var self = this;
    self.set("clear", false);
    var disabledDate = self.get("disabledDate");
    e.preventDefault();
    var td = $(e.currentTarget);
    var value = self.dateTable[parseInt(td.attr("data-index"), 10)];
    if(disabledDate && disabledDate(value, self.get("value"))) {
      return
    }
    setTimeout(function() {
      self.set("value", value);
      self.fire("select", {value:value})
    }, 0)
  }
  function showMonthPanel(e) {
    e.preventDefault();
    var monthPanel = this.get("monthPanel");
    monthPanel.set("value", this.get("value"));
    monthPanel.show()
  }
  function setUpMonthPanel() {
    var self = this;
    var monthPanel = new MonthPanel({locale:this.get("locale"), render:self.get("el")});
    monthPanel.on("select", onMonthPanelSelect, self);
    return monthPanel
  }
  function onMonthPanelSelect(e) {
    this.set("value", e.value);
    this.get("monthPanel").hide()
  }
  function chooseToday(e) {
    e.preventDefault();
    this.set("clear", false);
    var today = this.get("value").clone();
    today.setTime(S.now());
    this.set("value", today)
  }
  function toggleClear() {
    var self = this, v = !self.get("clear");
    if(!v) {
      var value = self.get("value");
      value.setDayOfMonth(1);
      self.set("clear", false)
    }else {
      self.set("clear", true)
    }
  }
  function onClearClick(e) {
    e.preventDefault();
    if(!this.get("clear")) {
      toggleClear.call(this)
    }
    this.fire("select", {value:null})
  }
  return Control.extend({bindUI:function() {
    var self = this;
    self.get("nextMonthBtn").on(tap, nextMonth, self);
    self.get("previousMonthBtn").on(tap, prevMonth, self);
    self.get("nextYearBtn").on(tap, nextYear, self);
    self.get("previousYearBtn").on(tap, prevYear, self);
    self.get("tbodyEl").delegate(tap, "." + self.view.getBaseCssClass("cell"), chooseCell, self);
    self.get("monthSelectEl").on(tap, showMonthPanel, self);
    self.get("todayBtnEl").on(tap, chooseToday, self);
    self.get("clearBtnEl").on(tap, onClearClick, self)
  }, handleKeyDownInternal:function(e) {
    var self = this;
    var keyCode = e.keyCode;
    var ctrlKey = e.ctrlKey;
    switch(keyCode) {
      case KeyCode.SPACE:
        self.set("clear", !self.get("clear"));
        return true
    }
    if(this.get("clear")) {
      switch(keyCode) {
        case KeyCode.DOWN:
        ;
        case KeyCode.UP:
        ;
        case KeyCode.LEFT:
        ;
        case KeyCode.RIGHT:
          if(!ctrlKey) {
            toggleClear.call(self)
          }
          return true;
        case KeyCode.HOME:
          toggleClear.call(self);
          goStartMonth(self);
          return true;
        case KeyCode.END:
          toggleClear.call(self);
          goEndMonth(self);
          return true;
        case KeyCode.ENTER:
          self.fire("select", {value:null});
          return true
      }
    }
    switch(keyCode) {
      case KeyCode.DOWN:
        goWeek(self, 1);
        return true;
      case KeyCode.UP:
        goWeek(self, -1);
        return true;
      case KeyCode.LEFT:
        if(ctrlKey) {
          goYear(self, -1)
        }else {
          goDay(self, -1)
        }
        return true;
      case KeyCode.RIGHT:
        if(ctrlKey) {
          goYear(self, 1)
        }else {
          goDay(self, 1)
        }
        return true;
      case KeyCode.HOME:
        goStartMonth(self);
        return true;
      case KeyCode.END:
        goEndMonth(self);
        return true;
      case KeyCode.PAGE_DOWN:
        goMonth(self, 1);
        return true;
      case KeyCode.PAGE_UP:
        goMonth(self, -1);
        return true;
      case KeyCode.ENTER:
        self.fire("select", {value:self.get("value")});
        return true
    }
    return undefined
  }}, {xclass:"date-picker", ATTRS:{focusable:{value:true}, value:{view:1, valueFn:function() {
    var date = new GregorianCalendar;
    date.setTime(S.now());
    return date
  }}, previousMonthBtn:{}, monthSelectEl:{}, monthPanel:{valueFn:setUpMonthPanel}, nextMonthBtn:{}, tbodyEl:{}, todayBtnEl:{}, dateRender:{}, disabledDate:{}, locale:{value:locale}, showToday:{view:1, value:true}, showClear:{view:1, value:true}, clear:{view:1, value:false}, showWeekNumber:{view:1, value:true}, xrender:{value:PickerRender}}})
});
KISSY.add("date/picker", ["./picker/control"], function(S, require) {
  return require("./picker/control")
});

