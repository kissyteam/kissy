/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
/*
 Combined processedModules by KISSY Module Compiler: 

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
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config0 = {};
    var params1 = [];
    var id2 = getPropertyUtil(engine, scope, "years", 0, 1);
    params1.push(id2);
    config0.params = params1;
    config0.fn = function(scope) {
      var buffer = "";
      buffer += '\n<tr role="row">\n    ';
      var config3 = {};
      var params4 = [];
      var id6 = getPropertyUtil(engine, scope, "xindex", 0, 3);
      var id5 = getPropertyUtil(engine, scope, "years." + id6 + "", 0, 3);
      params4.push(id5);
      config3.params = params4;
      config3.fn = function(scope) {
        var buffer = "";
        buffer += '\n    <td role="gridcell"\n        title="';
        var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 5);
        buffer += renderOutputUtil(id7, true);
        buffer += '"\n        class="';
        var config9 = {};
        var params10 = [];
        params10.push("cell");
        config9.params = params10;
        var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 6);
        buffer += renderOutputUtil(id8, true);
        buffer += "\n        ";
        var config11 = {};
        var params12 = [];
        var id13 = getPropertyUtil(engine, scope, "content", 0, 7);
        var id14 = getPropertyUtil(engine, scope, "year", 0, 7);
        params12.push(id13 === id14);
        config11.params = params12;
        config11.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var config16 = {};
          var params17 = [];
          params17.push("selected-cell");
          config16.params = params17;
          var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 8);
          buffer += renderOutputUtil(id15, true);
          buffer += "\n        ";
          return buffer
        };
        buffer += runBlockCommandUtil(engine, scope, config11, "if", 7);
        buffer += "\n        ";
        var config18 = {};
        var params19 = [];
        var id20 = getPropertyUtil(engine, scope, "content", 0, 10);
        var id21 = getPropertyUtil(engine, scope, "startYear", 0, 10);
        params19.push(id20 < id21);
        config18.params = params19;
        config18.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var config23 = {};
          var params24 = [];
          params24.push("last-decade-cell");
          config23.params = params24;
          var id22 = runInlineCommandUtil(engine, scope, config23, "getBaseCssClasses", 11);
          buffer += renderOutputUtil(id22, true);
          buffer += "\n        ";
          return buffer
        };
        buffer += runBlockCommandUtil(engine, scope, config18, "if", 10);
        buffer += "\n        ";
        var config25 = {};
        var params26 = [];
        var id27 = getPropertyUtil(engine, scope, "content", 0, 13);
        var id28 = getPropertyUtil(engine, scope, "endYear", 0, 13);
        params26.push(id27 > id28);
        config25.params = params26;
        config25.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var config30 = {};
          var params31 = [];
          params31.push("next-decade-cell");
          config30.params = params31;
          var id29 = runInlineCommandUtil(engine, scope, config30, "getBaseCssClasses", 14);
          buffer += renderOutputUtil(id29, true);
          buffer += "\n        ";
          return buffer
        };
        buffer += runBlockCommandUtil(engine, scope, config25, "if", 13);
        buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
        var config33 = {};
        var params34 = [];
        params34.push("year");
        config33.params = params34;
        var id32 = runInlineCommandUtil(engine, scope, config33, "getBaseCssClasses", 20);
        buffer += renderOutputUtil(id32, true);
        buffer += '">\n            ';
        var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 21);
        buffer += renderOutputUtil(id35, true);
        buffer += "\n        </a>\n    </td>\n    ";
        return buffer
      };
      buffer += runBlockCommandUtil(engine, scope, config3, "each", 3);
      buffer += "\n</tr>\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config0, "each", 1);
    return buffer
  }
});
KISSY.add("date/picker/year-panel/year-panel-xtpl", ["date/picker/year-panel/years-xtpl"], function(S, require, exports, module) {
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
    buffer += '">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-';
    var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
    buffer += renderOutputUtil(id3, true);
    buffer += '"\n       class="';
    var config5 = {};
    var params6 = [];
    params6.push("prev-decade-btn");
    config5.params = params6;
    var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
    buffer += renderOutputUtil(id4, true);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousDecadeLabel", 0, 6);
    buffer += renderOutputUtil(id7, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n\n    <a class="';
    var config9 = {};
    var params10 = [];
    params10.push("decade-select");
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
    buffer += "-";
    var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 17);
    buffer += renderOutputUtil(id15, true);
    buffer += '\n            </span>\n        <span class="';
    var config17 = {};
    var params18 = [];
    params18.push("decade-select-arrow");
    config17.params = params18;
    var id16 = runInlineCommandUtil(engine, scope, config17, "getBaseCssClasses", 19);
    buffer += renderOutputUtil(id16, true);
    buffer += '">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-';
    var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 22);
    buffer += renderOutputUtil(id19, true);
    buffer += '"\n       class="';
    var config21 = {};
    var params22 = [];
    params22.push("next-decade-btn");
    config21.params = params22;
    var id20 = runInlineCommandUtil(engine, scope, config21, "getBaseCssClasses", 23);
    buffer += renderOutputUtil(id20, true);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextDecadeLabel", 0, 26);
    buffer += renderOutputUtil(id23, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var config25 = {};
    var params26 = [];
    params26.push("body");
    config25.params = params26;
    var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 30);
    buffer += renderOutputUtil(id24, true);
    buffer += '">\n    <table class="';
    var config28 = {};
    var params29 = [];
    params29.push("table");
    config28.params = params29;
    var id27 = runInlineCommandUtil(engine, scope, config28, "getBaseCssClasses", 31);
    buffer += renderOutputUtil(id27, true);
    buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-';
    var id30 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 32);
    buffer += renderOutputUtil(id30, true);
    buffer += '">\n        ';
    var config32 = {};
    var params33 = [];
    params33.push("date/picker/year-panel/years-xtpl");
    config32.params = params33;
    if(moduleWrap) {
      require("date/picker/year-panel/years-xtpl");
      config32.params[0] = moduleWrap.resolveByName(config32.params[0])
    }
    var id31 = runInlineCommandUtil(engine, scope, config32, "include", 33);
    buffer += renderOutputUtil(id31, false);
    buffer += "\n        </tbody>\n    </table>\n</div>";
    return buffer
  }
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
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config0 = {};
    var params1 = [];
    var id2 = getPropertyUtil(engine, scope, "decades", 0, 1);
    params1.push(id2);
    config0.params = params1;
    config0.fn = function(scope) {
      var buffer = "";
      buffer += '\n<tr role="row">\n    ';
      var config3 = {};
      var params4 = [];
      var id6 = getPropertyUtil(engine, scope, "xindex", 0, 3);
      var id5 = getPropertyUtil(engine, scope, "decades." + id6 + "", 0, 3);
      params4.push(id5);
      config3.params = params4;
      config3.fn = function(scope) {
        var buffer = "";
        buffer += '\n    <td role="gridcell"\n        class="';
        var config8 = {};
        var params9 = [];
        params9.push("cell");
        config8.params = params9;
        var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 5);
        buffer += renderOutputUtil(id7, true);
        buffer += "\n        ";
        var config10 = {};
        var params11 = [];
        var id12 = getPropertyUtil(engine, scope, "startDecade", 0, 6);
        var id13 = getPropertyUtil(engine, scope, "year", 0, 6);
        var id14 = getPropertyUtil(engine, scope, "year", 0, 6);
        var id15 = getPropertyUtil(engine, scope, "endDecade", 0, 6);
        params11.push(id12 <= id13 && id14 <= id15);
        config10.params = params11;
        config10.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var config17 = {};
          var params18 = [];
          params18.push("selected-cell");
          config17.params = params18;
          var id16 = runInlineCommandUtil(engine, scope, config17, "getBaseCssClasses", 7);
          buffer += renderOutputUtil(id16, true);
          buffer += "\n        ";
          return buffer
        };
        buffer += runBlockCommandUtil(engine, scope, config10, "if", 6);
        buffer += "\n        ";
        var config19 = {};
        var params20 = [];
        var id21 = getPropertyUtil(engine, scope, "startDecade", 0, 9);
        var id22 = getPropertyUtil(engine, scope, "startYear", 0, 9);
        params20.push(id21 < id22);
        config19.params = params20;
        config19.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var config24 = {};
          var params25 = [];
          params25.push("last-century-cell");
          config24.params = params25;
          var id23 = runInlineCommandUtil(engine, scope, config24, "getBaseCssClasses", 10);
          buffer += renderOutputUtil(id23, true);
          buffer += "\n        ";
          return buffer
        };
        buffer += runBlockCommandUtil(engine, scope, config19, "if", 9);
        buffer += "\n        ";
        var config26 = {};
        var params27 = [];
        var id28 = getPropertyUtil(engine, scope, "endDecade", 0, 12);
        var id29 = getPropertyUtil(engine, scope, "endYear", 0, 12);
        params27.push(id28 > id29);
        config26.params = params27;
        config26.fn = function(scope) {
          var buffer = "";
          buffer += "\n         ";
          var config31 = {};
          var params32 = [];
          params32.push("next-century-cell");
          config31.params = params32;
          var id30 = runInlineCommandUtil(engine, scope, config31, "getBaseCssClasses", 13);
          buffer += renderOutputUtil(id30, true);
          buffer += "\n        ";
          return buffer
        };
        buffer += runBlockCommandUtil(engine, scope, config26, "if", 12);
        buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
        var config34 = {};
        var params35 = [];
        params35.push("decade");
        config34.params = params35;
        var id33 = runInlineCommandUtil(engine, scope, config34, "getBaseCssClasses", 19);
        buffer += renderOutputUtil(id33, true);
        buffer += '">\n            ';
        var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "startDecade", 0, 20);
        buffer += renderOutputUtil(id36, true);
        buffer += "-";
        var id37 = getPropertyOrRunCommandUtil(engine, scope, {}, "endDecade", 0, 20);
        buffer += renderOutputUtil(id37, true);
        buffer += "\n        </a>\n    </td>\n    ";
        return buffer
      };
      buffer += runBlockCommandUtil(engine, scope, config3, "each", 3);
      buffer += "\n</tr>\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config0, "each", 1);
    return buffer
  }
});
KISSY.add("date/picker/decade-panel/decade-panel-xtpl", ["date/picker/decade-panel/decades-xtpl"], function(S, require, exports, module) {
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
    buffer += '">\n    <a id="ks-date-picker-decade-panel-previous-century-btn-';
    var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
    buffer += renderOutputUtil(id3, true);
    buffer += '"\n       class="';
    var config5 = {};
    var params6 = [];
    params6.push("prev-century-btn");
    config5.params = params6;
    var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
    buffer += renderOutputUtil(id4, true);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousCenturyLabel", 0, 6);
    buffer += renderOutputUtil(id7, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n    <div class="';
    var config9 = {};
    var params10 = [];
    params10.push("century");
    config9.params = params10;
    var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 9);
    buffer += renderOutputUtil(id8, true);
    buffer += '"\n         id="ks-date-picker-decade-panel-century-';
    var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10);
    buffer += renderOutputUtil(id11, true);
    buffer += '">\n                ';
    var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "startYear", 0, 11);
    buffer += renderOutputUtil(id12, true);
    buffer += "-";
    var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 11);
    buffer += renderOutputUtil(id13, true);
    buffer += '\n    </div>\n    <a id="ks-date-picker-decade-panel-next-century-btn-';
    var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 13);
    buffer += renderOutputUtil(id14, true);
    buffer += '"\n       class="';
    var config16 = {};
    var params17 = [];
    params17.push("next-century-btn");
    config16.params = params17;
    var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 14);
    buffer += renderOutputUtil(id15, true);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextCenturyLabel", 0, 17);
    buffer += renderOutputUtil(id18, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var config20 = {};
    var params21 = [];
    params21.push("body");
    config20.params = params21;
    var id19 = runInlineCommandUtil(engine, scope, config20, "getBaseCssClasses", 21);
    buffer += renderOutputUtil(id19, true);
    buffer += '">\n    <table class="';
    var config23 = {};
    var params24 = [];
    params24.push("table");
    config23.params = params24;
    var id22 = runInlineCommandUtil(engine, scope, config23, "getBaseCssClasses", 22);
    buffer += renderOutputUtil(id22, true);
    buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-decade-panel-tbody-';
    var id25 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 23);
    buffer += renderOutputUtil(id25, true);
    buffer += '">\n        ';
    var config27 = {};
    var params28 = [];
    params28.push("date/picker/decade-panel/decades-xtpl");
    config27.params = params28;
    if(moduleWrap) {
      require("date/picker/decade-panel/decades-xtpl");
      config27.params[0] = moduleWrap.resolveByName(config27.params[0])
    }
    var id26 = runInlineCommandUtil(engine, scope, config27, "include", 24);
    buffer += renderOutputUtil(id26, false);
    buffer += "\n        </tbody>\n    </table>\n</div>";
    return buffer
  }
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
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config0 = {};
    var params1 = [];
    var id2 = getPropertyUtil(engine, scope, "months", 0, 1);
    params1.push(id2);
    config0.params = params1;
    config0.fn = function(scope) {
      var buffer = "";
      buffer += '\n<tr role="row">\n    ';
      var config3 = {};
      var params4 = [];
      var id6 = getPropertyUtil(engine, scope, "xindex", 0, 3);
      var id5 = getPropertyUtil(engine, scope, "months." + id6 + "", 0, 3);
      params4.push(id5);
      config3.params = params4;
      config3.fn = function(scope) {
        var buffer = "";
        buffer += '\n    <td role="gridcell"\n        title="';
        var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 5);
        buffer += renderOutputUtil(id7, true);
        buffer += '"\n        class="';
        var config9 = {};
        var params10 = [];
        params10.push("cell");
        config9.params = params10;
        var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 6);
        buffer += renderOutputUtil(id8, true);
        buffer += "\n        ";
        var config11 = {};
        var params12 = [];
        var id13 = getPropertyUtil(engine, scope, "month", 0, 7);
        var id14 = getPropertyUtil(engine, scope, "value", 0, 7);
        params12.push(id13 === id14);
        config11.params = params12;
        config11.fn = function(scope) {
          var buffer = "";
          buffer += "\n        ";
          var config16 = {};
          var params17 = [];
          params17.push("selected-cell");
          config16.params = params17;
          var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 8);
          buffer += renderOutputUtil(id15, true);
          buffer += "\n        ";
          return buffer
        };
        buffer += runBlockCommandUtil(engine, scope, config11, "if", 7);
        buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
        var config19 = {};
        var params20 = [];
        params20.push("month");
        config19.params = params20;
        var id18 = runInlineCommandUtil(engine, scope, config19, "getBaseCssClasses", 14);
        buffer += renderOutputUtil(id18, true);
        buffer += '">\n            ';
        var id21 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 15);
        buffer += renderOutputUtil(id21, true);
        buffer += "\n        </a>\n    </td>\n    ";
        return buffer
      };
      buffer += runBlockCommandUtil(engine, scope, config3, "each", 3);
      buffer += "\n</tr>\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config0, "each", 1);
    return buffer
  }
});
KISSY.add("date/picker/month-panel/month-panel-xtpl", ["date/picker/month-panel/months-xtpl"], function(S, require, exports, module) {
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
    buffer += '">\n    <a id="ks-date-picker-month-panel-previous-year-btn-';
    var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
    buffer += renderOutputUtil(id3, true);
    buffer += '"\n       class="';
    var config5 = {};
    var params6 = [];
    params6.push("prev-year-btn");
    config5.params = params6;
    var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
    buffer += renderOutputUtil(id4, true);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousYearLabel", 0, 6);
    buffer += renderOutputUtil(id7, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n\n\n        <a class="';
    var config9 = {};
    var params10 = [];
    params10.push("year-select");
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
    params17.push("year-select-arrow");
    config16.params = params17;
    var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 18);
    buffer += renderOutputUtil(id15, true);
    buffer += '">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-';
    var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 21);
    buffer += renderOutputUtil(id18, true);
    buffer += '"\n       class="';
    var config20 = {};
    var params21 = [];
    params21.push("next-year-btn");
    config20.params = params21;
    var id19 = runInlineCommandUtil(engine, scope, config20, "getBaseCssClasses", 22);
    buffer += renderOutputUtil(id19, true);
    buffer += '"\n       href="#"\n       role="button"\n       title="';
    var id22 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextYearLabel", 0, 25);
    buffer += renderOutputUtil(id22, true);
    buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
    var config24 = {};
    var params25 = [];
    params25.push("body");
    config24.params = params25;
    var id23 = runInlineCommandUtil(engine, scope, config24, "getBaseCssClasses", 29);
    buffer += renderOutputUtil(id23, true);
    buffer += '">\n    <table class="';
    var config27 = {};
    var params28 = [];
    params28.push("table");
    config27.params = params28;
    var id26 = runInlineCommandUtil(engine, scope, config27, "getBaseCssClasses", 30);
    buffer += renderOutputUtil(id26, true);
    buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-';
    var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 31);
    buffer += renderOutputUtil(id29, true);
    buffer += '">\n        ';
    var config31 = {};
    var params32 = [];
    params32.push("date/picker/month-panel/months-xtpl");
    config31.params = params32;
    if(moduleWrap) {
      require("date/picker/month-panel/months-xtpl");
      config31.params[0] = moduleWrap.resolveByName(config31.params[0])
    }
    var id30 = runInlineCommandUtil(engine, scope, config31, "include", 32);
    buffer += renderOutputUtil(id30, false);
    buffer += "\n        </tbody>\n    </table>\n</div>";
    return buffer
  }
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

