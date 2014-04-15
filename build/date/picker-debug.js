/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:43
*/
/*
combined files : 

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
/**
 * @ignore
 * render for year panel
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/render',['date/format', 'date/picker-xtpl', 'component/control'], function (S, require) {
    var DateTimeFormat = require('date/format'),
        PickerTpl = require('date/picker-xtpl'),
        Control = require('component/control');
    var dateRowTplStart = '<tr role="row">';
    var dateRowTplEnd = '</tr>';
    var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
    var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
    var dateTpl = '<a ' +
        ' id="{id}" ' +
        ' hidefocus="on" ' +
        ' unselectable="on" ' +
        ' tabindex="-1" ' +
        ' class="{cls}" ' +
        ' href="#" ' +
        ' aria-selected="{selected}" ' +
        ' aria-disabled="{disabled}">{content}</a>';
    var DATE_ROW_COUNT = 6;
    var DATE_COL_COUNT = 7;

    function getIdFromDate(d) {
        return 'ks-date-picker-date-' + d.getYear() +
            '-' + d.getMonth() + '-' +
            d.getDayOfMonth();
    }

    function isSameDay(one, two) {
        return one.getYear() === two.getYear() &&
            one.getMonth() === two.getMonth() &&
            one.getDayOfMonth() === two.getDayOfMonth();
    }

    function isSameMonth(one, two) {
        return one.getYear() === two.getYear() &&
            one.getMonth() === two.getMonth();
    }

    function beforeCurrentMonthYear(current, today) {
        if (current.getYear() < today.getYear()) {
            return 1;
        }
        return current.getYear() === today.getYear() &&
            current.getMonth() < today.getMonth();
    }

    function afterCurrentMonthYear(current, today) {
        if (current.getYear() > today.getYear()) {
            return 1;
        }
        return current.getYear() === today.getYear() &&
            current.getMonth() > today.getMonth();
    }

    function renderDatesCmd() {
        return this.config.view.renderDates();
    }

    return Control.getDefaultRender().extend({
        getMonthYearLabel: function () {
            var self = this;
            var control = self.control;
            var locale = control.get('locale');
            var value = control.get('value');
            var dateLocale = value.getLocale();
            return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
        },

        getTodayTimeLabel: function () {
            var self = this;
            var control = self.control;
            var locale = control.get('locale');
            var value = control.get('value');
            var dateLocale = value.getLocale();
            var today = value.clone();
            today.setTime(S.now());
            return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
        },

        beforeCreateDom: function (renderData, childrenSelectors, renderCommands) {
            var self = this;
            var control = self.control;
            var locale = control.get('locale');
            var value = control.get('value');
            var dateLocale = value.getLocale();
            S.mix(childrenSelectors, {
                monthSelectEl: '#ks-date-picker-month-select-{id}',
                monthSelectContentEl: '#ks-date-picker-month-select-content-{id}',
                previousMonthBtn: '#ks-date-picker-previous-month-btn-{id}',
                nextMonthBtn: '#ks-date-picker-next-month-btn-{id}',
                previousYearBtn: '#ks-date-picker-previous-year-btn-{id}',
                nextYearBtn: '#ks-date-picker-next-year-btn-{id}',
                todayBtnEl: '#ks-date-picker-today-btn-{id}',
                clearBtnEl: '#ks-date-picker-clear-btn-{id}',
                tbodyEl: '#ks-date-picker-tbody-{id}'
            });
            var veryShortWeekdays = [];
            var weekDays = [];
            var firstDayOfWeek = value.getFirstDayOfWeek();
            for (var i = 0; i < DATE_COL_COUNT; i++) {
                var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
                veryShortWeekdays[i] = locale.veryShortWeekdays[index];
                weekDays[i] = dateLocale.weekdays[index];
            }
            S.mix(renderData, {
                monthSelectLabel: locale.monthSelect,
                monthYearLabel: self.getMonthYearLabel(),
                previousMonthLabel: locale.previousMonth,
                nextMonthLabel: locale.nextMonth,
                previousYearLabel: locale.previousYear,
                nextYearLabel: locale.nextYear,
                weekdays: weekDays,
                veryShortWeekdays: veryShortWeekdays,
                todayLabel: locale.today,
                clearLabel: locale.clear,
                todayTimeLabel: self.getTodayTimeLabel()
            });
            renderCommands.renderDates = renderDatesCmd;
        },

        renderDates: function () {
            var self = this,
                i, j,
                dateTable = [],
                current,
                control = self.control,
                isClear = control.get('clear'),
                showWeekNumber = control.get('showWeekNumber'),
                locale = control.get('locale'),
                value = control.get('value'),
                today = value.clone(),
                cellClass = self.getBaseCssClasses('cell'),
                weekNumberCellClass = self.getBaseCssClasses('week-number-cell'),
                dateClass = self.getBaseCssClasses('date'),
                dateRender = control.get('dateRender'),
                disabledDate = control.get('disabledDate'),
                dateLocale = value.getLocale(),
                dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale),
                todayClass = self.getBaseCssClasses('today'),
                selectedClass = self.getBaseCssClasses('selected-day'),
                lastMonthDayClass = self.getBaseCssClasses('last-month-cell'),
                nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'),
                disabledClass = self.getBaseCssClasses('disabled-cell');

            today.setTime(S.now());
            var month1 = value.clone();
            month1.set(value.getYear(), value.getMonth(), 1);
            var day = month1.getDayOfWeek();
            var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
            // calculate last month
            var lastMonth1 = month1.clone();
            lastMonth1.addDayOfMonth(0 - lastMonthDiffDay);
            var passed = 0;
            for (i = 0; i < DATE_ROW_COUNT; i++) {
                for (j = 0; j < DATE_COL_COUNT; j++) {
                    current = lastMonth1;
                    if (passed) {
                        current = current.clone();
                        current.addDayOfMonth(passed);
                    }
                    dateTable.push(current);
                    passed++;
                }
            }
            var tableHtml = '';
            passed = 0;
            for (i = 0; i < DATE_ROW_COUNT; i++) {
                var rowHtml = dateRowTplStart;
                if (showWeekNumber) {
                    rowHtml += S.substitute(weekNumberCellTpl, {
                        cls: weekNumberCellClass,
                        content: dateTable[passed].getWeekOfYear()
                    });
                }
                for (j = 0; j < DATE_COL_COUNT; j++) {
                    current = dateTable[passed];
                    var cls = cellClass;
                    var disabled = false;
                    var selected = false;

                    if (isSameDay(current, today)) {
                        cls += ' ' + todayClass;
                    }
                    if (!isClear && isSameDay(current, value)) {
                        cls += ' ' + selectedClass;
                        selected = true;
                    }
                    if (beforeCurrentMonthYear(current, value)) {
                        cls += ' ' + lastMonthDayClass;
                    }
                    if (afterCurrentMonthYear(current, value)) {
                        cls += ' ' + nextMonthDayClass;
                    }
                    if (disabledDate && disabledDate(current, value)) {
                        cls += ' ' + disabledClass;
                        disabled = true;
                    }

                    var dateHtml = '';
                    if (!(dateRender && (dateHtml = dateRender(current, value)))) {
                        dateHtml = S.substitute(dateTpl, {
                            cls: dateClass,
                            id: getIdFromDate(current),
                            selected: selected,
                            disabled: disabled,
                            content: current.getDayOfMonth()
                        });
                    }
                    rowHtml += S.substitute(dateCellTpl, {
                        cls: cls,
                        index: passed,
                        title: dateFormatter.format(current),
                        content: dateHtml
                    });
                    passed++;
                }
                tableHtml += rowHtml + dateRowTplEnd;
            }
            control.dateTable = dateTable;
            return tableHtml;
        },

        createDom: function () {
            this.$el.attr('aria-activedescendant', getIdFromDate(this.control.get('value')));
        },

        _onSetClear: function (v) {
            var control = this.control;
            var value = control.get('value');
            var selectedCls = this.getBaseCssClasses('selected-day');
            var id = getIdFromDate(value);
            var currentA = this.$('#' + id);
            if (v) {
                currentA.parent().removeClass(selectedCls);
                currentA.attr('aria-selected', false);
                this.$el.attr('aria-activedescendant', '');
            } else {
                currentA.parent().addClass(selectedCls);
                currentA.attr('aria-selected', true);
                this.$el.attr('aria-activedescendant', id);
            }
        },

        // re render after current value change
        _onSetValue: function (value, e) {
            var control = this.control;
            var preValue = e.prevVal;
            if (isSameMonth(preValue, value)) {
                var disabledDate = control.get('disabledDate');
                var selectedCls = this.getBaseCssClasses('selected-day');
                var prevA = this.$('#' + getIdFromDate(preValue));
                prevA.parent().removeClass(selectedCls);
                prevA.attr('aria-selected', false);
                if (!(disabledDate && disabledDate(value, value))) {
                    var currentA = this.$('#' + getIdFromDate(value));
                    currentA.parent().addClass(selectedCls);
                    currentA.attr('aria-selected', true);
                }
            } else {
                var tbodyEl = control.get('tbodyEl');
                var monthSelectContentEl = control.get('monthSelectContentEl');
                var todayBtnEl = control.get('todayBtnEl');
                monthSelectContentEl.html(this.getMonthYearLabel());
                todayBtnEl.attr('title', this.getTodayTimeLabel());
                tbodyEl.html(this.renderDates());
            }
            this.$el.attr('aria-activedescendant', getIdFromDate(value));
        }
    }, {
        name: 'date-picker-render',

        ATTRS: {
            contentTpl: {
                value: PickerTpl
            }
        }
    });
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/year-panel/years-xtpl',function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["years"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\r\n<tr role="row">\r\n    ');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve(["years", id6]);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {

                    buffer.write('\r\n    <td role="gridcell"\r\n        title="');
                    var id7 = scope.resolve(["title"]);
                    buffer.write(id7, true);
                    buffer.write('"\r\n        class="');
                    var option8 = {
                        escape: 1
                    };
                    var params9 = [];
                    params9.push('cell');
                    option8.params = params9;
                    var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 6);
                    if (commandRet10 && commandRet10.isBuffer) {
                        buffer = commandRet10;
                        commandRet10 = undefined;
                    }
                    buffer.write(commandRet10, true);
                    buffer.write('\r\n        ');
                    var option11 = {
                        escape: 1
                    };
                    var params12 = [];
                    var id13 = scope.resolve(["content"]);
                    var exp15 = id13;
                    var id14 = scope.resolve(["year"]);
                    exp15 = (id13) === (id14);
                    params12.push(exp15);
                    option11.params = params12;
                    option11.fn = function (scope, buffer) {

                        buffer.write('\r\n         ');
                        var option16 = {
                            escape: 1
                        };
                        var params17 = [];
                        params17.push('selected-cell');
                        option16.params = params17;
                        var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 8);
                        if (commandRet18 && commandRet18.isBuffer) {
                            buffer = commandRet18;
                            commandRet18 = undefined;
                        }
                        buffer.write(commandRet18, true);
                        buffer.write('\r\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option11, buffer, 7, payload);
                    buffer.write('\r\n        ');
                    var option19 = {
                        escape: 1
                    };
                    var params20 = [];
                    var id21 = scope.resolve(["content"]);
                    var exp23 = id21;
                    var id22 = scope.resolve(["startYear"]);
                    exp23 = (id21) < (id22);
                    params20.push(exp23);
                    option19.params = params20;
                    option19.fn = function (scope, buffer) {

                        buffer.write('\r\n         ');
                        var option24 = {
                            escape: 1
                        };
                        var params25 = [];
                        params25.push('last-decade-cell');
                        option24.params = params25;
                        var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 11);
                        if (commandRet26 && commandRet26.isBuffer) {
                            buffer = commandRet26;
                            commandRet26 = undefined;
                        }
                        buffer.write(commandRet26, true);
                        buffer.write('\r\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option19, buffer, 10, payload);
                    buffer.write('\r\n        ');
                    var option27 = {
                        escape: 1
                    };
                    var params28 = [];
                    var id29 = scope.resolve(["content"]);
                    var exp31 = id29;
                    var id30 = scope.resolve(["endYear"]);
                    exp31 = (id29) > (id30);
                    params28.push(exp31);
                    option27.params = params28;
                    option27.fn = function (scope, buffer) {

                        buffer.write('\r\n         ');
                        var option32 = {
                            escape: 1
                        };
                        var params33 = [];
                        params33.push('next-decade-cell');
                        option32.params = params33;
                        var commandRet34 = callCommandUtil(engine, scope, option32, buffer, "getBaseCssClasses", 14);
                        if (commandRet34 && commandRet34.isBuffer) {
                            buffer = commandRet34;
                            commandRet34 = undefined;
                        }
                        buffer.write(commandRet34, true);
                        buffer.write('\r\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option27, buffer, 13, payload);
                    buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="');
                    var option35 = {
                        escape: 1
                    };
                    var params36 = [];
                    params36.push('year');
                    option35.params = params36;
                    var commandRet37 = callCommandUtil(engine, scope, option35, buffer, "getBaseCssClasses", 20);
                    if (commandRet37 && commandRet37.isBuffer) {
                        buffer = commandRet37;
                        commandRet37 = undefined;
                    }
                    buffer.write(commandRet37, true);
                    buffer.write('">\r\n            ');
                    var id38 = scope.resolve(["content"]);
                    buffer.write(id38, true);
                    buffer.write('\r\n        </a>\r\n    </td>\r\n    ');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
                buffer.write('\r\n</tr>\r\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/year-panel/year-panel-xtpl',['date/picker/year-panel/years-xtpl'], function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<div class="');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('header');
            option0.params = params1;
            var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('">\r\n    <a class="');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('prev-decade-btn');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id6 = scope.resolve(["previousDecadeLabel"]);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('decade-select');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
            var id10 = scope.resolve(["decadeSelectLabel"]);
            buffer.write(id10, true);
            buffer.write('">\r\n            <span>\r\n                ');
            var id11 = scope.resolve(["startYear"]);
            buffer.write(id11, true);
            buffer.write('-');
            var id12 = scope.resolve(["endYear"]);
            buffer.write(id12, true);
            buffer.write('\r\n            </span>\r\n        <span class="');
            var option13 = {
                escape: 1
            };
            var params14 = [];
            params14.push('decade-select-arrow');
            option13.params = params14;
            var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 17);
            if (commandRet15 && commandRet15.isBuffer) {
                buffer = commandRet15;
                commandRet15 = undefined;
            }
            buffer.write(commandRet15, true);
            buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('next-decade-btn');
            option16.params = params17;
            var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 20);
            if (commandRet18 && commandRet18.isBuffer) {
                buffer = commandRet18;
                commandRet18 = undefined;
            }
            buffer.write(commandRet18, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id19 = scope.resolve(["nextDecadeLabel"]);
            buffer.write(id19, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
            var option20 = {
                escape: 1
            };
            var params21 = [];
            params21.push('body');
            option20.params = params21;
            var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 27);
            if (commandRet22 && commandRet22.isBuffer) {
                buffer = commandRet22;
                commandRet22 = undefined;
            }
            buffer.write(commandRet22, true);
            buffer.write('">\r\n    <table class="');
            var option23 = {
                escape: 1
            };
            var params24 = [];
            params24.push('table');
            option23.params = params24;
            var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 28);
            if (commandRet25 && commandRet25.isBuffer) {
                buffer = commandRet25;
                commandRet25 = undefined;
            }
            buffer.write(commandRet25, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody>\r\n        ');
            var option26 = {};
            var params27 = [];
            params27.push('date/picker/year-panel/years-xtpl');
            option26.params = params27;
            require("date/picker/year-panel/years-xtpl");
            option26.params[0] = module.resolve(option26.params[0]);
            var commandRet28 = includeCommand.call(engine, scope, option26, buffer, 30, payload);
            if (commandRet28 && commandRet28.isBuffer) {
                buffer = commandRet28;
                commandRet28 = undefined;
            }
            buffer.write(commandRet28, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});
/**
 * @ignore
 * render for year-panel
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/year-panel/render',['date/format', 'component/control', './years-xtpl', './year-panel-xtpl'], function (S, require) {
    var DateFormat = require('date/format'),
        Control = require('component/control'),
        YearsTpl = require('./years-xtpl'),
        YearPanelTpl = require('./year-panel-xtpl');

    function prepareYears(control) {
        var value = control.get('value');
        var currentYear = value.getYear();
        var startYear = parseInt(currentYear / 10,10) * 10;
        var preYear = startYear - 1;
        var current = value.clone();
        var locale = control.get('locale');
        var yearFormat = locale.yearFormat;
        var dateLocale = value.getLocale();
        var dateFormatter = new DateFormat(yearFormat, dateLocale);
        var years = [];
        var index = 0;
        for (var i = 0; i < 3; i++) {
            years[i] = [];
            for (var j = 0; j < 4; j++) {
                current.setYear(preYear + index);
                years[i][j] = {
                    content: preYear + index,
                    title: dateFormatter.format(current)
                };
                index++;
            }
        }
        control.years = years;
        return years;
    }

    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData, childrenSelectors) {
            var control = this.control;
            var value = control.get('value');
            var currentYear = value.getYear();
            var startYear = parseInt(currentYear / 10,10) * 10;
            var endYear = startYear + 9;
            var locale = control.get('locale');
            S.mix(renderData, {
                decadeSelectLabel: locale.decadeSelect,
                years: prepareYears(control),
                startYear: startYear,
                endYear: endYear,
                year: value.getYear(),
                previousDecadeLabel: locale.previousDecade,
                nextDecadeLabel: locale.nextDecade
            });
            S.mix(childrenSelectors, {
                tbodyEl: '#ks-date-picker-year-panel-tbody-{id}',
                previousDecadeBtn: '#ks-date-picker-year-panel-previous-decade-btn-{id}',
                decadeSelectEl: '#ks-date-picker-year-panel-decade-select-{id}',
                decadeSelectContentEl: '#ks-date-picker-year-panel-decade-select-content-{id}',
                nextDecadeBtn: '#ks-date-picker-year-panel-next-decade-btn-{id}'
            });
        },

        _onSetValue: function (value) {
            var control = this.control;
            var currentYear = value.getYear();
            var startYear = parseInt(currentYear / 10,10) * 10;
            var endYear = startYear + 9;
            S.mix(this.renderData, {
                startYear: startYear,
                endYear: endYear,
                years: prepareYears(control),
                year: value.getYear()
            });
            control.get('tbodyEl').html(this.renderTpl(YearsTpl));
            control.get('decadeSelectContentEl').html(startYear + '-' + endYear);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: YearPanelTpl
            }
        }
    });
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/decade-panel/decades-xtpl',function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["decades"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\r\n<tr role="row">\r\n    ');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve(["decades", id6]);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {

                    buffer.write('\r\n    <td role="gridcell"\r\n        class="');
                    var option7 = {
                        escape: 1
                    };
                    var params8 = [];
                    params8.push('cell');
                    option7.params = params8;
                    var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 5);
                    if (commandRet9 && commandRet9.isBuffer) {
                        buffer = commandRet9;
                        commandRet9 = undefined;
                    }
                    buffer.write(commandRet9, true);
                    buffer.write('\r\n        ');
                    var option10 = {
                        escape: 1
                    };
                    var params11 = [];
                    var id12 = scope.resolve(["startDecade"]);
                    var exp14 = id12;
                    var id13 = scope.resolve(["year"]);
                    exp14 = (id12) <= (id13);
                    var exp18 = exp14;
                    if ((exp14)) {
                        var id15 = scope.resolve(["year"]);
                        var exp17 = id15;
                        var id16 = scope.resolve(["endDecade"]);
                        exp17 = (id15) <= (id16);
                        exp18 = exp17;
                    }
                    params11.push(exp18);
                    option10.params = params11;
                    option10.fn = function (scope, buffer) {

                        buffer.write('\r\n         ');
                        var option19 = {
                            escape: 1
                        };
                        var params20 = [];
                        params20.push('selected-cell');
                        option19.params = params20;
                        var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 7);
                        if (commandRet21 && commandRet21.isBuffer) {
                            buffer = commandRet21;
                            commandRet21 = undefined;
                        }
                        buffer.write(commandRet21, true);
                        buffer.write('\r\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option10, buffer, 6, payload);
                    buffer.write('\r\n        ');
                    var option22 = {
                        escape: 1
                    };
                    var params23 = [];
                    var id24 = scope.resolve(["startDecade"]);
                    var exp26 = id24;
                    var id25 = scope.resolve(["startYear"]);
                    exp26 = (id24) < (id25);
                    params23.push(exp26);
                    option22.params = params23;
                    option22.fn = function (scope, buffer) {

                        buffer.write('\r\n         ');
                        var option27 = {
                            escape: 1
                        };
                        var params28 = [];
                        params28.push('last-century-cell');
                        option27.params = params28;
                        var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 10);
                        if (commandRet29 && commandRet29.isBuffer) {
                            buffer = commandRet29;
                            commandRet29 = undefined;
                        }
                        buffer.write(commandRet29, true);
                        buffer.write('\r\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option22, buffer, 9, payload);
                    buffer.write('\r\n        ');
                    var option30 = {
                        escape: 1
                    };
                    var params31 = [];
                    var id32 = scope.resolve(["endDecade"]);
                    var exp34 = id32;
                    var id33 = scope.resolve(["endYear"]);
                    exp34 = (id32) > (id33);
                    params31.push(exp34);
                    option30.params = params31;
                    option30.fn = function (scope, buffer) {

                        buffer.write('\r\n         ');
                        var option35 = {
                            escape: 1
                        };
                        var params36 = [];
                        params36.push('next-century-cell');
                        option35.params = params36;
                        var commandRet37 = callCommandUtil(engine, scope, option35, buffer, "getBaseCssClasses", 13);
                        if (commandRet37 && commandRet37.isBuffer) {
                            buffer = commandRet37;
                            commandRet37 = undefined;
                        }
                        buffer.write(commandRet37, true);
                        buffer.write('\r\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option30, buffer, 12, payload);
                    buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="');
                    var option38 = {
                        escape: 1
                    };
                    var params39 = [];
                    params39.push('decade');
                    option38.params = params39;
                    var commandRet40 = callCommandUtil(engine, scope, option38, buffer, "getBaseCssClasses", 19);
                    if (commandRet40 && commandRet40.isBuffer) {
                        buffer = commandRet40;
                        commandRet40 = undefined;
                    }
                    buffer.write(commandRet40, true);
                    buffer.write('">\r\n            ');
                    var id41 = scope.resolve(["startDecade"]);
                    buffer.write(id41, true);
                    buffer.write('-');
                    var id42 = scope.resolve(["endDecade"]);
                    buffer.write(id42, true);
                    buffer.write('\r\n        </a>\r\n    </td>\r\n    ');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
                buffer.write('\r\n</tr>\r\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/decade-panel/decade-panel-xtpl',['date/picker/decade-panel/decades-xtpl'], function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<div class="');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('header');
            option0.params = params1;
            var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('">\r\n    <a class="');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('prev-century-btn');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id6 = scope.resolve(["previousCenturyLabel"]);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <div class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('century');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 8);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('">\r\n                ');
            var id10 = scope.resolve(["startYear"]);
            buffer.write(id10, true);
            buffer.write('-');
            var id11 = scope.resolve(["endYear"]);
            buffer.write(id11, true);
            buffer.write('\r\n    </div>\r\n    <a class="');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            params13.push('next-century-btn');
            option12.params = params13;
            var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 11);
            if (commandRet14 && commandRet14.isBuffer) {
                buffer = commandRet14;
                commandRet14 = undefined;
            }
            buffer.write(commandRet14, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id15 = scope.resolve(["nextCenturyLabel"]);
            buffer.write(id15, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('body');
            option16.params = params17;
            var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 18);
            if (commandRet18 && commandRet18.isBuffer) {
                buffer = commandRet18;
                commandRet18 = undefined;
            }
            buffer.write(commandRet18, true);
            buffer.write('">\r\n    <table class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('table');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 19);
            if (commandRet21 && commandRet21.isBuffer) {
                buffer = commandRet21;
                commandRet21 = undefined;
            }
            buffer.write(commandRet21, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody>\r\n        ');
            var option22 = {};
            var params23 = [];
            params23.push('date/picker/decade-panel/decades-xtpl');
            option22.params = params23;
            require("date/picker/decade-panel/decades-xtpl");
            option22.params[0] = module.resolve(option22.params[0]);
            var commandRet24 = includeCommand.call(engine, scope, option22, buffer, 21, payload);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});
/**
 * @ignore
 * render for decade panel
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/decade-panel/render',['component/control', './decade-panel-xtpl', './decades-xtpl'], function (S,require) {
    var Control = require('component/control'),
        DecadePanelTpl = require('./decade-panel-xtpl'),
        MonthsTpl = require('./decades-xtpl');

    function prepareYears(control, view) {
        var value = control.get('value');
        var currentYear = value.getYear();
        var startYear = parseInt(currentYear / 100,10) * 100;
        var preYear = startYear - 10;
        var endYear = startYear + 99;
        var decades = [];
        var index = 0;
        for (var i = 0; i < 3; i++) {
            decades[i] = [];
            for (var j = 0; j < 4; j++) {
                decades[i][j] = {
                    startDecade: preYear + index * 10,
                    endDecade: preYear + index * 10 + 9
                };
                index++;
            }
        }
        control.decades = decades;
        S.mix(view.renderData, {
            startYear: startYear,
            endYear: endYear,
            year: currentYear,
            decades: decades
        });
    }

    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData, childrenSelectors) {
            var control = this.control;
            var locale = control.get('locale');
            prepareYears(control, this);
            S.mix(renderData, {
                previousCenturyLabel: locale.previousCentury,
                nextCenturyLabel: locale.nextCentury
            });
            S.mix(childrenSelectors, {
                tbodyEl: '#ks-date-picker-decade-panel-tbody-{id}',
                previousCenturyBtn: '#ks-date-picker-decade-panel-previous-century-btn-{id}',
                centuryEl: '#ks-date-picker-decade-panel-century-{id}',
                nextCenturyBtn: '#ks-date-picker-decade-panel-next-century-btn-{id}'
            });
        },

        _onSetValue: function () {
            var control = this.control;
            prepareYears(control, this);
            var startYear = this.renderData.startYear;
            var endYear = this.renderData.endYear;
            control.get('tbodyEl').html(this.renderTpl(MonthsTpl));
            control.get('centuryEl').html(startYear + '-' + endYear);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: DecadePanelTpl
            }
        }
    });
});
/**
 * @ignore
 * decade panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/decade-panel/control',['node', 'component/control', './render', 'event/gesture/tap'], function (S,require) {
    var Node = require('node'),
        Control = require('component/control'),
        CenturyPanelRender = require('./render');

    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }

    function nextCentury(e) {
        e.preventDefault();
        goYear(this, 100);
    }

    function prevCentury(e) {
        e.preventDefault();
        goYear(this, -100);
    }

    function chooseCell(e) {
        e.preventDefault();
        var td = $(e.currentTarget);
        var tr = td.parent();
        var tdIndex = td.index();
        var trIndex = tr.index();
        var value = this.get('value').clone();
        var y = value.getYear() % 10;
        value.setYear(this.decades[trIndex][tdIndex].startDecade + y);
        this.set('value', value);
        this.fire('select', {
            value: value
        });
    }

    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextCenturyBtn').on(tap, nextCentury, self);
            self.get('previousCenturyBtn').on(tap, prevCentury, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
        }
    }, {
        xclass: 'date-picker-decade-panel',
        ATTRS: {
            focusable: {
                value: false
            },
            value: {
                render: 1
            },
            xrender: {
                value: CenturyPanelRender
            }
        }
    });
});
/**
 * @ignore
 * month select for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/year-panel/control',['node', 'component/control', './render', '../decade-panel/control', 'event/gesture/tap'], function (S, require) {
    var Node = require('node'),
        Control = require('component/control'),
        DecadePanelRender = require('./render'),
        DecadePanel = require('../decade-panel/control');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }

    function nextDecade(e) {
        e.preventDefault();
        goYear(this, 10);
    }

    function prevDecade(e) {
        e.preventDefault();
        goYear(this, -10);
    }

    function chooseCell(e) {
        e.preventDefault();
        var td = $(e.currentTarget);
        var tr = td.parent();
        var tdIndex = td.index();
        var trIndex = tr.index();
        var value = this.get('value').clone();
        value.setYear(this.years[trIndex][tdIndex].content);
        this.set('value', value);
        this.fire('select', {
            value: value
        });
    }

    function showDecadePanel(e) {
        e.preventDefault();
        var decadePanel = this.get('decadePanel');
        decadePanel.set('value', this.get('value'));
        decadePanel.show();
    }

    function setUpDecadePanel() {
        var self = this;
        var decadePanel = new DecadePanel({
            locale: this.get('locale'),
            render: self.get('render')
        });
        decadePanel.on('select', onDecadePanelSelect, self);
        return decadePanel;
    }

    function onDecadePanelSelect(e) {
        this.set('value', e.value);
        this.get('decadePanel').hide();
    }

    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextDecadeBtn').on(tap, nextDecade, self);
            self.get('previousDecadeBtn').on(tap, prevDecade, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
            self.get('decadeSelectEl').on(tap, showDecadePanel, self);
        }
    }, {
        xclass: 'date-picker-year-panel',
        ATTRS: {
            focusable: {
                value: false
            },
            value: {
                render: 1
            },
            decadePanel: {
                valueFn: setUpDecadePanel
            },
            xrender: {
                value: DecadePanelRender
            }
        }
    });
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/month-panel/months-xtpl',function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["months"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\r\n<tr role="row">\r\n    ');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id6 = scope.resolve(["xindex"]);
                var id5 = scope.resolve(["months", id6]);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {

                    buffer.write('\r\n    <td role="gridcell"\r\n        title="');
                    var id7 = scope.resolve(["title"]);
                    buffer.write(id7, true);
                    buffer.write('"\r\n        class="');
                    var option8 = {
                        escape: 1
                    };
                    var params9 = [];
                    params9.push('cell');
                    option8.params = params9;
                    var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 6);
                    if (commandRet10 && commandRet10.isBuffer) {
                        buffer = commandRet10;
                        commandRet10 = undefined;
                    }
                    buffer.write(commandRet10, true);
                    buffer.write('\r\n        ');
                    var option11 = {
                        escape: 1
                    };
                    var params12 = [];
                    var id13 = scope.resolve(["month"]);
                    var exp15 = id13;
                    var id14 = scope.resolve(["value"]);
                    exp15 = (id13) === (id14);
                    params12.push(exp15);
                    option11.params = params12;
                    option11.fn = function (scope, buffer) {

                        buffer.write('\r\n        ');
                        var option16 = {
                            escape: 1
                        };
                        var params17 = [];
                        params17.push('selected-cell');
                        option16.params = params17;
                        var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 8);
                        if (commandRet18 && commandRet18.isBuffer) {
                            buffer = commandRet18;
                            commandRet18 = undefined;
                        }
                        buffer.write(commandRet18, true);
                        buffer.write('\r\n        ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option11, buffer, 7, payload);
                    buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="');
                    var option19 = {
                        escape: 1
                    };
                    var params20 = [];
                    params20.push('month');
                    option19.params = params20;
                    var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 14);
                    if (commandRet21 && commandRet21.isBuffer) {
                        buffer = commandRet21;
                        commandRet21 = undefined;
                    }
                    buffer.write(commandRet21, true);
                    buffer.write('">\r\n            ');
                    var id22 = scope.resolve(["content"]);
                    buffer.write(id22, true);
                    buffer.write('\r\n        </a>\r\n    </td>\r\n    ');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
                buffer.write('\r\n</tr>\r\n');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/month-panel/month-panel-xtpl',['date/picker/month-panel/months-xtpl'], function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<div class="');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('header');
            option0.params = params1;
            var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('">\r\n    <a class="');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('prev-year-btn');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id6 = scope.resolve(["previousYearLabel"]);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n\r\n        <a class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('year-select');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 10);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('"\r\n           role="button"\r\n           href="#"\r\n           hidefocus="on"\r\n           title="');
            var id10 = scope.resolve(["yearSelectLabel"]);
            buffer.write(id10, true);
            buffer.write('">\r\n            <span>');
            var id11 = scope.resolve(["year"]);
            buffer.write(id11, true);
            buffer.write('</span>\r\n            <span class="');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            params13.push('year-select-arrow');
            option12.params = params13;
            var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 16);
            if (commandRet14 && commandRet14.isBuffer) {
                buffer = commandRet14;
                commandRet14 = undefined;
            }
            buffer.write(commandRet14, true);
            buffer.write('">x</span>\r\n        </a>\r\n\r\n    <a class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('next-year-btn');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 19);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id18 = scope.resolve(["nextYearLabel"]);
            buffer.write(id18, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('body');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 26);
            if (commandRet21 && commandRet21.isBuffer) {
                buffer = commandRet21;
                commandRet21 = undefined;
            }
            buffer.write(commandRet21, true);
            buffer.write('">\r\n    <table class="');
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('table');
            option22.params = params23;
            var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 27);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody>\r\n        ');
            var option25 = {};
            var params26 = [];
            params26.push('date/picker/month-panel/months-xtpl');
            option25.params = params26;
            require("date/picker/month-panel/months-xtpl");
            option25.params[0] = module.resolve(option25.params[0]);
            var commandRet27 = includeCommand.call(engine, scope, option25, buffer, 29, payload);
            if (commandRet27 && commandRet27.isBuffer) {
                buffer = commandRet27;
                commandRet27 = undefined;
            }
            buffer.write(commandRet27, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});
/**
 * @ignore
 * render for month panel
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/month-panel/render',['date/format', 'component/control', './months-xtpl', './month-panel-xtpl'], function (S,require) {
    var DateFormat = require('date/format'),
        Control = require('component/control'),
        MonthsTpl = require('./months-xtpl'),
        MonthPanelTpl = require('./month-panel-xtpl');

    function prepareMonths(control) {
        var value = control.get('value');
        var currentMonth = value.getMonth();
        var current = value.clone();
        var locale = control.get('locale');
        var monthYearFormat = locale.monthYearFormat;
        var dateLocale = value.getLocale();
        var dateFormatter = new DateFormat(monthYearFormat, dateLocale);
        var months = [];
        var shortMonths = dateLocale.shortMonths;
        var index = 0;
        for (var i = 0; i < 3; i++) {
            months[i] = [];
            for (var j = 0; j < 4; j++) {
                current.setMonth(index);
                months[i][j] = {
                    value: index,
                    content: shortMonths[index],
                    title: dateFormatter.format(current)
                };
                index++;
            }
        }
        S.mix(control.view.renderData,{
            months: months,
            year: value.getYear(),
            month: currentMonth
        });
        control.months = months;
        return months;
    }

    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData, childrenSelectors) {
            var control = this.control;
            var locale = control.get('locale');
            S.mix(renderData, {
                yearSelectLabel: locale.yearSelect,
                previousYearLabel: locale.previousYear,
                nextYearLabel: locale.nextYear
            });
            S.mix(childrenSelectors, {
                tbodyEl: '#ks-date-picker-month-panel-tbody-{id}',
                previousYearBtn: '#ks-date-picker-month-panel-previous-year-btn-{id}',
                yearSelectEl: '#ks-date-picker-month-panel-year-select-{id}',
                yearSelectContentEl: '#ks-date-picker-month-panel-year-select-content-{id}',
                nextYearBtn: '#ks-date-picker-month-panel-next-year-btn-{id}'
            });
            
            prepareMonths(control);
        },

        _onSetValue: function (value) {
            var control = this.control;
            prepareMonths(control);
            control.get('tbodyEl').html(this.renderTpl(MonthsTpl));
            control.get('yearSelectContentEl').html(value.getYear());
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: MonthPanelTpl
            }
        }
    });
});
/**
 * @ignore
 * month panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/month-panel/control',['node', 'component/control', '../year-panel/control', './render', 'event/gesture/tap'], function (S, require) {
    var Node = require('node'),
        Control = require('component/control'),
        YearPanel = require('../year-panel/control'),
        MonthPanelRender = require('./render');

    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }

    function nextYear(e) {
        e.preventDefault();
        goYear(this, 1);
    }

    function prevYear(e) {
        e.preventDefault();
        goYear(this, -1);
    }

    function chooseCell(e) {
        e.preventDefault();
        var td = $(e.currentTarget);
        var tr = td.parent();
        var tdIndex = td.index();
        var trIndex = tr.index();
        var value = this.get('value').clone();
        value.setMonth(trIndex * 4 + tdIndex);
        this.fire('select', {
            value: value
        });
    }

    function showYearPanel(e) {
        e.preventDefault();
        var yearPanel = this.get('yearPanel');
        yearPanel.set('value', this.get('value'));
        yearPanel.show();
    }

    function setUpYearPanel() {
        var self = this;
        var yearPanel = new YearPanel({
            locale: this.get('locale'),
            render: self.get('render')
        });
        yearPanel.on('select', onYearPanelSelect, self);
        return yearPanel;
    }

    function onYearPanelSelect(e) {
        this.set('value', e.value);
        this.get('yearPanel').hide();
    }

    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextYearBtn').on(tap, nextYear, self);
            self.get('previousYearBtn').on(tap, prevYear, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
            self.get('yearSelectEl').on(tap, showYearPanel, self);
        }
    }, {
        xclass: 'date-picker-month-panel',
        ATTRS: {
            focusable: {
                value: false
            },
            value: {
                render: 1
            },
            yearPanel: {
                valueFn: setUpYearPanel
            },
            xrender: {
                value: MonthPanelRender
            }
        }
    });
});
/**
 * @ignore
 * year panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/control',['node', 'date/gregorian', 'i18n!date/picker', 'component/control', './render', './month-panel/control', 'event/gesture/tap'], function (S, require) {
    var Node = require('node'),
        GregorianCalendar = require('date/gregorian'),
        locale = require('i18n!date/picker'),
        Control = require('component/control'),
        PickerRender = require('./render'),
        MonthPanel = require('./month-panel/control');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;
    var KeyCode = Node.KeyCode;

    function goStartMonth(self) {
        var next = self.get('value').clone();
        next.setDayOfMonth(1);
        self.set('value', next);
    }

    function goEndMonth(self) {
        var next = self.get('value').clone();
        next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
        self.set('value', next);
    }

    function goMonth(self, direction) {
        var next = self.get('value').clone();
        next.addMonth(direction);
        self.set('value', next);
    }

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }

    function goWeek(self, direction) {
        var next = self.get('value').clone();
        next.addWeekOfYear(direction);
        self.set('value', next);
    }

    function goDay(self, direction) {
        var next = self.get('value').clone();
        next.addDayOfMonth(direction);
        self.set('value', next);
    }

    function nextMonth(e) {
        e.preventDefault();
        goMonth(this, 1);
    }

    function prevMonth(e) {
        e.preventDefault();
        goMonth(this, -1);
    }

    function nextYear(e) {
        e.preventDefault();
        goYear(this, 1);
    }

    function prevYear(e) {
        e.preventDefault();
        goYear(this, -1);
    }

    function chooseCell(e) {
        var self = this;
        self.set('clear', false);
        var disabledDate = self.get('disabledDate');
        e.preventDefault();
        var td = $(e.currentTarget);
        var value = self.dateTable[parseInt(td.attr('data-index'), 10)];
        if (disabledDate && disabledDate(value, self.get('value'))) {
            return;
        }
        // fix call focus in select handler
        setTimeout(function () {
            self.set('value', value);
            self.fire('select', {
                value: value
            });
        }, 0);
    }

    function showMonthPanel(e) {
        e.preventDefault();
        var monthPanel = this.get('monthPanel');
        monthPanel.set('value', this.get('value'));
        monthPanel.show();
    }

    function setUpMonthPanel() {
        var self = this;
        var monthPanel = new MonthPanel({
            locale: this.get('locale'),
            render: self.get('el')
        });
        monthPanel.on('select', onMonthPanelSelect, self);
        return monthPanel;
    }

    function onMonthPanelSelect(e) {
        this.set('value', e.value);
        this.get('monthPanel').hide();
    }

    function chooseToday(e) {
        e.preventDefault();
        this.set('clear', false);
        var today = this.get('value').clone();
        today.setTime(S.now());
        this.set('value', today);
    }

    function toggleClear() {
        var self = this,
            v = !self.get('clear');
        if (!v) {
            var value = self.get('value');
            value.setDayOfMonth(1);
            self.set('clear', false);
        } else {
            self.set('clear', true);
        }
    }

    function onClearClick(e) {
        e.preventDefault();
        if (!this.get('clear')) {
            toggleClear.call(this);
        }
        this.fire('select', {
            value: null
        });
    }

    /**
     * date picker ui component
     * @class KISSY.Date.Picker
     * @extends KISSY.Component.Control
     */
    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextMonthBtn').on(tap, nextMonth, self);
            self.get('previousMonthBtn').on(tap, prevMonth, self);
            self.get('nextYearBtn').on(tap, nextYear, self);
            self.get('previousYearBtn').on(tap, prevYear, self);
            self.get('tbodyEl').delegate(
                tap,
                    '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
            self.get('monthSelectEl').on(tap, showMonthPanel, self);
            self.get('todayBtnEl').on(tap, chooseToday, self);
            self.get('clearBtnEl').on(tap, onClearClick, self);
        },
        handleKeyDownInternal: function (e) {
            var self = this;
            var keyCode = e.keyCode;
            var ctrlKey = e.ctrlKey;
            switch (keyCode) {
                case KeyCode.SPACE:
                    self.set('clear', !self.get('clear'));
                    return true;
            }
            if (this.get('clear')) {
                switch (keyCode) {
                    case KeyCode.DOWN:
                    case KeyCode.UP:
                    case KeyCode.LEFT:
                    case KeyCode.RIGHT:
                        if (!ctrlKey) {
                            toggleClear.call(self);
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
                        self.fire('select', {
                            value: null
                        });
                        return true;
                }
            }
            switch (keyCode) {
                case KeyCode.DOWN:
                    goWeek(self, 1);
                    return true;
                case KeyCode.UP:
                    goWeek(self, -1);
                    return true;
                case KeyCode.LEFT:
                    if (ctrlKey) {
                        goYear(self, -1);
                    } else {
                        goDay(self, -1);
                    }
                    return true;
                case KeyCode.RIGHT:
                    if (ctrlKey) {
                        goYear(self, 1);
                    } else {
                        goDay(self, 1);
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
                    self.fire('select', {
                        value: self.get('value')
                    });
                    return true;
            }
            return undefined;
        }
    }, {
        xclass: 'date-picker',
        ATTRS: {
            focusable: {
                value: true
            },
            /**
             * current selected value of current date picker
             * @cfg {KISSY.Date.Gregorian} value
             */
            /**
             * @ignore
             */
            value: {
                render: 1,
                valueFn: function () {
                    var date = new GregorianCalendar();
                    date.setTime(S.now());
                    return date;
                }
            },
            previousMonthBtn: {},
            monthSelectEl: {},
            monthPanel: {
                valueFn: setUpMonthPanel
            },
            nextMonthBtn: {},
            tbodyEl: {},
            todayBtnEl: {},
            /**
             * function used to render a date cell
             *
             *      function(current){
             *          return '<a>'+current.getDay()+'</a>';
             *      }
             *
             * @cfg {Function} dateRender
             */
            /**
             * @ignore
             */
            dateRender: {},
            /**
             * function used to judge whether this date cell is disabled
             *
             *      function(current){
             *          // before 2010 is disabled
             *          return current.getYear()<2010;
             *      }
             *
             * @cfg {Function} disabledDate
             */
            /**
             * @ignore
             */
            disabledDate: {},
            /**
             * locale object for date picker
             * @cfg {Object} locale
             */
            /**
             * @ignore
             */
            locale: {
                value: locale
            },
            /**
             * whether to show today button.
             * Defaults to true.
             * @cfg {Boolean} showToday
             */
            /**
             * @ignore
             */
            showToday: {
                render: 1,
                value: true
            },
            /**
             * whether to show clear button.
             * Defaults to true.
             * @cfg {Boolean} showClear
             */
            /**
             * @ignore
             */
            showClear: {
                render: 1,
                value: true
            },
            clear: {
                render: 1,
                value: false
            },
            /**
             * whether to show week number column.
             * Defaults to true.
             * @cfg {Boolean} showWeekNumber
             */
            /**
             * @ignore
             */
            showWeekNumber: {
                render: 1,
                value: true
            },
            xrender: {
                value: PickerRender
            }
        }
    });
});
/*
 keyboard
 - http://www.w3.org/TR/wai-aria-practices/#datepicker
 */
/**
 * @ignore
 * date picker ui
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker',['./picker/control'], function (S, require) {
    return require('./picker/control');
});
