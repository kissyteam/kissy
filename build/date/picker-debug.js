/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 26 16:05
*/
/*
combined modules:
date/picker
date/picker/month-panel/control
date/picker/year-panel/control
date/picker/decade-panel/control
date/picker/decade-panel/decade-panel-xtpl
date/picker/decade-panel/decades-xtpl
date/picker/year-panel/years-xtpl
date/picker/year-panel/year-panel-xtpl
date/picker/month-panel/months-xtpl
date/picker/month-panel/month-panel-xtpl
*/
KISSY.add('date/picker', [
    'util',
    'node',
    'date/gregorian',
    'i18n!date/picker',
    'component/control',
    './picker/month-panel/control',
    'event/gesture/tap',
    'date/format',
    'date/picker-xtpl'
], function (S, require, exports, module) {
    /**
 * @ignore
 * year panel for date picker
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var $ = require('node'), GregorianCalendar = require('date/gregorian'), locale = require('i18n!date/picker'), Control = require('component/control'), MonthPanel = require('./picker/month-panel/control');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var KeyCode = $.Event.KeyCode;
    var DateTimeFormat = require('date/format'), PickerTpl = require('date/picker-xtpl');
    var dateRowTplStart = '<tr role="row">';
    var dateRowTplEnd = '</tr>';
    var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
    var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
    var dateTpl = '<a ' + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
    var DATE_ROW_COUNT = 6;
    var DATE_COL_COUNT = 7;
    function getIdFromDate(d) {
        return 'ks-date-picker-date-' + d.getYear() + '-' + d.getMonth() + '-' + d.getDayOfMonth();
    }
    function isSameDay(one, two) {
        return one.getYear() === two.getYear() && one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth();
    }
    function isSameMonth(one, two) {
        return one.getYear() === two.getYear() && one.getMonth() === two.getMonth();
    }
    function beforeCurrentMonthYear(current, today) {
        if (current.getYear() < today.getYear()) {
            return 1;
        }
        return current.getYear() === today.getYear() && current.getMonth() < today.getMonth();
    }
    function afterCurrentMonthYear(current, today) {
        if (current.getYear() > today.getYear()) {
            return 1;
        }
        return current.getYear() === today.getYear() && current.getMonth() > today.getMonth();
    }
    function renderDatesCmd() {
        return this.root.config.control.renderDates();
    }
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
    function previousMonth(e) {
        e.preventDefault();
        goMonth(this, -1);
    }
    function nextYear(e) {
        e.preventDefault();
        goYear(this, 1);
    }
    function previousYear(e) {
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
        }    // fix call focus in select handler
        // fix call focus in select handler
        setTimeout(function () {
            self.set('value', value);
            self.fire('select', { value: value });
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
        today.setTime(util.now());
        this.set('value', today);
    }
    function toggleClear() {
        var self = this, v = !self.get('clear');
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
        this.fire('select', { value: null });
    }    /**
 * date picker ui component
 * @class KISSY.Date.Picker
 * @extends KISSY.Component.Control
 */
    /**
 * date picker ui component
 * @class KISSY.Date.Picker
 * @extends KISSY.Component.Control
 */
    module.exports = Control.extend({
        beforeCreateDom: function (renderData, renderCommands) {
            var self = this;
            var locale = self.get('locale');
            var value = self.get('value');
            var dateLocale = value.getLocale();
            var veryShortWeekdays = [];
            var weekDays = [];
            var firstDayOfWeek = value.getFirstDayOfWeek();
            for (var i = 0; i < DATE_COL_COUNT; i++) {
                var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
                veryShortWeekdays[i] = locale.veryShortWeekdays[index];
                weekDays[i] = dateLocale.weekdays[index];
            }
            util.mix(renderData, {
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
        createDom: function () {
            this.$el.attr('aria-activedescendant', getIdFromDate(this.get('value')));
        },
        bindUI: function () {
            var self = this;
            self.get('nextMonthBtn').on(tap, nextMonth, self);
            self.get('previousMonthBtn').on(tap, previousMonth, self);
            self.get('nextYearBtn').on(tap, nextYear, self);
            self.get('previousYearBtn').on(tap, previousYear, self);
            self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
            self.get('monthSelectEl').on(tap, showMonthPanel, self);
            self.get('todayBtnEl').on(tap, chooseToday, self);
            self.get('clearBtnEl').on(tap, onClearClick, self);
        },
        getMonthYearLabel: function () {
            var self = this;
            var locale = self.get('locale');
            var value = self.get('value');
            var dateLocale = value.getLocale();
            return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
        },
        getTodayTimeLabel: function () {
            var self = this;
            var locale = self.get('locale');
            var value = self.get('value');
            var dateLocale = value.getLocale();
            var today = value.clone();
            today.setTime(util.now());
            return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
        },
        renderDates: function () {
            var self = this, i, j, dateTable = [], current, isClear = self.get('clear'), showWeekNumber = self.get('showWeekNumber'), locale = self.get('locale'), value = self.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = self.get('dateRender'), disabledDate = self.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
            today.setTime(util.now());
            var month1 = value.clone();
            month1.set(value.getYear(), value.getMonth(), 1);
            var day = month1.getDayOfWeek();
            var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;    // calculate last month
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
                    rowHtml += util.substitute(weekNumberCellTpl, {
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
                        dateHtml = util.substitute(dateTpl, {
                            cls: dateClass,
                            id: getIdFromDate(current),
                            selected: selected,
                            disabled: disabled,
                            content: current.getDayOfMonth()
                        });
                    }
                    rowHtml += util.substitute(dateCellTpl, {
                        cls: cls,
                        index: passed,
                        title: dateFormatter.format(current),
                        content: dateHtml
                    });
                    passed++;
                }
                tableHtml += rowHtml + dateRowTplEnd;
            }
            self.dateTable = dateTable;
            return tableHtml;
        },
        _onSetClear: function (v) {
            var self = this;
            var value = self.get('value');
            var selectedCls = this.getBaseCssClasses('selected-day');
            var id = getIdFromDate(value);
            var currentA = this.$('#' + id);
            if (v) {
                currentA.parent().removeClass(selectedCls);
                currentA.attr('aria-selected', false);
                self.$el.attr('aria-activedescendant', '');
            } else {
                currentA.parent().addClass(selectedCls);
                currentA.attr('aria-selected', true);
                self.$el.attr('aria-activedescendant', id);
            }
        },
        // re render after current value change
        _onSetValue: function (value, e) {
            var self = this;
            var preValue = e.prevVal;
            if (isSameMonth(preValue, value)) {
                var disabledDate = self.get('disabledDate');
                var selectedCls = self.getBaseCssClasses('selected-day');
                var prevA = self.$('#' + getIdFromDate(preValue));
                prevA.parent().removeClass(selectedCls);
                prevA.attr('aria-selected', false);
                if (!(disabledDate && disabledDate(value, value))) {
                    var currentA = self.$('#' + getIdFromDate(value));
                    currentA.parent().addClass(selectedCls);
                    currentA.attr('aria-selected', true);
                }
            } else {
                var tbodyEl = self.get('tbodyEl');
                var monthSelectContentEl = self.get('monthSelectContentEl');
                var todayBtnEl = self.get('todayBtnEl');
                monthSelectContentEl.html(self.getMonthYearLabel());
                todayBtnEl.attr('title', self.getTodayTimeLabel());
                tbodyEl.html(self.renderDates());
            }
            self.$el.attr('aria-activedescendant', getIdFromDate(value));
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
                    self.fire('select', { value: null });
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
                self.fire('select', { value: self.get('value') });
                return true;
            }
            return undefined;
        }
    }, {
        xclass: 'date-picker',
        ATTRS: {
            handleGestureEvents: { value: true },
            focusable: { value: true },
            allowTextSelection: { value: false },
            contentTpl: { value: PickerTpl },
            /**
         * current selected value of current date picker
         * @cfg {KISSY.Date.Gregorian} value
         */
            /**
         * @ignore
         */
            value: {
                render: 1,
                sync: 0,
                valueFn: function () {
                    var date = new GregorianCalendar();
                    date.setTime(util.now());
                    return date;
                }
            },
            previousYearBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('prev-year-btn');
                }
            },
            nextYearBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('next-year-btn');
                }
            },
            previousMonthBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('prev-month-btn');
                }
            },
            monthSelectEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('month-select');
                }
            },
            monthSelectContentEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('month-select-content');
                }
            },
            monthPanel: { valueFn: setUpMonthPanel },
            nextMonthBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('next-month-btn');
                }
            },
            clearBtnEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('clear-btn');
                }
            },
            tbodyEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('tbody');
                }
            },
            todayBtnEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('today-btn');
                }
            },
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
            locale: { value: locale },
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
            }
        }
    });    /*
 keyboard
 - http://www.w3.org/TR/wai-aria-practices/#datepicker
 */
});





KISSY.add('date/picker/month-panel/control', [
    'util',
    'component/control',
    '../year-panel/control',
    'date/format',
    './months-xtpl',
    './month-panel-xtpl',
    'event/gesture/tap',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * month panel for date picker
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Control = require('component/control'), YearPanel = require('../year-panel/control');
    var DateFormat = require('date/format'), MonthsTpl = require('./months-xtpl'), MonthPanelTpl = require('./month-panel-xtpl');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = require('node');
    function prepareMonths(self) {
        var value = self.get('value');
        var currentMonth = value.getMonth();
        var current = value.clone();
        var locale = self.get('locale');
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
        util.mix(self.renderData, {
            months: months,
            year: value.getYear(),
            month: currentMonth
        });
        self.months = months;
        return months;
    }
    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }
    function nextYear(e) {
        e.preventDefault();
        goYear(this, 1);
    }
    function previousYear(e) {
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
        this.fire('select', { value: value });
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
    module.exports = Control.extend({
        beforeCreateDom: function (renderData) {
            var self = this;
            var locale = self.get('locale');
            util.mix(renderData, {
                yearSelectLabel: locale.yearSelect,
                previousYearLabel: locale.previousYear,
                nextYearLabel: locale.nextYear
            });
            prepareMonths(self);
        },
        bindUI: function () {
            var self = this;
            self.get('nextYearBtn').on(tap, nextYear, self);
            self.get('previousYearBtn').on(tap, previousYear, self);
            self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
            self.get('yearSelectEl').on(tap, showYearPanel, self);
        },
        _onSetValue: function (value) {
            var self = this;
            prepareMonths(self);
            self.get('tbodyEl').html(this.renderTpl(MonthsTpl));
            self.get('yearSelectContentEl').html(value.getYear());
        }
    }, {
        xclass: 'date-picker-month-panel',
        ATTRS: {
            contentTpl: { value: MonthPanelTpl },
            focusable: { value: false },
            value: { render: 1 },
            yearPanel: { valueFn: setUpYearPanel },
            tbodyEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('tbody');
                }
            },
            previousYearBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('prev-year-btn');
                }
            },
            nextYearBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('next-year-btn');
                }
            },
            yearSelectEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('year-select');
                }
            },
            yearSelectContentEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('year-select-content');
                }
            }
        }
    });
});
KISSY.add('date/picker/year-panel/control', [
    'util',
    'component/control',
    '../decade-panel/control',
    'event/gesture/tap',
    'node',
    'date/format',
    './years-xtpl',
    './year-panel-xtpl'
], function (S, require, exports, module) {
    /**
 * @ignore
 * month select for date picker
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Control = require('component/control'), DecadePanel = require('../decade-panel/control');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = require('node');
    var DateFormat = require('date/format'), YearsTpl = require('./years-xtpl'), YearPanelTpl = require('./year-panel-xtpl');
    function prepareYears(self) {
        var value = self.get('value');
        var currentYear = value.getYear();
        var startYear = parseInt(currentYear / 10, 10) * 10;
        var preYear = startYear - 1;
        var current = value.clone();
        var locale = self.get('locale');
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
        self.years = years;
        return years;
    }
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
        this.fire('select', { value: value });
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
    module.exports = Control.extend({
        beforeCreateDom: function (renderData) {
            var self = this;
            var value = self.get('value');
            var currentYear = value.getYear();
            var startYear = parseInt(currentYear / 10, 10) * 10;
            var endYear = startYear + 9;
            var locale = self.get('locale');
            util.mix(renderData, {
                decadeSelectLabel: locale.decadeSelect,
                years: prepareYears(self),
                startYear: startYear,
                endYear: endYear,
                year: value.getYear(),
                previousDecadeLabel: locale.previousDecade,
                nextDecadeLabel: locale.nextDecade
            });
        },
        bindUI: function () {
            var self = this;
            self.get('nextDecadeBtn').on(tap, nextDecade, self);
            self.get('previousDecadeBtn').on(tap, prevDecade, self);
            self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
            self.get('decadeSelectEl').on(tap, showDecadePanel, self);
        },
        _onSetValue: function (value) {
            var self = this;
            var currentYear = value.getYear();
            var startYear = parseInt(currentYear / 10, 10) * 10;
            var endYear = startYear + 9;
            util.mix(self.renderData, {
                startYear: startYear,
                endYear: endYear,
                years: prepareYears(self),
                year: value.getYear()
            });
            self.get('tbodyEl').html(this.renderTpl(YearsTpl));
            self.get('decadeSelectContentEl').html(startYear + '-' + endYear);
        }
    }, {
        xclass: 'date-picker-year-panel',
        ATTRS: {
            contentTpl: { value: YearPanelTpl },
            focusable: { value: false },
            value: { render: 1 },
            decadePanel: { valueFn: setUpDecadePanel },
            tbodyEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('tbody');
                }
            },
            previousDecadeBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('prev-decade-btn');
                }
            },
            nextDecadeBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('next-decade-btn');
                }
            },
            decadeSelectEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('decade-select');
                }
            },
            decadeSelectContentEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('decade-select-content');
                }
            }
        }
    });
});
KISSY.add('date/picker/decade-panel/control', [
    'util',
    'event/gesture/tap',
    'node',
    'component/control',
    './decade-panel-xtpl',
    './decades-xtpl'
], function (S, require, exports, module) {
    /**
 * @ignore
 * decade panel for date picker
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = require('node');
    var Control = require('component/control'), DecadePanelTpl = require('./decade-panel-xtpl'), MonthsTpl = require('./decades-xtpl');
    function prepareYears(self, view) {
        var value = self.get('value');
        var currentYear = value.getYear();
        var startYear = parseInt(currentYear / 100, 10) * 100;
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
        self.decades = decades;
        util.mix(view.renderData, {
            startYear: startYear,
            endYear: endYear,
            year: currentYear,
            decades: decades
        });
    }
    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }
    function nextCentury(e) {
        e.preventDefault();
        goYear(this, 100);
    }
    function previousCentury(e) {
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
        this.fire('select', { value: value });
    }
    module.exports = Control.extend({
        beforeCreateDom: function (renderData, childrenSelectors) {
            var self = this;
            var locale = self.get('locale');
            prepareYears(self, this);
            util.mix(renderData, {
                previousCenturyLabel: locale.previousCentury,
                nextCenturyLabel: locale.nextCentury
            });
            util.mix(childrenSelectors, {
                tbodyEl: '#ks-date-picker-decade-panel-tbody-{id}',
                previousCenturyBtn: '#ks-date-picker-decade-panel-previous-century-btn-{id}',
                centuryEl: '#ks-date-picker-decade-panel-century-{id}',
                nextCenturyBtn: '#ks-date-picker-decade-panel-next-century-btn-{id}'
            });
        },
        bindUI: function () {
            var self = this;
            self.get('nextCenturyBtn').on(tap, nextCentury, self);
            self.get('previousCenturyBtn').on(tap, previousCentury, self);
            self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
        },
        _onSetValue: function () {
            var self = this;
            prepareYears(self, this);
            var startYear = this.renderData.startYear;
            var endYear = this.renderData.endYear;
            self.get('tbodyEl').html(this.renderTpl(MonthsTpl));
            self.get('centuryEl').html(startYear + '-' + endYear);
        }
    }, {
        xclass: 'date-picker-decade-panel',
        ATTRS: {
            contentTpl: { value: DecadePanelTpl },
            focusable: { value: false },
            value: { render: 1 },
            tbodyEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('tbody');
                }
            },
            previousCenturyBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('prev-century-btn');
                }
            },
            nextCenturyBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('next-century-btn');
                }
            },
            centuryEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('century');
                }
            }
        }
    });
});

KISSY.add('date/picker/decade-panel/decade-panel-xtpl', ['./decades-xtpl'], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function decadePanelXtpl(scope, buffer, undefined) {
        var tpl = this;
        var pos = tpl.pos = {
                line: 1,
                col: 1
            };
        var nativeCommands = tpl.root.nativeCommands;
        var utils = tpl.root.utils;
        var callFnUtil = utils['callFn'];
        var callCommandUtil = utils['callCommand'];
        var rangeCommand = nativeCommands['range'];
        var eachCommand = nativeCommands['each'];
        var withCommand = nativeCommands['with'];
        var ifCommand = nativeCommands['if'];
        var setCommand = nativeCommands['set'];
        var includeCommand = nativeCommands['include'];
        var parseCommand = nativeCommands['parse'];
        var extendCommand = nativeCommands['extend'];
        var blockCommand = nativeCommands['block'];
        var macroCommand = nativeCommands['macro'];
        var debuggerCommand = nativeCommands['debugger'];
        buffer.append('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        pos.line = 1;
        pos.col = 33;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses']);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.writeEscaped(callRet2);
        buffer.append('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-century-btn');
        option3.params = params4;
        var callRet5;
        pos.line = 2;
        pos.col = 34;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses']);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.writeEscaped(callRet5);
        buffer.append('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousCenturyLabel']);
        buffer.writeEscaped(id6);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n    <div class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('century');
        option7.params = params8;
        var callRet9;
        pos.line = 8;
        pos.col = 36;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses']);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.writeEscaped(callRet9);
        buffer.append('">\r\n                ');
        var id10 = scope.resolve(['startYear']);
        buffer.writeEscaped(id10);
        buffer.append('-');
        var id11 = scope.resolve(['endYear']);
        buffer.writeEscaped(id11);
        buffer.append('\r\n    </div>\r\n    <a class="');
        var option12 = { escape: 1 };
        var params13 = [];
        params13.push('next-century-btn');
        option12.params = params13;
        var callRet14;
        pos.line = 11;
        pos.col = 34;
        callRet14 = callFnUtil(tpl, scope, option12, buffer, ['getBaseCssClasses']);
        if (callRet14 && callRet14.isBuffer) {
            buffer = callRet14;
            callRet14 = undefined;
        }
        buffer.writeEscaped(callRet14);
        buffer.append('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id15 = scope.resolve(['nextCenturyLabel']);
        buffer.writeEscaped(id15);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option16 = { escape: 1 };
        var params17 = [];
        params17.push('body');
        option16.params = params17;
        var callRet18;
        pos.line = 18;
        pos.col = 32;
        callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses']);
        if (callRet18 && callRet18.isBuffer) {
            buffer = callRet18;
            callRet18 = undefined;
        }
        buffer.writeEscaped(callRet18);
        buffer.append('">\r\n    <table class="');
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('table');
        option19.params = params20;
        var callRet21;
        pos.line = 19;
        pos.col = 38;
        callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses']);
        if (callRet21 && callRet21.isBuffer) {
            buffer = callRet21;
            callRet21 = undefined;
        }
        buffer.writeEscaped(callRet21);
        buffer.append('" cellspacing="0" role="grid">\r\n        <tbody class="');
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('tbody');
        option22.params = params23;
        var callRet24;
        pos.line = 20;
        pos.col = 42;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses']);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.writeEscaped(callRet24);
        buffer.append('">\r\n        ');
        var option25 = {};
        var params26 = [];
        params26.push('./decades-xtpl');
        option25.params = params26;
        require('./decades-xtpl');
        var callRet27;
        pos.line = 21;
        pos.col = 19;
        callRet27 = includeCommand.call(tpl, scope, option25, buffer);
        if (callRet27 && callRet27.isBuffer) {
            buffer = callRet27;
            callRet27 = undefined;
        }
        buffer.write(callRet27);
        buffer.append('\r\n        </tbody>\r\n    </table>\r\n</div>');
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/decade-panel/decades-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function decadesXtpl(scope, buffer, undefined) {
        var tpl = this;
        var pos = tpl.pos = {
                line: 1,
                col: 1
            };
        var nativeCommands = tpl.root.nativeCommands;
        var utils = tpl.root.utils;
        var callFnUtil = utils['callFn'];
        var callCommandUtil = utils['callCommand'];
        var rangeCommand = nativeCommands['range'];
        var eachCommand = nativeCommands['each'];
        var withCommand = nativeCommands['with'];
        var ifCommand = nativeCommands['if'];
        var setCommand = nativeCommands['set'];
        var includeCommand = nativeCommands['include'];
        var parseCommand = nativeCommands['parse'];
        var extendCommand = nativeCommands['extend'];
        var blockCommand = nativeCommands['block'];
        var macroCommand = nativeCommands['macro'];
        var debuggerCommand = nativeCommands['debugger'];
        buffer.append('');
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['decades']);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.append('\r\n<tr role="row">\r\n    ');
            var option3 = { escape: 1 };
            var params4 = [];
            var id6 = scope.resolve(['xindex']);
            var id5 = scope.resolve([
                    'decades',
                    id6
                ]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.append('\r\n    <td role="gridcell"\r\n        class="');
                var option7 = { escape: 1 };
                var params8 = [];
                params8.push('cell');
                option7.params = params8;
                var callRet9;
                pos.line = 5;
                pos.col = 35;
                callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses']);
                if (callRet9 && callRet9.isBuffer) {
                    buffer = callRet9;
                    callRet9 = undefined;
                }
                buffer.writeEscaped(callRet9);
                buffer.append('\r\n        ');
                var option10 = { escape: 1 };
                var params11 = [];
                var id12 = scope.resolve(['startDecade']);
                var exp14 = id12;
                var id13 = scope.resolve(['year']);
                exp14 = id12 <= id13;
                var exp18 = exp14;
                if (exp18) {
                    var id15 = scope.resolve(['year']);
                    var exp17 = id15;
                    var id16 = scope.resolve(['endDecade']);
                    exp17 = id15 <= id16;
                    exp18 = exp17;
                }
                params11.push(exp18);
                option10.params = params11;
                option10.fn = function (scope, buffer) {
                    buffer.append('\r\n         ');
                    var option19 = { escape: 1 };
                    var params20 = [];
                    params20.push('selected-cell');
                    option19.params = params20;
                    var callRet21;
                    pos.line = 7;
                    pos.col = 29;
                    callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses']);
                    if (callRet21 && callRet21.isBuffer) {
                        buffer = callRet21;
                        callRet21 = undefined;
                    }
                    buffer.writeEscaped(callRet21);
                    buffer.append('\r\n        ');
                    return buffer;
                };
                pos.line = 6;
                pos.col = 14;
                buffer = ifCommand.call(tpl, scope, option10, buffer);
                buffer.append('\r\n        ');
                var option22 = { escape: 1 };
                var params23 = [];
                var id24 = scope.resolve(['startDecade']);
                var exp26 = id24;
                var id25 = scope.resolve(['startYear']);
                exp26 = id24 < id25;
                params23.push(exp26);
                option22.params = params23;
                option22.fn = function (scope, buffer) {
                    buffer.append('\r\n         ');
                    var option27 = { escape: 1 };
                    var params28 = [];
                    params28.push('last-century-cell');
                    option27.params = params28;
                    var callRet29;
                    pos.line = 10;
                    pos.col = 29;
                    callRet29 = callFnUtil(tpl, scope, option27, buffer, ['getBaseCssClasses']);
                    if (callRet29 && callRet29.isBuffer) {
                        buffer = callRet29;
                        callRet29 = undefined;
                    }
                    buffer.writeEscaped(callRet29);
                    buffer.append('\r\n        ');
                    return buffer;
                };
                pos.line = 9;
                pos.col = 14;
                buffer = ifCommand.call(tpl, scope, option22, buffer);
                buffer.append('\r\n        ');
                var option30 = { escape: 1 };
                var params31 = [];
                var id32 = scope.resolve(['endDecade']);
                var exp34 = id32;
                var id33 = scope.resolve(['endYear']);
                exp34 = id32 > id33;
                params31.push(exp34);
                option30.params = params31;
                option30.fn = function (scope, buffer) {
                    buffer.append('\r\n         ');
                    var option35 = { escape: 1 };
                    var params36 = [];
                    params36.push('next-century-cell');
                    option35.params = params36;
                    var callRet37;
                    pos.line = 13;
                    pos.col = 29;
                    callRet37 = callFnUtil(tpl, scope, option35, buffer, ['getBaseCssClasses']);
                    if (callRet37 && callRet37.isBuffer) {
                        buffer = callRet37;
                        callRet37 = undefined;
                    }
                    buffer.writeEscaped(callRet37);
                    buffer.append('\r\n        ');
                    return buffer;
                };
                pos.line = 12;
                pos.col = 14;
                buffer = ifCommand.call(tpl, scope, option30, buffer);
                buffer.append('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="');
                var option38 = { escape: 1 };
                var params39 = [];
                params39.push('decade');
                option38.params = params39;
                var callRet40;
                pos.line = 19;
                pos.col = 38;
                callRet40 = callFnUtil(tpl, scope, option38, buffer, ['getBaseCssClasses']);
                if (callRet40 && callRet40.isBuffer) {
                    buffer = callRet40;
                    callRet40 = undefined;
                }
                buffer.writeEscaped(callRet40);
                buffer.append('">\r\n            ');
                var id41 = scope.resolve(['startDecade']);
                buffer.writeEscaped(id41);
                buffer.append('-');
                var id42 = scope.resolve(['endDecade']);
                buffer.writeEscaped(id42);
                buffer.append('\r\n        </a>\r\n    </td>\r\n    ');
                return buffer;
            };
            pos.line = 3;
            pos.col = 12;
            buffer = eachCommand.call(tpl, scope, option3, buffer);
            buffer.append('\r\n</tr>\r\n');
            return buffer;
        };
        pos.line = 1;
        pos.col = 9;
        buffer = eachCommand.call(tpl, scope, option0, buffer);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});

KISSY.add('date/picker/year-panel/years-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function yearsXtpl(scope, buffer, undefined) {
        var tpl = this;
        var pos = tpl.pos = {
                line: 1,
                col: 1
            };
        var nativeCommands = tpl.root.nativeCommands;
        var utils = tpl.root.utils;
        var callFnUtil = utils['callFn'];
        var callCommandUtil = utils['callCommand'];
        var rangeCommand = nativeCommands['range'];
        var eachCommand = nativeCommands['each'];
        var withCommand = nativeCommands['with'];
        var ifCommand = nativeCommands['if'];
        var setCommand = nativeCommands['set'];
        var includeCommand = nativeCommands['include'];
        var parseCommand = nativeCommands['parse'];
        var extendCommand = nativeCommands['extend'];
        var blockCommand = nativeCommands['block'];
        var macroCommand = nativeCommands['macro'];
        var debuggerCommand = nativeCommands['debugger'];
        buffer.append('');
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['years']);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.append('\r\n<tr role="row">\r\n    ');
            var option3 = { escape: 1 };
            var params4 = [];
            var id6 = scope.resolve(['xindex']);
            var id5 = scope.resolve([
                    'years',
                    id6
                ]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.append('\r\n    <td role="gridcell"\r\n        title="');
                var id7 = scope.resolve(['title']);
                buffer.writeEscaped(id7);
                buffer.append('"\r\n        class="');
                var option8 = { escape: 1 };
                var params9 = [];
                params9.push('cell');
                option8.params = params9;
                var callRet10;
                pos.line = 6;
                pos.col = 35;
                callRet10 = callFnUtil(tpl, scope, option8, buffer, ['getBaseCssClasses']);
                if (callRet10 && callRet10.isBuffer) {
                    buffer = callRet10;
                    callRet10 = undefined;
                }
                buffer.writeEscaped(callRet10);
                buffer.append('\r\n        ');
                var option11 = { escape: 1 };
                var params12 = [];
                var id13 = scope.resolve(['content']);
                var exp15 = id13;
                var id14 = scope.resolve(['year']);
                exp15 = id13 === id14;
                params12.push(exp15);
                option11.params = params12;
                option11.fn = function (scope, buffer) {
                    buffer.append('\r\n         ');
                    var option16 = { escape: 1 };
                    var params17 = [];
                    params17.push('selected-cell');
                    option16.params = params17;
                    var callRet18;
                    pos.line = 8;
                    pos.col = 29;
                    callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses']);
                    if (callRet18 && callRet18.isBuffer) {
                        buffer = callRet18;
                        callRet18 = undefined;
                    }
                    buffer.writeEscaped(callRet18);
                    buffer.append('\r\n        ');
                    return buffer;
                };
                pos.line = 7;
                pos.col = 14;
                buffer = ifCommand.call(tpl, scope, option11, buffer);
                buffer.append('\r\n        ');
                var option19 = { escape: 1 };
                var params20 = [];
                var id21 = scope.resolve(['content']);
                var exp23 = id21;
                var id22 = scope.resolve(['startYear']);
                exp23 = id21 < id22;
                params20.push(exp23);
                option19.params = params20;
                option19.fn = function (scope, buffer) {
                    buffer.append('\r\n         ');
                    var option24 = { escape: 1 };
                    var params25 = [];
                    params25.push('last-decade-cell');
                    option24.params = params25;
                    var callRet26;
                    pos.line = 11;
                    pos.col = 29;
                    callRet26 = callFnUtil(tpl, scope, option24, buffer, ['getBaseCssClasses']);
                    if (callRet26 && callRet26.isBuffer) {
                        buffer = callRet26;
                        callRet26 = undefined;
                    }
                    buffer.writeEscaped(callRet26);
                    buffer.append('\r\n        ');
                    return buffer;
                };
                pos.line = 10;
                pos.col = 14;
                buffer = ifCommand.call(tpl, scope, option19, buffer);
                buffer.append('\r\n        ');
                var option27 = { escape: 1 };
                var params28 = [];
                var id29 = scope.resolve(['content']);
                var exp31 = id29;
                var id30 = scope.resolve(['endYear']);
                exp31 = id29 > id30;
                params28.push(exp31);
                option27.params = params28;
                option27.fn = function (scope, buffer) {
                    buffer.append('\r\n         ');
                    var option32 = { escape: 1 };
                    var params33 = [];
                    params33.push('next-decade-cell');
                    option32.params = params33;
                    var callRet34;
                    pos.line = 14;
                    pos.col = 29;
                    callRet34 = callFnUtil(tpl, scope, option32, buffer, ['getBaseCssClasses']);
                    if (callRet34 && callRet34.isBuffer) {
                        buffer = callRet34;
                        callRet34 = undefined;
                    }
                    buffer.writeEscaped(callRet34);
                    buffer.append('\r\n        ');
                    return buffer;
                };
                pos.line = 13;
                pos.col = 14;
                buffer = ifCommand.call(tpl, scope, option27, buffer);
                buffer.append('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="');
                var option35 = { escape: 1 };
                var params36 = [];
                params36.push('year');
                option35.params = params36;
                var callRet37;
                pos.line = 20;
                pos.col = 38;
                callRet37 = callFnUtil(tpl, scope, option35, buffer, ['getBaseCssClasses']);
                if (callRet37 && callRet37.isBuffer) {
                    buffer = callRet37;
                    callRet37 = undefined;
                }
                buffer.writeEscaped(callRet37);
                buffer.append('">\r\n            ');
                var id38 = scope.resolve(['content']);
                buffer.writeEscaped(id38);
                buffer.append('\r\n        </a>\r\n    </td>\r\n    ');
                return buffer;
            };
            pos.line = 3;
            pos.col = 12;
            buffer = eachCommand.call(tpl, scope, option3, buffer);
            buffer.append('\r\n</tr>\r\n');
            return buffer;
        };
        pos.line = 1;
        pos.col = 9;
        buffer = eachCommand.call(tpl, scope, option0, buffer);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/year-panel/year-panel-xtpl', ['./years-xtpl'], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function yearPanelXtpl(scope, buffer, undefined) {
        var tpl = this;
        var pos = tpl.pos = {
                line: 1,
                col: 1
            };
        var nativeCommands = tpl.root.nativeCommands;
        var utils = tpl.root.utils;
        var callFnUtil = utils['callFn'];
        var callCommandUtil = utils['callCommand'];
        var rangeCommand = nativeCommands['range'];
        var eachCommand = nativeCommands['each'];
        var withCommand = nativeCommands['with'];
        var ifCommand = nativeCommands['if'];
        var setCommand = nativeCommands['set'];
        var includeCommand = nativeCommands['include'];
        var parseCommand = nativeCommands['parse'];
        var extendCommand = nativeCommands['extend'];
        var blockCommand = nativeCommands['block'];
        var macroCommand = nativeCommands['macro'];
        var debuggerCommand = nativeCommands['debugger'];
        buffer.append('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        pos.line = 1;
        pos.col = 33;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses']);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.writeEscaped(callRet2);
        buffer.append('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-decade-btn');
        option3.params = params4;
        var callRet5;
        pos.line = 2;
        pos.col = 34;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses']);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.writeEscaped(callRet5);
        buffer.append('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousDecadeLabel']);
        buffer.writeEscaped(id6);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('decade-select');
        option7.params = params8;
        var callRet9;
        pos.line = 9;
        pos.col = 34;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses']);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.writeEscaped(callRet9);
        buffer.append('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
        var id10 = scope.resolve(['decadeSelectLabel']);
        buffer.writeEscaped(id10);
        buffer.append('">\r\n            <span class="');
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('decade-select-content');
        option11.params = params12;
        var callRet13;
        pos.line = 14;
        pos.col = 45;
        callRet13 = callFnUtil(tpl, scope, option11, buffer, ['getBaseCssClasses']);
        if (callRet13 && callRet13.isBuffer) {
            buffer = callRet13;
            callRet13 = undefined;
        }
        buffer.writeEscaped(callRet13);
        buffer.append('">\r\n                ');
        var id14 = scope.resolve(['startYear']);
        buffer.writeEscaped(id14);
        buffer.append('-');
        var id15 = scope.resolve(['endYear']);
        buffer.writeEscaped(id15);
        buffer.append('\r\n            </span>\r\n        <span class="');
        var option16 = { escape: 1 };
        var params17 = [];
        params17.push('decade-select-arrow');
        option16.params = params17;
        var callRet18;
        pos.line = 17;
        pos.col = 41;
        callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses']);
        if (callRet18 && callRet18.isBuffer) {
            buffer = callRet18;
            callRet18 = undefined;
        }
        buffer.writeEscaped(callRet18);
        buffer.append('">x</span>\r\n    </a>\r\n\r\n    <a class="');
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('next-decade-btn');
        option19.params = params20;
        var callRet21;
        pos.line = 20;
        pos.col = 34;
        callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses']);
        if (callRet21 && callRet21.isBuffer) {
            buffer = callRet21;
            callRet21 = undefined;
        }
        buffer.writeEscaped(callRet21);
        buffer.append('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id22 = scope.resolve(['nextDecadeLabel']);
        buffer.writeEscaped(id22);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option23 = { escape: 1 };
        var params24 = [];
        params24.push('body');
        option23.params = params24;
        var callRet25;
        pos.line = 27;
        pos.col = 32;
        callRet25 = callFnUtil(tpl, scope, option23, buffer, ['getBaseCssClasses']);
        if (callRet25 && callRet25.isBuffer) {
            buffer = callRet25;
            callRet25 = undefined;
        }
        buffer.writeEscaped(callRet25);
        buffer.append('">\r\n    <table class="');
        var option26 = { escape: 1 };
        var params27 = [];
        params27.push('table');
        option26.params = params27;
        var callRet28;
        pos.line = 28;
        pos.col = 38;
        callRet28 = callFnUtil(tpl, scope, option26, buffer, ['getBaseCssClasses']);
        if (callRet28 && callRet28.isBuffer) {
            buffer = callRet28;
            callRet28 = undefined;
        }
        buffer.writeEscaped(callRet28);
        buffer.append('" cellspacing="0" role="grid">\r\n        <tbody class="');
        var option29 = { escape: 1 };
        var params30 = [];
        params30.push('tbody');
        option29.params = params30;
        var callRet31;
        pos.line = 29;
        pos.col = 42;
        callRet31 = callFnUtil(tpl, scope, option29, buffer, ['getBaseCssClasses']);
        if (callRet31 && callRet31.isBuffer) {
            buffer = callRet31;
            callRet31 = undefined;
        }
        buffer.writeEscaped(callRet31);
        buffer.append('">\r\n        ');
        var option32 = {};
        var params33 = [];
        params33.push('./years-xtpl');
        option32.params = params33;
        require('./years-xtpl');
        var callRet34;
        pos.line = 30;
        pos.col = 19;
        callRet34 = includeCommand.call(tpl, scope, option32, buffer);
        if (callRet34 && callRet34.isBuffer) {
            buffer = callRet34;
            callRet34 = undefined;
        }
        buffer.write(callRet34);
        buffer.append('\r\n        </tbody>\r\n    </table>\r\n</div>');
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/month-panel/months-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function monthsXtpl(scope, buffer, undefined) {
        var tpl = this;
        var pos = tpl.pos = {
                line: 1,
                col: 1
            };
        var nativeCommands = tpl.root.nativeCommands;
        var utils = tpl.root.utils;
        var callFnUtil = utils['callFn'];
        var callCommandUtil = utils['callCommand'];
        var rangeCommand = nativeCommands['range'];
        var eachCommand = nativeCommands['each'];
        var withCommand = nativeCommands['with'];
        var ifCommand = nativeCommands['if'];
        var setCommand = nativeCommands['set'];
        var includeCommand = nativeCommands['include'];
        var parseCommand = nativeCommands['parse'];
        var extendCommand = nativeCommands['extend'];
        var blockCommand = nativeCommands['block'];
        var macroCommand = nativeCommands['macro'];
        var debuggerCommand = nativeCommands['debugger'];
        buffer.append('');
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['months']);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.append('\r\n<tr role="row">\r\n    ');
            var option3 = { escape: 1 };
            var params4 = [];
            var id6 = scope.resolve(['xindex']);
            var id5 = scope.resolve([
                    'months',
                    id6
                ]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.append('\r\n    <td role="gridcell"\r\n        title="');
                var id7 = scope.resolve(['title']);
                buffer.writeEscaped(id7);
                buffer.append('"\r\n        class="');
                var option8 = { escape: 1 };
                var params9 = [];
                params9.push('cell');
                option8.params = params9;
                var callRet10;
                pos.line = 6;
                pos.col = 35;
                callRet10 = callFnUtil(tpl, scope, option8, buffer, ['getBaseCssClasses']);
                if (callRet10 && callRet10.isBuffer) {
                    buffer = callRet10;
                    callRet10 = undefined;
                }
                buffer.writeEscaped(callRet10);
                buffer.append('\r\n        ');
                var option11 = { escape: 1 };
                var params12 = [];
                var id13 = scope.resolve(['month']);
                var exp15 = id13;
                var id14 = scope.resolve(['value']);
                exp15 = id13 === id14;
                params12.push(exp15);
                option11.params = params12;
                option11.fn = function (scope, buffer) {
                    buffer.append('\r\n        ');
                    var option16 = { escape: 1 };
                    var params17 = [];
                    params17.push('selected-cell');
                    option16.params = params17;
                    var callRet18;
                    pos.line = 8;
                    pos.col = 28;
                    callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses']);
                    if (callRet18 && callRet18.isBuffer) {
                        buffer = callRet18;
                        callRet18 = undefined;
                    }
                    buffer.writeEscaped(callRet18);
                    buffer.append('\r\n        ');
                    return buffer;
                };
                pos.line = 7;
                pos.col = 14;
                buffer = ifCommand.call(tpl, scope, option11, buffer);
                buffer.append('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="');
                var option19 = { escape: 1 };
                var params20 = [];
                params20.push('month');
                option19.params = params20;
                var callRet21;
                pos.line = 14;
                pos.col = 38;
                callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses']);
                if (callRet21 && callRet21.isBuffer) {
                    buffer = callRet21;
                    callRet21 = undefined;
                }
                buffer.writeEscaped(callRet21);
                buffer.append('">\r\n            ');
                var id22 = scope.resolve(['content']);
                buffer.writeEscaped(id22);
                buffer.append('\r\n        </a>\r\n    </td>\r\n    ');
                return buffer;
            };
            pos.line = 3;
            pos.col = 12;
            buffer = eachCommand.call(tpl, scope, option3, buffer);
            buffer.append('\r\n</tr>\r\n');
            return buffer;
        };
        pos.line = 1;
        pos.col = 9;
        buffer = eachCommand.call(tpl, scope, option0, buffer);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/month-panel/month-panel-xtpl', ['./months-xtpl'], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function monthPanelXtpl(scope, buffer, undefined) {
        var tpl = this;
        var pos = tpl.pos = {
                line: 1,
                col: 1
            };
        var nativeCommands = tpl.root.nativeCommands;
        var utils = tpl.root.utils;
        var callFnUtil = utils['callFn'];
        var callCommandUtil = utils['callCommand'];
        var rangeCommand = nativeCommands['range'];
        var eachCommand = nativeCommands['each'];
        var withCommand = nativeCommands['with'];
        var ifCommand = nativeCommands['if'];
        var setCommand = nativeCommands['set'];
        var includeCommand = nativeCommands['include'];
        var parseCommand = nativeCommands['parse'];
        var extendCommand = nativeCommands['extend'];
        var blockCommand = nativeCommands['block'];
        var macroCommand = nativeCommands['macro'];
        var debuggerCommand = nativeCommands['debugger'];
        buffer.append('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        pos.line = 1;
        pos.col = 33;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses']);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.writeEscaped(callRet2);
        buffer.append('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-year-btn');
        option3.params = params4;
        var callRet5;
        pos.line = 2;
        pos.col = 34;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses']);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.writeEscaped(callRet5);
        buffer.append('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousYearLabel']);
        buffer.writeEscaped(id6);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('year-select');
        option7.params = params8;
        var callRet9;
        pos.line = 9;
        pos.col = 34;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses']);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.writeEscaped(callRet9);
        buffer.append('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
        var id10 = scope.resolve(['yearSelectLabel']);
        buffer.writeEscaped(id10);
        buffer.append('">\r\n        <span class="');
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('year-select-content');
        option11.params = params12;
        var callRet13;
        pos.line = 14;
        pos.col = 41;
        callRet13 = callFnUtil(tpl, scope, option11, buffer, ['getBaseCssClasses']);
        if (callRet13 && callRet13.isBuffer) {
            buffer = callRet13;
            callRet13 = undefined;
        }
        buffer.writeEscaped(callRet13);
        buffer.append('">');
        var id14 = scope.resolve(['year']);
        buffer.writeEscaped(id14);
        buffer.append('</span>\r\n        <span class="');
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('year-select-arrow');
        option15.params = params16;
        var callRet17;
        pos.line = 15;
        pos.col = 41;
        callRet17 = callFnUtil(tpl, scope, option15, buffer, ['getBaseCssClasses']);
        if (callRet17 && callRet17.isBuffer) {
            buffer = callRet17;
            callRet17 = undefined;
        }
        buffer.writeEscaped(callRet17);
        buffer.append('">x</span>\r\n    </a>\r\n\r\n    <a class="');
        var option18 = { escape: 1 };
        var params19 = [];
        params19.push('next-year-btn');
        option18.params = params19;
        var callRet20;
        pos.line = 18;
        pos.col = 34;
        callRet20 = callFnUtil(tpl, scope, option18, buffer, ['getBaseCssClasses']);
        if (callRet20 && callRet20.isBuffer) {
            buffer = callRet20;
            callRet20 = undefined;
        }
        buffer.writeEscaped(callRet20);
        buffer.append('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id21 = scope.resolve(['nextYearLabel']);
        buffer.writeEscaped(id21);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('body');
        option22.params = params23;
        var callRet24;
        pos.line = 25;
        pos.col = 32;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses']);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.writeEscaped(callRet24);
        buffer.append('">\r\n    <table class="');
        var option25 = { escape: 1 };
        var params26 = [];
        params26.push('table');
        option25.params = params26;
        var callRet27;
        pos.line = 26;
        pos.col = 38;
        callRet27 = callFnUtil(tpl, scope, option25, buffer, ['getBaseCssClasses']);
        if (callRet27 && callRet27.isBuffer) {
            buffer = callRet27;
            callRet27 = undefined;
        }
        buffer.writeEscaped(callRet27);
        buffer.append('" cellspacing="0" role="grid">\r\n        <tbody class="');
        var option28 = { escape: 1 };
        var params29 = [];
        params29.push('tbody');
        option28.params = params29;
        var callRet30;
        pos.line = 27;
        pos.col = 42;
        callRet30 = callFnUtil(tpl, scope, option28, buffer, ['getBaseCssClasses']);
        if (callRet30 && callRet30.isBuffer) {
            buffer = callRet30;
            callRet30 = undefined;
        }
        buffer.writeEscaped(callRet30);
        buffer.append('">\r\n        ');
        var option31 = {};
        var params32 = [];
        params32.push('./months-xtpl');
        option31.params = params32;
        require('./months-xtpl');
        var callRet33;
        pos.line = 28;
        pos.col = 19;
        callRet33 = includeCommand.call(tpl, scope, option31, buffer);
        if (callRet33 && callRet33.isBuffer) {
            buffer = callRet33;
            callRet33 = undefined;
        }
        buffer.write(callRet33);
        buffer.append('\r\n        </tbody>\r\n    </table>\r\n</div>');
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
