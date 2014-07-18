/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:54
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
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n    <a class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-century-btn');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
        var id6 = scope.resolve(['previousCenturyLabel'], 0);
        buffer.write(id6, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <div class="', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('century');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 8);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('">\r\n                ', 0);
        var id10 = scope.resolve(['startYear'], 0);
        buffer.write(id10, true);
        buffer.write('-', 0);
        var id11 = scope.resolve(['endYear'], 0);
        buffer.write(id11, true);
        buffer.write('\r\n    </div>\r\n    <a class="', 0);
        var option12 = { escape: 1 };
        var params13 = [];
        params13.push('next-century-btn');
        option12.params = params13;
        var callRet14;
        callRet14 = callFnUtil(tpl, scope, option12, buffer, ['getBaseCssClasses'], 0, 11);
        if (callRet14 && callRet14.isBuffer) {
            buffer = callRet14;
            callRet14 = undefined;
        }
        buffer.write(callRet14, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
        var id15 = scope.resolve(['nextCenturyLabel'], 0);
        buffer.write(id15, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
        var option16 = { escape: 1 };
        var params17 = [];
        params17.push('body');
        option16.params = params17;
        var callRet18;
        callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses'], 0, 18);
        if (callRet18 && callRet18.isBuffer) {
            buffer = callRet18;
            callRet18 = undefined;
        }
        buffer.write(callRet18, true);
        buffer.write('">\r\n    <table class="', 0);
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('table');
        option19.params = params20;
        var callRet21;
        callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses'], 0, 19);
        if (callRet21 && callRet21.isBuffer) {
            buffer = callRet21;
            callRet21 = undefined;
        }
        buffer.write(callRet21, true);
        buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('tbody');
        option22.params = params23;
        var callRet24;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses'], 0, 20);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.write(callRet24, true);
        buffer.write('">\r\n        ', 0);
        var option25 = {};
        var params26 = [];
        params26.push('./decades-xtpl');
        option25.params = params26;
        require('./decades-xtpl');
        var callRet27;
        callRet27 = includeCommand.call(tpl, scope, option25, buffer, 21);
        if (callRet27 && callRet27.isBuffer) {
            buffer = callRet27;
            callRet27 = undefined;
        }
        buffer.write(callRet27, false);
        buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/decade-panel/decades-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function decadesXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['decades'], 0);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.write('\r\n<tr role="row">\r\n    ', 0);
            var option3 = { escape: 1 };
            var params4 = [];
            var id6 = scope.resolve(['xindex'], 0);
            var id5 = scope.resolve([
                    'decades',
                    id6
                ], 0);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\r\n    <td role="gridcell"\r\n        class="', 0);
                var option7 = { escape: 1 };
                var params8 = [];
                params8.push('cell');
                option7.params = params8;
                var callRet9;
                callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 5);
                if (callRet9 && callRet9.isBuffer) {
                    buffer = callRet9;
                    callRet9 = undefined;
                }
                buffer.write(callRet9, true);
                buffer.write('\r\n        ', 0);
                var option10 = { escape: 1 };
                var params11 = [];
                var id12 = scope.resolve(['startDecade'], 0);
                var exp14 = id12;
                var id13 = scope.resolve(['year'], 0);
                exp14 = id12 <= id13;
                var exp18 = exp14;
                if (exp14) {
                    var id15 = scope.resolve(['year'], 0);
                    var exp17 = id15;
                    var id16 = scope.resolve(['endDecade'], 0);
                    exp17 = id15 <= id16;
                    exp18 = exp17;
                }
                params11.push(exp18);
                option10.params = params11;
                option10.fn = function (scope, buffer) {
                    buffer.write('\r\n         ', 0);
                    var option19 = { escape: 1 };
                    var params20 = [];
                    params20.push('selected-cell');
                    option19.params = params20;
                    var callRet21;
                    callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses'], 0, 7);
                    if (callRet21 && callRet21.isBuffer) {
                        buffer = callRet21;
                        callRet21 = undefined;
                    }
                    buffer.write(callRet21, true);
                    buffer.write('\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option10, buffer, 6);
                buffer.write('\r\n        ', 0);
                var option22 = { escape: 1 };
                var params23 = [];
                var id24 = scope.resolve(['startDecade'], 0);
                var exp26 = id24;
                var id25 = scope.resolve(['startYear'], 0);
                exp26 = id24 < id25;
                params23.push(exp26);
                option22.params = params23;
                option22.fn = function (scope, buffer) {
                    buffer.write('\r\n         ', 0);
                    var option27 = { escape: 1 };
                    var params28 = [];
                    params28.push('last-century-cell');
                    option27.params = params28;
                    var callRet29;
                    callRet29 = callFnUtil(tpl, scope, option27, buffer, ['getBaseCssClasses'], 0, 10);
                    if (callRet29 && callRet29.isBuffer) {
                        buffer = callRet29;
                        callRet29 = undefined;
                    }
                    buffer.write(callRet29, true);
                    buffer.write('\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option22, buffer, 9);
                buffer.write('\r\n        ', 0);
                var option30 = { escape: 1 };
                var params31 = [];
                var id32 = scope.resolve(['endDecade'], 0);
                var exp34 = id32;
                var id33 = scope.resolve(['endYear'], 0);
                exp34 = id32 > id33;
                params31.push(exp34);
                option30.params = params31;
                option30.fn = function (scope, buffer) {
                    buffer.write('\r\n         ', 0);
                    var option35 = { escape: 1 };
                    var params36 = [];
                    params36.push('next-century-cell');
                    option35.params = params36;
                    var callRet37;
                    callRet37 = callFnUtil(tpl, scope, option35, buffer, ['getBaseCssClasses'], 0, 13);
                    if (callRet37 && callRet37.isBuffer) {
                        buffer = callRet37;
                        callRet37 = undefined;
                    }
                    buffer.write(callRet37, true);
                    buffer.write('\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option30, buffer, 12);
                buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
                var option38 = { escape: 1 };
                var params39 = [];
                params39.push('decade');
                option38.params = params39;
                var callRet40;
                callRet40 = callFnUtil(tpl, scope, option38, buffer, ['getBaseCssClasses'], 0, 19);
                if (callRet40 && callRet40.isBuffer) {
                    buffer = callRet40;
                    callRet40 = undefined;
                }
                buffer.write(callRet40, true);
                buffer.write('">\r\n            ', 0);
                var id41 = scope.resolve(['startDecade'], 0);
                buffer.write(id41, true);
                buffer.write('-', 0);
                var id42 = scope.resolve(['endDecade'], 0);
                buffer.write(id42, true);
                buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
            buffer.write('\r\n</tr>\r\n', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option0, buffer, 1);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});

KISSY.add('date/picker/year-panel/years-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function yearsXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['years'], 0);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.write('\r\n<tr role="row">\r\n    ', 0);
            var option3 = { escape: 1 };
            var params4 = [];
            var id6 = scope.resolve(['xindex'], 0);
            var id5 = scope.resolve([
                    'years',
                    id6
                ], 0);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\r\n    <td role="gridcell"\r\n        title="', 0);
                var id7 = scope.resolve(['title'], 0);
                buffer.write(id7, true);
                buffer.write('"\r\n        class="', 0);
                var option8 = { escape: 1 };
                var params9 = [];
                params9.push('cell');
                option8.params = params9;
                var callRet10;
                callRet10 = callFnUtil(tpl, scope, option8, buffer, ['getBaseCssClasses'], 0, 6);
                if (callRet10 && callRet10.isBuffer) {
                    buffer = callRet10;
                    callRet10 = undefined;
                }
                buffer.write(callRet10, true);
                buffer.write('\r\n        ', 0);
                var option11 = { escape: 1 };
                var params12 = [];
                var id13 = scope.resolve(['content'], 0);
                var exp15 = id13;
                var id14 = scope.resolve(['year'], 0);
                exp15 = id13 === id14;
                params12.push(exp15);
                option11.params = params12;
                option11.fn = function (scope, buffer) {
                    buffer.write('\r\n         ', 0);
                    var option16 = { escape: 1 };
                    var params17 = [];
                    params17.push('selected-cell');
                    option16.params = params17;
                    var callRet18;
                    callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses'], 0, 8);
                    if (callRet18 && callRet18.isBuffer) {
                        buffer = callRet18;
                        callRet18 = undefined;
                    }
                    buffer.write(callRet18, true);
                    buffer.write('\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option11, buffer, 7);
                buffer.write('\r\n        ', 0);
                var option19 = { escape: 1 };
                var params20 = [];
                var id21 = scope.resolve(['content'], 0);
                var exp23 = id21;
                var id22 = scope.resolve(['startYear'], 0);
                exp23 = id21 < id22;
                params20.push(exp23);
                option19.params = params20;
                option19.fn = function (scope, buffer) {
                    buffer.write('\r\n         ', 0);
                    var option24 = { escape: 1 };
                    var params25 = [];
                    params25.push('last-decade-cell');
                    option24.params = params25;
                    var callRet26;
                    callRet26 = callFnUtil(tpl, scope, option24, buffer, ['getBaseCssClasses'], 0, 11);
                    if (callRet26 && callRet26.isBuffer) {
                        buffer = callRet26;
                        callRet26 = undefined;
                    }
                    buffer.write(callRet26, true);
                    buffer.write('\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option19, buffer, 10);
                buffer.write('\r\n        ', 0);
                var option27 = { escape: 1 };
                var params28 = [];
                var id29 = scope.resolve(['content'], 0);
                var exp31 = id29;
                var id30 = scope.resolve(['endYear'], 0);
                exp31 = id29 > id30;
                params28.push(exp31);
                option27.params = params28;
                option27.fn = function (scope, buffer) {
                    buffer.write('\r\n         ', 0);
                    var option32 = { escape: 1 };
                    var params33 = [];
                    params33.push('next-decade-cell');
                    option32.params = params33;
                    var callRet34;
                    callRet34 = callFnUtil(tpl, scope, option32, buffer, ['getBaseCssClasses'], 0, 14);
                    if (callRet34 && callRet34.isBuffer) {
                        buffer = callRet34;
                        callRet34 = undefined;
                    }
                    buffer.write(callRet34, true);
                    buffer.write('\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option27, buffer, 13);
                buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
                var option35 = { escape: 1 };
                var params36 = [];
                params36.push('year');
                option35.params = params36;
                var callRet37;
                callRet37 = callFnUtil(tpl, scope, option35, buffer, ['getBaseCssClasses'], 0, 20);
                if (callRet37 && callRet37.isBuffer) {
                    buffer = callRet37;
                    callRet37 = undefined;
                }
                buffer.write(callRet37, true);
                buffer.write('">\r\n            ', 0);
                var id38 = scope.resolve(['content'], 0);
                buffer.write(id38, true);
                buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
            buffer.write('\r\n</tr>\r\n', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option0, buffer, 1);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/year-panel/year-panel-xtpl', ['./years-xtpl'], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function yearPanelXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n    <a class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-decade-btn');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
        var id6 = scope.resolve(['previousDecadeLabel'], 0);
        buffer.write(id6, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('decade-select');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 9);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="', 0);
        var id10 = scope.resolve(['decadeSelectLabel'], 0);
        buffer.write(id10, true);
        buffer.write('">\r\n            <span class="', 0);
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('decade-select-content');
        option11.params = params12;
        var callRet13;
        callRet13 = callFnUtil(tpl, scope, option11, buffer, ['getBaseCssClasses'], 0, 14);
        if (callRet13 && callRet13.isBuffer) {
            buffer = callRet13;
            callRet13 = undefined;
        }
        buffer.write(callRet13, true);
        buffer.write('">\r\n                ', 0);
        var id14 = scope.resolve(['startYear'], 0);
        buffer.write(id14, true);
        buffer.write('-', 0);
        var id15 = scope.resolve(['endYear'], 0);
        buffer.write(id15, true);
        buffer.write('\r\n            </span>\r\n        <span class="', 0);
        var option16 = { escape: 1 };
        var params17 = [];
        params17.push('decade-select-arrow');
        option16.params = params17;
        var callRet18;
        callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses'], 0, 17);
        if (callRet18 && callRet18.isBuffer) {
            buffer = callRet18;
            callRet18 = undefined;
        }
        buffer.write(callRet18, true);
        buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="', 0);
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('next-decade-btn');
        option19.params = params20;
        var callRet21;
        callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses'], 0, 20);
        if (callRet21 && callRet21.isBuffer) {
            buffer = callRet21;
            callRet21 = undefined;
        }
        buffer.write(callRet21, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
        var id22 = scope.resolve(['nextDecadeLabel'], 0);
        buffer.write(id22, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
        var option23 = { escape: 1 };
        var params24 = [];
        params24.push('body');
        option23.params = params24;
        var callRet25;
        callRet25 = callFnUtil(tpl, scope, option23, buffer, ['getBaseCssClasses'], 0, 27);
        if (callRet25 && callRet25.isBuffer) {
            buffer = callRet25;
            callRet25 = undefined;
        }
        buffer.write(callRet25, true);
        buffer.write('">\r\n    <table class="', 0);
        var option26 = { escape: 1 };
        var params27 = [];
        params27.push('table');
        option26.params = params27;
        var callRet28;
        callRet28 = callFnUtil(tpl, scope, option26, buffer, ['getBaseCssClasses'], 0, 28);
        if (callRet28 && callRet28.isBuffer) {
            buffer = callRet28;
            callRet28 = undefined;
        }
        buffer.write(callRet28, true);
        buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
        var option29 = { escape: 1 };
        var params30 = [];
        params30.push('tbody');
        option29.params = params30;
        var callRet31;
        callRet31 = callFnUtil(tpl, scope, option29, buffer, ['getBaseCssClasses'], 0, 29);
        if (callRet31 && callRet31.isBuffer) {
            buffer = callRet31;
            callRet31 = undefined;
        }
        buffer.write(callRet31, true);
        buffer.write('">\r\n        ', 0);
        var option32 = {};
        var params33 = [];
        params33.push('./years-xtpl');
        option32.params = params33;
        require('./years-xtpl');
        var callRet34;
        callRet34 = includeCommand.call(tpl, scope, option32, buffer, 30);
        if (callRet34 && callRet34.isBuffer) {
            buffer = callRet34;
            callRet34 = undefined;
        }
        buffer.write(callRet34, false);
        buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/month-panel/months-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function monthsXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['months'], 0);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.write('\r\n<tr role="row">\r\n    ', 0);
            var option3 = { escape: 1 };
            var params4 = [];
            var id6 = scope.resolve(['xindex'], 0);
            var id5 = scope.resolve([
                    'months',
                    id6
                ], 0);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\r\n    <td role="gridcell"\r\n        title="', 0);
                var id7 = scope.resolve(['title'], 0);
                buffer.write(id7, true);
                buffer.write('"\r\n        class="', 0);
                var option8 = { escape: 1 };
                var params9 = [];
                params9.push('cell');
                option8.params = params9;
                var callRet10;
                callRet10 = callFnUtil(tpl, scope, option8, buffer, ['getBaseCssClasses'], 0, 6);
                if (callRet10 && callRet10.isBuffer) {
                    buffer = callRet10;
                    callRet10 = undefined;
                }
                buffer.write(callRet10, true);
                buffer.write('\r\n        ', 0);
                var option11 = { escape: 1 };
                var params12 = [];
                var id13 = scope.resolve(['month'], 0);
                var exp15 = id13;
                var id14 = scope.resolve(['value'], 0);
                exp15 = id13 === id14;
                params12.push(exp15);
                option11.params = params12;
                option11.fn = function (scope, buffer) {
                    buffer.write('\r\n        ', 0);
                    var option16 = { escape: 1 };
                    var params17 = [];
                    params17.push('selected-cell');
                    option16.params = params17;
                    var callRet18;
                    callRet18 = callFnUtil(tpl, scope, option16, buffer, ['getBaseCssClasses'], 0, 8);
                    if (callRet18 && callRet18.isBuffer) {
                        buffer = callRet18;
                        callRet18 = undefined;
                    }
                    buffer.write(callRet18, true);
                    buffer.write('\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option11, buffer, 7);
                buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
                var option19 = { escape: 1 };
                var params20 = [];
                params20.push('month');
                option19.params = params20;
                var callRet21;
                callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses'], 0, 14);
                if (callRet21 && callRet21.isBuffer) {
                    buffer = callRet21;
                    callRet21 = undefined;
                }
                buffer.write(callRet21, true);
                buffer.write('">\r\n            ', 0);
                var id22 = scope.resolve(['content'], 0);
                buffer.write(id22, true);
                buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
            buffer.write('\r\n</tr>\r\n', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option0, buffer, 1);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('date/picker/month-panel/month-panel-xtpl', ['./months-xtpl'], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function monthPanelXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n    <a class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-year-btn');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
        var id6 = scope.resolve(['previousYearLabel'], 0);
        buffer.write(id6, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('year-select');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 9);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="', 0);
        var id10 = scope.resolve(['yearSelectLabel'], 0);
        buffer.write(id10, true);
        buffer.write('">\r\n        <span class="', 0);
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('year-select-content');
        option11.params = params12;
        var callRet13;
        callRet13 = callFnUtil(tpl, scope, option11, buffer, ['getBaseCssClasses'], 0, 14);
        if (callRet13 && callRet13.isBuffer) {
            buffer = callRet13;
            callRet13 = undefined;
        }
        buffer.write(callRet13, true);
        buffer.write('">', 0);
        var id14 = scope.resolve(['year'], 0);
        buffer.write(id14, true);
        buffer.write('</span>\r\n        <span class="', 0);
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('year-select-arrow');
        option15.params = params16;
        var callRet17;
        callRet17 = callFnUtil(tpl, scope, option15, buffer, ['getBaseCssClasses'], 0, 15);
        if (callRet17 && callRet17.isBuffer) {
            buffer = callRet17;
            callRet17 = undefined;
        }
        buffer.write(callRet17, true);
        buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="', 0);
        var option18 = { escape: 1 };
        var params19 = [];
        params19.push('next-year-btn');
        option18.params = params19;
        var callRet20;
        callRet20 = callFnUtil(tpl, scope, option18, buffer, ['getBaseCssClasses'], 0, 18);
        if (callRet20 && callRet20.isBuffer) {
            buffer = callRet20;
            callRet20 = undefined;
        }
        buffer.write(callRet20, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
        var id21 = scope.resolve(['nextYearLabel'], 0);
        buffer.write(id21, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('body');
        option22.params = params23;
        var callRet24;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses'], 0, 25);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.write(callRet24, true);
        buffer.write('">\r\n    <table class="', 0);
        var option25 = { escape: 1 };
        var params26 = [];
        params26.push('table');
        option25.params = params26;
        var callRet27;
        callRet27 = callFnUtil(tpl, scope, option25, buffer, ['getBaseCssClasses'], 0, 26);
        if (callRet27 && callRet27.isBuffer) {
            buffer = callRet27;
            callRet27 = undefined;
        }
        buffer.write(callRet27, true);
        buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
        var option28 = { escape: 1 };
        var params29 = [];
        params29.push('tbody');
        option28.params = params29;
        var callRet30;
        callRet30 = callFnUtil(tpl, scope, option28, buffer, ['getBaseCssClasses'], 0, 27);
        if (callRet30 && callRet30.isBuffer) {
            buffer = callRet30;
            callRet30 = undefined;
        }
        buffer.write(callRet30, true);
        buffer.write('">\r\n        ', 0);
        var option31 = {};
        var params32 = [];
        params32.push('./months-xtpl');
        option31.params = params32;
        require('./months-xtpl');
        var callRet33;
        callRet33 = includeCommand.call(tpl, scope, option31, buffer, 28);
        if (callRet33 && callRet33.isBuffer) {
            buffer = callRet33;
            callRet33 = undefined;
        }
        buffer.write(callRet33, false);
        buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
