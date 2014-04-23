/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 11:59
*/
/*
combined modules:
date/picker
date/gregorian
date/picker/month-panel/control
date/picker/year-panel/control
date/picker/decade-panel/control
date/picker/decade-panel/decade-panel-xtpl
date/picker/decade-panel/decades-xtpl
date/format
date/picker/year-panel/years-xtpl
date/picker/year-panel/year-panel-xtpl
date/picker/month-panel/months-xtpl
date/picker/month-panel/month-panel-xtpl
*/
/**
 * @ignore
 * year panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker', [
    'node',
    'date/gregorian',
    'i18n!date/picker',
    'component/control',
    './picker/month-panel/control',
    'event/gesture/tap',
    'date/format',
    'date/picker-xtpl'
], function (S, require) {
    var Node = require('node'), GregorianCalendar = require('date/gregorian'), locale = require('i18n!date/picker'), Control = require('component/control'), MonthPanel = require('./picker/month-panel/control');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;
    var KeyCode = Node.KeyCode;
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
        return this.config.control.renderDates();
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
        today.setTime(S.now());
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
    return Control.extend({
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
            today.setTime(S.now());
            return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
        },
        renderDates: function () {
            var self = this, i, j, dateTable = [], current, isClear = self.get('clear'), showWeekNumber = self.get('showWeekNumber'), locale = self.get('locale'), value = self.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = self.get('dateRender'), disabledDate = self.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
            today.setTime(S.now());
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
            contentTpl: { value: PickerTpl },
            focusable: { value: true },
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
                    date.setTime(S.now());
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
    });
});    /*
 keyboard
 - http://www.w3.org/TR/wai-aria-practices/#datepicker
 */

/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 11:58
*/
/*
combined modules:
date/gregorian
date/gregorian/utils
date/gregorian/const
*/
/**
 * GregorianCalendar class for KISSY.
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian', [
    './gregorian/utils',
    'i18n!date',
    './gregorian/const',
    './const'
], 'date/gregorian', [
    './gregorian/utils',
    'i18n!date',
    './gregorian/const'
], function (S, require) {
    var toInt = parseInt;
    var Utils = require('./gregorian/utils');
    var defaultLocale = require('i18n!date');
    var Const = require('./gregorian/const');    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
                                                 /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    function GregorianCalendar(timezoneOffset, locale) {
        var args = S.makeArray(arguments);
        if (typeof timezoneOffset === 'object') {
            locale = timezoneOffset;
            timezoneOffset = locale.timezoneOffset;
        } else if (args.length >= 3) {
            timezoneOffset = locale = null;
        }
        locale = locale || defaultLocale;
        this.locale = locale;
        this.fields = [];    /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
                             /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        this.time = undefined;    /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
                                  /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        this.timezoneOffset = timezoneOffset || locale.timezoneOffset;    /**
         * The first day of the week
         * @type Number
         * @protected
         */
                                                                          /**
         * The first day of the week
         * @type Number
         * @protected
         */
        /**
         * The first day of the week
         * @type Number
         * @protected
         */
        /**
         * The first day of the week
         * @type Number
         * @protected
         */
        this.firstDayOfWeek = locale.firstDayOfWeek;    /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
                                                        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
        this.fieldsComputed = false;
        if (arguments.length >= 3) {
            this.set.apply(this, args);
        }
    }
    S.mix(GregorianCalendar, Const);
    S.mix(GregorianCalendar, {
        Utils: Utils,
        /**
         * Determines if the given year is a leap year.
         * Returns true if the given year is a leap year. To specify BC year numbers,
         * 1 - year number must be given. For example, year BC 4 is specified as -3.
         * @param {Number} year the given year.
         * @returns {Boolean} true if the given year is a leap year; false otherwise.
         * @static
         * @method
         */
        isLeapYear: Utils.isLeapYear,
        /**
         * Enum indicating year field of date
         * @type Number
         */
        YEAR: 1,
        /**
         * Enum indicating month field of date
         * @type Number
         */
        MONTH: 2,
        /**
         * Enum indicating the day of the month
         * @type Number
         */
        DAY_OF_MONTH: 3,
        /**
         * Enum indicating the hour (24).
         * @type Number
         */
        HOUR_OF_DAY: 4,
        /**
         * Enum indicating the minute of the day
         * @type Number
         */
        MINUTES: 5,
        /**
         * Enum indicating the second of the day
         * @type Number
         */
        SECONDS: 6,
        /**
         * Enum indicating the millisecond of the day
         * @type Number
         */
        MILLISECONDS: 7,
        /**
         * Enum indicating the week number within the current year
         * @type Number
         */
        WEEK_OF_YEAR: 8,
        /**
         * Enum indicating the week number within the current month
         * @type Number
         */
        WEEK_OF_MONTH: 9,
        /**
         * Enum indicating the day of the day number within the current year
         * @type Number
         */
        DAY_OF_YEAR: 10,
        /**
         * Enum indicating the day of the week
         * @type Number
         */
        DAY_OF_WEEK: 11,
        /**
         * Enum indicating the day of the ordinal number of the day of the week
         * @type Number
         */
        DAY_OF_WEEK_IN_MONTH: 12,
        /**
         * Enum indicating am
         * @type Number
         */
        AM: 0,
        /**
         * Enum indicating pm
         * @type Number
         */
        PM: 1
    });
    var fields = [
            '',
            'Year',
            'Month',
            'DayOfMonth',
            'HourOfDay',
            'Minutes',
            'Seconds',
            'Milliseconds',
            'WeekOfYear',
            'WeekOfMonth',
            'DayOfYear',
            'DayOfWeek',
            'DayOfWeekInMonth'
        ];
    var YEAR = GregorianCalendar.YEAR;
    var MONTH = GregorianCalendar.MONTH;
    var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
    var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
    var MINUTE = GregorianCalendar.MINUTES;
    var SECONDS = GregorianCalendar.SECONDS;
    var MILLISECONDS = GregorianCalendar.MILLISECONDS;
    var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
    var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
    var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
    var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
    var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
    var MONTH_LENGTH = [
            31,
            28,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31
        ];    // 0-based
              // 0-based
    // 0-based
    // 0-based
    var LEAP_MONTH_LENGTH = [
            31,
            29,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31
        ];    // 0-based
              // 0-based
    // 0-based
    // 0-based
    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    var ONE_WEEK = ONE_DAY * 7;
    var EPOCH_OFFSET = 719163;    // Fixed date of January 1, 1970 (Gregorian)
                                  // Fixed date of January 1, 1970 (Gregorian)
    // Fixed date of January 1, 1970 (Gregorian)
    // Fixed date of January 1, 1970 (Gregorian)
    var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
    var MIN_VALUES = [
            undefined,
            1,
            // YEAR
            GregorianCalendar.JANUARY,
            // MONTH
            1,
            // DAY_OF_MONTH
            0,
            // HOUR_OF_DAY
            0,
            // MINUTE
            0,
            // SECONDS
            0,
            // MILLISECONDS
            1,
            // WEEK_OF_YEAR
            undefined,
            // WEEK_OF_MONTH
            1,
            // DAY_OF_YEAR
            GregorianCalendar.SUNDAY,
            // DAY_OF_WEEK
            1    // DAY_OF_WEEK_IN_MONTH
        ];    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    var MAX_VALUES = [
            undefined,
            292278994,
            // YEAR
            GregorianCalendar.DECEMBER,
            // MONTH
            undefined,
            // DAY_OF_MONTH
            23,
            // HOUR_OF_DAY
            59,
            // MINUTE
            59,
            // SECONDS
            999,
            // MILLISECONDS
            undefined,
            // WEEK_OF_YEAR
            undefined,
            // WEEK_OF_MONTH
            undefined,
            // DAY_OF_YEAR
            GregorianCalendar.SATURDAY,
            // DAY_OF_WEEK
            undefined    // DAY_OF_WEEK_IN_MONTH
        ];    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    GregorianCalendar.prototype = {
        constructor: GregorianCalendar,
        /**
         * Determines if current year is a leap year.
         * Returns true if the given year is a leap year. To specify BC year numbers,
         * 1 - year number must be given. For example, year BC 4 is specified as -3.
         * @returns {Boolean} true if the given year is a leap year; false otherwise.
         * @method
         * @member KISSY.Date.Gregorian
         */
        isLeapYear: function () {
            return isLeapYear(this.getYear());
        },
        /**
         * Return local info for current date instance
         * @returns {Object}
         */
        getLocale: function () {
            return this.locale;
        },
        /**
         * Returns the minimum value for
         * the given calendar field of this GregorianCalendar instance.
         * The minimum value is defined as the smallest value
         * returned by the get method for any possible time value,
         * taking into consideration the current values of the getFirstDayOfWeek,
         * getMinimalDaysInFirstWeek.
         * @param field the calendar field.
         * @returns {Number} the minimum value for the given calendar field.
         */
        getActualMinimum: function (field) {
            if (MIN_VALUES[field] !== undefined) {
                return MIN_VALUES[field];
            }
            var fields = this.fields;
            if (field === WEEK_OF_MONTH) {
                var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
                return cal.get(WEEK_OF_MONTH);
            }
            throw new Error('minimum value not defined!');
        },
        /**
         * Returns the maximum value for the given calendar field
         * of this GregorianCalendar instance.
         * The maximum value is defined as the largest value returned
         * by the get method for any possible time value, taking into consideration
         * the current values of the getFirstDayOfWeek, getMinimalDaysInFirstWeek methods.
         * @param field the calendar field.
         * @returns {Number} the maximum value for the given calendar field.
         */
        getActualMaximum: function (field) {
            if (MAX_VALUES[field] !== undefined) {
                return MAX_VALUES[field];
            }
            var value, fields = this.fields;
            switch (field) {
            case DAY_OF_MONTH:
                value = getMonthLength(fields[YEAR], fields[MONTH]);
                break;
            case WEEK_OF_YEAR:
                var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
                value = endOfYear.get(WEEK_OF_YEAR);
                if (value === 1) {
                    value = 52;
                }
                break;
            case WEEK_OF_MONTH:
                var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
                value = endOfMonth.get(WEEK_OF_MONTH);
                break;
            case DAY_OF_YEAR:
                value = getYearLength(fields[YEAR]);
                break;
            case DAY_OF_WEEK_IN_MONTH:
                value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
                break;
            }
            if (value === undefined) {
                throw new Error('maximum value not defined!');
            }
            return value;
        },
        /**
         * Determines if the given calendar field has a value set,
         * including cases that the value has been set by internal fields calculations
         * triggered by a get method call.
         * @param field the calendar field to be cleared.
         * @returns {boolean} true if the given calendar field has a value set; false otherwise.
         */
        isSet: function (field) {
            return this.fields[field] !== undefined;
        },
        /**
         * Converts the time value (millisecond offset from the Epoch)
         * to calendar field values.
         * @protected
         */
        computeFields: function () {
            var time = this.time;
            var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
            var fixedDate = toInt(timezoneOffset / ONE_DAY);
            var timeOfDay = timezoneOffset % ONE_DAY;
            fixedDate += toInt(time / ONE_DAY);
            timeOfDay += time % ONE_DAY;
            if (timeOfDay >= ONE_DAY) {
                timeOfDay -= ONE_DAY;
                fixedDate++;
            } else {
                while (timeOfDay < 0) {
                    timeOfDay += ONE_DAY;
                    fixedDate--;
                }
            }
            fixedDate += EPOCH_OFFSET;
            var date = Utils.getGregorianDateFromFixedDate(fixedDate);
            var year = date.year;
            var fields = this.fields;
            fields[YEAR] = year;
            fields[MONTH] = date.month;
            fields[DAY_OF_MONTH] = date.dayOfMonth;
            fields[DAY_OF_WEEK] = date.dayOfWeek;
            if (timeOfDay !== 0) {
                fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
                var r = timeOfDay % ONE_HOUR;
                fields[MINUTE] = toInt(r / ONE_MINUTE);
                r %= ONE_MINUTE;
                fields[SECONDS] = toInt(r / ONE_SECOND);
                fields[MILLISECONDS] = r % ONE_SECOND;
            } else {
                fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
            }
            var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
            var dayOfYear = fixedDate - fixedDateJan1 + 1;
            var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
            fields[DAY_OF_YEAR] = dayOfYear;
            fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
            var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);    // 本周没有足够的时间在当前年
                                                                               // 本周没有足够的时间在当前年
            // 本周没有足够的时间在当前年
            // 本周没有足够的时间在当前年
            if (weekOfYear === 0) {
                // If the date belongs to the last week of the
                // previous year, use the week number of "12/31" of
                // the "previous" year.
                var fixedDec31 = fixedDateJan1 - 1;
                var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
                weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
            } else // 本周是年末最后一周，可能有足够的时间在新的一年
            if (weekOfYear >= 52) {
                var nextJan1 = fixedDateJan1 + getYearLength(year);
                var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
                var nDays = nextJan1st - nextJan1;    // 本周有足够天数在新的一年
                                                      // 本周有足够天数在新的一年
                // 本周有足够天数在新的一年
                // 本周有足够天数在新的一年
                if (nDays >= this.minimalDaysInFirstWeek && // 当天确实在本周，weekOfYear === 53 时是不需要这个判断
                    fixedDate >= nextJan1st - 7) {
                    weekOfYear = 1;
                }
            }
            fields[WEEK_OF_YEAR] = weekOfYear;
            fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
            this.fieldsComputed = true;
        },
        /**
         * Converts calendar field values to the time value
         * (millisecond offset from the Epoch).
         * @protected
         */
        computeTime: function () {
            if (!this.isSet(YEAR)) {
                throw new Error('year must be set for KISSY GregorianCalendar');
            }
            var fields = this.fields;
            var year = fields[YEAR];
            var timeOfDay = 0;
            if (this.isSet(HOUR_OF_DAY)) {
                timeOfDay += fields[HOUR_OF_DAY];
            }
            timeOfDay *= 60;
            timeOfDay += fields[MINUTE] || 0;
            timeOfDay *= 60;
            timeOfDay += fields[SECONDS] || 0;
            timeOfDay *= 1000;
            timeOfDay += fields[MILLISECONDS] || 0;
            var fixedDate = 0;
            fields[YEAR] = year;
            fixedDate = fixedDate + this.getFixedDate();    // millis represents local wall-clock time in milliseconds.
                                                            // millis represents local wall-clock time in milliseconds.
            // millis represents local wall-clock time in milliseconds.
            // millis represents local wall-clock time in milliseconds.
            var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
            millis -= this.timezoneOffset * ONE_MINUTE;
            this.time = millis;
            this.computeFields();
        },
        /**
         * Fills in any unset fields in the calendar fields. First,
         * the computeTime() method is called if the time value (millisecond offset from the Epoch)
         * has not been calculated from calendar field values.
         * Then, the computeFields() method is called to calculate all calendar field values.
         * @protected
         */
        complete: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            if (!this.fieldsComputed) {
                this.computeFields();
            }
        },
        getFixedDate: function () {
            var self = this;
            var fields = self.fields;
            var firstDayOfWeekCfg = self.firstDayOfWeek;
            var year = fields[YEAR];
            var month = GregorianCalendar.JANUARY;
            if (self.isSet(MONTH)) {
                month = fields[MONTH];
                if (month > GregorianCalendar.DECEMBER) {
                    year += toInt(month / 12);
                    month %= 12;
                } else if (month < GregorianCalendar.JANUARY) {
                    year += floorDivide(month / 12);
                    month = mod(month, 12);
                }
            }    // Get the fixed date since Jan 1, 1 (Gregorian). We are on
                 // the first day of either `month' or January in 'year'.
                 // Get the fixed date since Jan 1, 1 (Gregorian). We are on
                 // the first day of either `month' or January in 'year'.
            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            var fixedDate = Utils.getFixedDate(year, month, 1);
            var firstDayOfWeek;
            var dayOfWeek = self.firstDayOfWeek;
            if (self.isSet(DAY_OF_WEEK)) {
                dayOfWeek = fields[DAY_OF_WEEK];
            }
            if (self.isSet(MONTH)) {
                if (self.isSet(DAY_OF_MONTH)) {
                    fixedDate += fields[DAY_OF_MONTH] - 1;
                } else {
                    if (self.isSet(WEEK_OF_MONTH)) {
                        firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);    // If we have enough days in the first week, then
                                                                                                          // move to the previous week.
                                                                                                          // If we have enough days in the first week, then
                                                                                                          // move to the previous week.
                        // If we have enough days in the first week, then
                        // move to the previous week.
                        // If we have enough days in the first week, then
                        // move to the previous week.
                        if (firstDayOfWeek - fixedDate >= self.minimalDaysInFirstWeek) {
                            firstDayOfWeek -= 7;
                        }
                        if (dayOfWeek !== firstDayOfWeekCfg) {
                            firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
                        }
                        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
                    } else {
                        var dowim;
                        if (self.isSet(DAY_OF_WEEK_IN_MONTH)) {
                            dowim = fields[DAY_OF_WEEK_IN_MONTH];
                        } else {
                            dowim = 1;
                        }
                        var lastDate = 7 * dowim;
                        if (dowim < 0) {
                            lastDate = getMonthLength(year, month) + 7 * (dowim + 1);
                        }
                        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
                    }
                }
            } else {
                // We are on the first day of the year.
                if (self.isSet(DAY_OF_YEAR)) {
                    fixedDate += fields[DAY_OF_YEAR] - 1;
                } else {
                    firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);    // If we have enough days in the first week, then move
                                                                                                      // to the previous week.
                                                                                                      // If we have enough days in the first week, then move
                                                                                                      // to the previous week.
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    if (firstDayOfWeek - fixedDate >= self.minimalDaysInFirstWeek) {
                        firstDayOfWeek -= 7;
                    }
                    if (dayOfWeek !== firstDayOfWeekCfg) {
                        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
                    }
                    fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
                }
            }
            return fixedDate;
        },
        /**
         * Returns this Calendar's time value in milliseconds
         * @member KISSY.Date.Gregorian
         * @returns {Number} the current time as UTC milliseconds from the epoch.
         */
        getTime: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            return this.time;
        },
        /**
         * Sets this Calendar's current time from the given long value.
         * @param time the new time in UTC milliseconds from the epoch.
         */
        setTime: function (time) {
            this.time = time;
            this.fieldsComputed = false;
            this.complete();
        },
        /**
         * Returns the value of the given calendar field.
         * @param field the given calendar field.
         * @returns {Number} the value for the given calendar field.
         */
        get: function (field) {
            this.complete();
            return this.fields[field];
        },
        /**
         * Returns the year of the given calendar field.
         * @method getYear
         * @returns {Number} the year for the given calendar field.
         */
        /**
         * Returns the month of the given calendar field.
         * @method getMonth
         * @returns {Number} the month for the given calendar field.
         */
        /**
         * Returns the day of month of the given calendar field.
         * @method getDayOfMonth
         * @returns {Number} the day of month for the given calendar field.
         */
        /**
         * Returns the hour of day of the given calendar field.
         * @method getHourOfDay
         * @returns {Number} the hour of day for the given calendar field.
         */
        /**
         * Returns the minute of the given calendar field.
         * @method getMinute
         * @returns {Number} the minute for the given calendar field.
         */
        /**
         * Returns the second of the given calendar field.
         * @method getSecond
         * @returns {Number} the second for the given calendar field.
         */
        /**
         * Returns the millisecond of the given calendar field.
         * @method getMilliSecond
         * @returns {Number} the millisecond for the given calendar field.
         */
        /**
         * Returns the week of year of the given calendar field.
         * @method getWeekOfYear
         * @returns {Number} the week of year for the given calendar field.
         */
        /**
         * Returns the week of month of the given calendar field.
         * @method getWeekOfMonth
         * @returns {Number} the week of month for the given calendar field.
         */
        /**
         * Returns the day of year of the given calendar field.
         * @method getDayOfYear
         * @returns {Number} the day of year for the given calendar field.
         */
        /**
         * Returns the day of week of the given calendar field.
         * @method getDayOfWeek
         * @returns {Number} the day of week for the given calendar field.
         */
        /**
         * Returns the day of week in month of the given calendar field.
         * @method getDayOfWeekInMonth
         * @returns {Number} the day of week in month for the given calendar field.
         */
        /**
         * Sets the given calendar field to the given value.
         * @param field the given calendar field.
         * @param v the value to be set for the given calendar field.
         */
        set: function (field, v) {
            var len = arguments.length;
            if (len === 2) {
                this.fields[field] = v;
            } else if (len < MILLISECONDS + 1) {
                for (var i = 0; i < len; i++) {
                    this.fields[YEAR + i] = arguments[i];
                }
            } else {
                throw new Error('illegal arguments for KISSY GregorianCalendar set');
            }
            this.time = undefined;
        },
        /**
         * Set the year of the given calendar field.
         * @method setYear
         */
        /**
         * Set the month of the given calendar field.
         * @method setMonth
         */
        /**
         * Set the day of month of the given calendar field.
         * @method setDayOfMonth
         */
        /**
         * Set the hour of day of the given calendar field.
         * @method setHourOfDay
         */
        /**
         * Set the minute of the given calendar field.
         * @method setMinute
         */
        /**
         * Set the second of the given calendar field.
         * @method setSecond
         */
        /**
         * Set the millisecond of the given calendar field.
         * @method setMilliSecond
         */
        /**
         * Set the week of year of the given calendar field.
         * @method setWeekOfYear
         */
        /**
         * Set the week of month of the given calendar field.
         * @method setWeekOfMonth
         */
        /**
         * Set the day of year of the given calendar field.
         * @method setDayOfYear
         */
        /**
         * Set the day of week of the given calendar field.
         * @method setDayOfWeek
         */
        /**
         * Set the day of week in month of the given calendar field.
         * @method setDayOfWeekInMonth
         */
        /**
         * add for specified field based on two rules:
         *
         *  - Add rule 1. The value of field after the call minus the value of field before the
         *  call is amount, modulo any overflow that has occurred in field
         *  Overflow occurs when a field value exceeds its range and,
         *  as a result, the next larger field is incremented or
         *  decremented and the field value is adjusted back into its range.
         *
         *  - Add rule 2. If a smaller field is expected to be invariant,
         *  but it is impossible for it to be equal to its
         *  prior value because of changes in its minimum or maximum after
         *  field is changed, then its value is adjusted to be as close
         *  as possible to its expected value. A smaller field represents a
         *  smaller unit of time. HOUR_OF_DAY is a smaller field than
         *  DAY_OF_MONTH. No adjustment is made to smaller fields
         *  that are not expected to be invariant. The calendar system
         *  determines what fields are expected to be invariant.
         *
         *
         *      @example
         *      KISSY.use('date/gregorian',function(S, GregorianCalendar){
         *          var d = new GregorianCalendar();
         *          d.set(2012, GregorianCalendar.JANUARY, 31);
         *          d.add(Gregorian.MONTH,1);
         *          // 2012-2-29
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *          d.add(Gregorian.MONTH,12);
         *          // 2013-2-28
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *      });
         *
         * @param field the calendar field.
         * @param {Number} amount he amount of date or time to be added to the field.
         */
        add: function (field, amount) {
            if (!amount) {
                return;
            }
            var self = this;
            var fields = self.fields;    // computer and retrieve original value
                                         // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            var value = self.get(field);
            if (field === YEAR) {
                value += amount;
                self.set(YEAR, value);
                adjustDayOfMonth(self);
            } else if (field === MONTH) {
                value += amount;
                var yearAmount = floorDivide(value / 12);
                value = mod(value, 12);
                if (yearAmount) {
                    self.set(YEAR, fields[YEAR] + yearAmount);
                }
                self.set(MONTH, value);
                adjustDayOfMonth(self);
            } else {
                switch (field) {
                case HOUR_OF_DAY:
                    amount *= ONE_HOUR;
                    break;
                case MINUTE:
                    amount *= ONE_MINUTE;
                    break;
                case SECONDS:
                    amount *= ONE_SECOND;
                    break;
                case MILLISECONDS:
                    break;
                case WEEK_OF_MONTH:
                case WEEK_OF_YEAR:
                case DAY_OF_WEEK_IN_MONTH:
                    amount *= ONE_WEEK;
                    break;
                case DAY_OF_WEEK:
                case DAY_OF_YEAR:
                case DAY_OF_MONTH:
                    amount *= ONE_DAY;
                    break;
                default:
                    throw new Error('illegal field for add');
                }
                self.setTime(self.time + amount);
            }
        },
        /**
         * add the year of the given calendar field.
         * @method addYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the month of the given calendar field.
         * @method addMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of month of the given calendar field.
         * @method addDayOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the hour of day of the given calendar field.
         * @method addHourOfDay
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the minute of the given calendar field.
         * @method addMinute
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the second of the given calendar field.
         * @method addSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the millisecond of the given calendar field.
         * @method addMilliSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the week of year of the given calendar field.
         * @method addWeekOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the week of month of the given calendar field.
         * @method addWeekOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of year of the given calendar field.
         * @method addDayOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of week of the given calendar field.
         * @method addDayOfWeek
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of week in month of the given calendar field.
         * @method addDayOfWeekInMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * Get rolled value for the field
         * @protected
         */
        getRolledValue: function (value, amount, min, max) {
            var diff = value - min;
            var range = max - min + 1;
            amount %= range;
            return min + (diff + amount + range) % range;
        },
        /**
         * Adds a signed amount to the specified calendar field without changing larger fields.
         * A negative roll amount means to subtract from field without changing
         * larger fields. If the specified amount is 0, this method performs nothing.
         *
         *
         *
         *      @example
         *      var d = new GregorianCalendar();
         *      d.set(1999, GregorianCalendar.AUGUST, 31);
         *      // 1999-4-30
         *      // Tuesday June 1, 1999
         *      d.set(1999, GregorianCalendar.JUNE, 1);
         *      d.add(Gregorian.WEEK_OF_MONTH,-1); // === d.add(Gregorian.WEEK_OF_MONTH,
         *      d.get(Gregorian.WEEK_OF_MONTH));
         *      // 1999-06-29
         *
         *
         * @param field the calendar field.
         * @param {Number} amount the signed amount to add to field.
         */
        roll: function (field, amount) {
            if (!amount) {
                return;
            }
            var self = this;    // computer and retrieve original value
                                // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            var value = self.get(field);
            var min = self.getActualMinimum(field);
            var max = self.getActualMaximum(field);
            value = self.getRolledValue(value, amount, min, max);
            self.set(field, value);    // consider compute time priority
                                       // consider compute time priority
            // consider compute time priority
            // consider compute time priority
            switch (field) {
            case MONTH:
                adjustDayOfMonth(self);
                break;
            default:
                // other fields are set already when get
                self.updateFieldsBySet(field);
                break;
            }
        },
        /**
         * roll the year of the given calendar field.
         * @method rollYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the month of the given calendar field.
         * @param {Number} amount the signed amount to add to field.
         * @method rollMonth
         */
        /**
         * roll the day of month of the given calendar field.
         * @method rollDayOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the hour of day of the given calendar field.
         * @method rollHourOfDay
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the minute of the given calendar field.
         * @method rollMinute
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the second of the given calendar field.
         * @method rollSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the millisecond of the given calendar field.
         * @method rollMilliSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the week of year of the given calendar field.
         * @method rollWeekOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the week of month of the given calendar field.
         * @method rollWeekOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the day of year of the given calendar field.
         * @method rollDayOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the day of week of the given calendar field.
         * @method rollDayOfWeek
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * remove other priority fields when call getFixedDate
         * precondition: other fields are all set or computed
         * @protected
         */
        updateFieldsBySet: function (field) {
            var fields = this.fields;
            switch (field) {
            case WEEK_OF_MONTH:
                fields[DAY_OF_MONTH] = undefined;
                break;
            case DAY_OF_YEAR:
                fields[MONTH] = undefined;
                break;
            case DAY_OF_WEEK:
                fields[DAY_OF_MONTH] = undefined;
                break;
            case WEEK_OF_YEAR:
                fields[DAY_OF_YEAR] = undefined;
                fields[MONTH] = undefined;
                break;
            }
        },
        /**
         * get current date instance's timezone offset
         * @returns {Number}
         */
        getTimezoneOffset: function () {
            return this.timezoneOffset;
        },
        /**
         * set current date instance's timezone offset
         */
        setTimezoneOffset: function (timezoneOffset) {
            if (this.timezoneOffset !== timezoneOffset) {
                this.fieldsComputed = undefined;
                this.timezoneOffset = timezoneOffset;
            }
        },
        /**
         * set first day of week for current date instance
         */
        setFirstDayOfWeek: function (firstDayOfWeek) {
            if (this.firstDayOfWeek !== firstDayOfWeek) {
                this.firstDayOfWeek = firstDayOfWeek;
                this.fieldsComputed = false;
            }
        },
        /**
         * Gets what the first day of the week is; e.g., SUNDAY in the U.S., MONDAY in France.
         * @returns {Number} the first day of the week.
         */
        getFirstDayOfWeek: function () {
            return this.firstDayOfWeek;
        },
        /**
         * Sets what the minimal days required in the first week of the year are; For example,
         * if the first week is defined as one that contains the first day of the first month of a year,
         * call this method with value 1.
         * If it must be a full week, use value 7.
         * @param minimalDaysInFirstWeek the given minimal days required in the first week of the year.
         */
        setMinimalDaysInFirstWeek: function (minimalDaysInFirstWeek) {
            if (this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek) {
                this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
                this.fieldsComputed = false;
            }
        },
        /**
         * Gets what the minimal days required in the first week of the year are; e.g.,
         * if the first week is defined as one that contains the first day of the first month of a year,
         * this method returns 1.
         * If the minimal days required must be a full week, this method returns 7.
         * @returns {Number} the minimal days required in the first week of the year.
         */
        getMinimalDaysInFirstWeek: function () {
            return this.minimalDaysInFirstWeek;
        },
        /**
         * Returns the number of weeks in the week year
         * represented by this GregorianCalendar.
         *
         * For example, if this GregorianCalendar's date is
         * December 31, 2008 with the ISO
         * 8601 compatible setting, this method will return 53 for the
         * period: December 29, 2008 to January 3, 2010
         * while getActualMaximum(WEEK_OF_YEAR) will return
         * 52 for the period: December 31, 2007 to December 28, 2008.
         *
         * @return {Number} the number of weeks in the week year.
         */
        getWeeksInWeekYear: function () {
            var weekYear = this.getWeekYear();
            if (weekYear === this.get(YEAR)) {
                return this.getActualMaximum(WEEK_OF_YEAR);
            }    // Use the 2nd week for calculating the max of WEEK_OF_YEAR
                 // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            var gc = this.clone();
            gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
            return gc.getActualMaximum(WEEK_OF_YEAR);
        },
        /**
         * Returns the week year represented by this GregorianCalendar.
         * The dates in the weeks between 1 and the
         * maximum week number of the week year have the same week year value
         * that may be one year before or after the calendar year value.
         *
         * @return {Number} the week year represented by this GregorianCalendar.
         */
        getWeekYear: function () {
            var year = this.get(YEAR);    // implicitly  complete
                                          // implicitly  complete
            // implicitly  complete
            // implicitly  complete
            var weekOfYear = this.get(WEEK_OF_YEAR);
            var month = this.get(MONTH);
            if (month === GregorianCalendar.JANUARY) {
                if (weekOfYear >= 52) {
                    --year;
                }
            } else if (month === GregorianCalendar.DECEMBER) {
                if (weekOfYear === 1) {
                    ++year;
                }
            }
            return year;
        },
        /**
         * Sets this GregorianCalendar to the date given by the date specifiers - weekYear,
         * weekOfYear, and dayOfWeek. weekOfYear follows the WEEK_OF_YEAR numbering.
         * The dayOfWeek value must be one of the DAY_OF_WEEK values: SUNDAY to SATURDAY.
         *
         * @param weekYear    the week year
         * @param weekOfYear  the week number based on weekYear
         * @param dayOfWeek   the day of week value
         */
        setWeekDate: function (weekYear, weekOfYear, dayOfWeek) {
            if (dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY) {
                throw new Error('invalid dayOfWeek: ' + dayOfWeek);
            }
            var fields = this.fields;    // To avoid changing the time of day fields by date
                                         // calculations, use a clone with the GMT time zone.
                                         // To avoid changing the time of day fields by date
                                         // calculations, use a clone with the GMT time zone.
            // To avoid changing the time of day fields by date
            // calculations, use a clone with the GMT time zone.
            // To avoid changing the time of day fields by date
            // calculations, use a clone with the GMT time zone.
            var gc = this.clone();
            gc.clear();
            gc.setTimezoneOffset(0);
            gc.set(YEAR, weekYear);
            gc.set(WEEK_OF_YEAR, 1);
            gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
            var days = dayOfWeek - this.getFirstDayOfWeek();
            if (days < 0) {
                days += 7;
            }
            days += 7 * (weekOfYear - 1);
            if (days !== 0) {
                gc.add(DAY_OF_YEAR, days);
            } else {
                gc.complete();
            }
            fields[YEAR] = gc.get(YEAR);
            fields[MONTH] = gc.get(MONTH);
            fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
            this.complete();
        },
        /**
         * Creates and returns a copy of this object.
         * @returns {KISSY.Date.Gregorian}
         */
        clone: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
            cal.setTime(this.time);
            return cal;
        },
        /**
         * Compares this GregorianCalendar to the specified Object.
         * The result is true if and only if the argument is a GregorianCalendar object
         * that represents the same time value (millisecond offset from the Epoch)
         * under the same Calendar parameters and Gregorian change date as this object.
         * @param {KISSY.Date.Gregorian} obj the object to compare with.
         * @returns {boolean} true if this object is equal to obj; false otherwise.
         */
        equals: function (obj) {
            return this.getTime() === obj.getTime() && this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek;
        },
        /**
         * Sets all the calendar field values or specified field and the time value
         * (millisecond offset from the Epoch) of this Calendar undefined.
         * This means that isSet() will return false for all the calendar fields,
         * and the date and time calculations will treat the fields as if they had never been set.
         * @param [field] the calendar field to be cleared.
         */
        clear: function (field) {
            if (field === undefined) {
                this.field = [];
            } else {
                this.fields[field] = undefined;
            }
            this.time = undefined;
            this.fieldsComputed = false;
        }
    };
    var GregorianCalendarProto = GregorianCalendar.prototype;
    if ('@DEBUG@') {
        // for idea
        GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
    }
    S.each(fields, function (f, index) {
        if (f) {
            GregorianCalendarProto['get' + f] = function () {
                return this.get(index);
            };
            GregorianCalendarProto['isSet' + f] = function () {
                return this.isSet(index);
            };
            GregorianCalendarProto['set' + f] = function (v) {
                return this.set(index, v);
            };
            GregorianCalendarProto['add' + f] = function (v) {
                return this.add(index, v);
            };
            GregorianCalendarProto['roll' + f] = function (v) {
                return this.roll(index, v);
            };
        }
    });    // ------------------- private start
           // ------------------- private start
    // ------------------- private start
    // ------------------- private start
    function adjustDayOfMonth(self) {
        var fields = self.fields;
        var year = fields[YEAR];
        var month = fields[MONTH];
        var monthLen = getMonthLength(year, month);
        var dayOfMonth = fields[DAY_OF_MONTH];
        if (dayOfMonth > monthLen) {
            self.set(DAY_OF_MONTH, monthLen);
        }
    }
    function getMonthLength(year, month) {
        return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
    }
    function getYearLength(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function getWeekNumber(self, fixedDay1, fixedDate) {
        var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
        var nDays = fixedDay1st - fixedDay1;
        if (nDays >= self.minimalDaysInFirstWeek) {
            fixedDay1st -= 7;
        }
        var normalizedDayOfPeriod = fixedDate - fixedDay1st;
        return floorDivide(normalizedDayOfPeriod / 7) + 1;
    }
    function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
        // 1.1.1 is monday
        // one week has 7 days
        return fixedDate - mod(fixedDate - dayOfWeek, 7);
    }    // ------------------- private end
         // ------------------- private end
    // ------------------- private end
    // ------------------- private end
    return GregorianCalendar;
});    /*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */
       /**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */
/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */
/**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian/utils', ['./const'], function (S, require) {
    var Const = require('./const');
    var ACCUMULATED_DAYS_IN_MONTH    //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
 = //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        [
            0,
            31,
            59,
            90,
            120,
            151,
            181,
            212,
            243,
            273,
            304,
            334
        ], ACCUMULATED_DAYS_IN_MONTH_LEAP    //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
                                          // 10/1   11/1   12/1
 = //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
        // 10/1   11/1   12/1
        //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
        // 10/1   11/1   12/1
        [
            0,
            31,
            59 + 1,
            90 + 1,
            120 + 1,
            151 + 1,
            181 + 1,
            212 + 1,
            243 + 1,
            273 + 1,
            304 + 1,
            334 + 1
        ], DAYS_OF_YEAR = 365, DAYS_OF_4YEAR = 365 * 4 + 1, DAYS_OF_100YEAR = DAYS_OF_4YEAR * 25 - 1, DAYS_OF_400YEAR = DAYS_OF_100YEAR * 4 + 1, Utils = {};
    function getDayOfYear(year, month, dayOfMonth) {
        return dayOfMonth + (isLeapYear(year) ? ACCUMULATED_DAYS_IN_MONTH_LEAP[month] : ACCUMULATED_DAYS_IN_MONTH[month]);
    }
    function getDayOfWeekFromFixedDate(fixedDate) {
        // The fixed day 1 (January 1, 1 Gregorian) is Monday.
        if (fixedDate >= 0) {
            return fixedDate % 7;
        }
        return mod(fixedDate, 7);
    }
    function getGregorianYearFromFixedDate(fixedDate) {
        var d0;
        var d1, d2, d3;    //, d4;
                           //, d4;
        //, d4;
        //, d4;
        var n400, n100, n4, n1;
        var year;
        d0 = fixedDate - 1;
        n400 = floorDivide(d0 / DAYS_OF_400YEAR);
        d1 = mod(d0, DAYS_OF_400YEAR);
        n100 = floorDivide(d1 / DAYS_OF_100YEAR);
        d2 = mod(d1, DAYS_OF_100YEAR);
        n4 = floorDivide(d2 / DAYS_OF_4YEAR);
        d3 = mod(d2, DAYS_OF_4YEAR);
        n1 = floorDivide(d3 / DAYS_OF_YEAR);
        year = 400 * n400 + 100 * n100 + 4 * n4 + n1;    // ?
                                                         // ?
        // ?
        // ?
        if (!(n100 === 4 || n1 === 4)) {
            ++year;
        }
        return year;
    }
    S.mix(Utils, {
        isLeapYear: function (year) {
            if ((year & 3) !== 0) {
                return false;
            }
            return year % 100 !== 0 || year % 400 === 0;
        },
        mod: function (x, y) {
            // 负数时不是镜像关系
            return x - y * floorDivide(x / y);
        },
        // month: 0 based
        getFixedDate: function (year, month, dayOfMonth) {
            var prevYear = year - 1;    // 考虑公元前
                                        // 考虑公元前
            // 考虑公元前
            // 考虑公元前
            return DAYS_OF_YEAR * prevYear + floorDivide(prevYear / 4) - floorDivide(prevYear / 100) + floorDivide(prevYear / 400) + getDayOfYear(year, month, dayOfMonth);
        },
        getGregorianDateFromFixedDate: function (fixedDate) {
            var year = getGregorianYearFromFixedDate(fixedDate);
            var jan1 = Utils.getFixedDate(year, Const.JANUARY, 1);
            var isLeap = isLeapYear(year);
            var ACCUMULATED_DAYS = isLeap ? ACCUMULATED_DAYS_IN_MONTH_LEAP : ACCUMULATED_DAYS_IN_MONTH;
            var daysDiff = fixedDate - jan1;
            var month, i;
            for (i = 0; i < ACCUMULATED_DAYS.length; i++) {
                if (ACCUMULATED_DAYS[i] <= daysDiff) {
                    month = i;
                } else {
                    break;
                }
            }
            var dayOfMonth = fixedDate - jan1 - ACCUMULATED_DAYS[month] + 1;
            var dayOfWeek = getDayOfWeekFromFixedDate(fixedDate);
            return {
                year: year,
                month: month,
                dayOfMonth: dayOfMonth,
                dayOfWeek: dayOfWeek,
                isLeap: isLeap
            };
        }
    });
    var floorDivide = Math.floor, isLeapYear = Utils.isLeapYear, mod = Utils.mod;
    return Utils;
});    /**
 * @ignore
 * const for gregorian date
 * @author yiminghe@gmail.com
 */
/**
 * @ignore
 * const for gregorian date
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian/const', [], function () {
    return {
        /**
         * Enum indicating sunday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        SUNDAY: 0,
        /**
         * Enum indicating monday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        MONDAY: 1,
        /**
         * Enum indicating tuesday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        TUESDAY: 2,
        /**
         * Enum indicating wednesday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        WEDNESDAY: 3,
        /**
         * Enum indicating thursday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        THURSDAY: 4,
        /**
         * Enum indicating friday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        FRIDAY: 5,
        /**
         * Enum indicating saturday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        SATURDAY: 6,
        /**
         * Enum indicating january
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        JANUARY: 0,
        /**
         * Enum indicating february
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        FEBRUARY: 1,
        /**
         * Enum indicating march
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        MARCH: 2,
        /**
         * Enum indicating april
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        APRIL: 3,
        /**
         * Enum indicating may
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        MAY: 4,
        /**
         * Enum indicating june
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        JUNE: 5,
        /**
         * Enum indicating july
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        JULY: 6,
        /**
         * Enum indicating august
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        AUGUST: 7,
        /**
         * Enum indicating september
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        SEPTEMBER: 8,
        /**
         * Enum indicating october
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        OCTOBER: 9,
        /**
         * Enum indicating november
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        NOVEMBER: 10,
        /**
         * Enum indicating december
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        DECEMBER: 11
    };
});






/**
 * @ignore
 * month panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/month-panel/control', [
    'node',
    'component/control',
    '../year-panel/control',
    'date/format',
    './months-xtpl',
    './month-panel-xtpl',
    'event/gesture/tap'
], function (S, require) {
    var Node = require('node'), Control = require('component/control'), YearPanel = require('../year-panel/control');
    var DateFormat = require('date/format'), MonthsTpl = require('./months-xtpl'), MonthPanelTpl = require('./month-panel-xtpl');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;
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
        S.mix(self.renderData, {
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
    return Control.extend({
        beforeCreateDom: function (renderData) {
            var self = this;
            var locale = self.get('locale');
            S.mix(renderData, {
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
/**
 * @ignore
 * month select for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/year-panel/control', [
    'node',
    'component/control',
    '../decade-panel/control',
    'event/gesture/tap',
    'date/format',
    './years-xtpl',
    './year-panel-xtpl'
], function (S, require) {
    var Node = require('node'), Control = require('component/control'), DecadePanel = require('../decade-panel/control');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;
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
    return Control.extend({
        beforeCreateDom: function (renderData) {
            var self = this;
            var value = self.get('value');
            var currentYear = value.getYear();
            var startYear = parseInt(currentYear / 10, 10) * 10;
            var endYear = startYear + 9;
            var locale = self.get('locale');
            S.mix(renderData, {
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
            S.mix(self.renderData, {
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
/**
 * @ignore
 * decade panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/decade-panel/control', [
    'node',
    'event/gesture/tap',
    'component/control',
    './decade-panel-xtpl',
    './decades-xtpl'
], function (S, require) {
    var Node = require('node');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;
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
        S.mix(view.renderData, {
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
    return Control.extend({
        beforeCreateDom: function (renderData, childrenSelectors) {
            var self = this;
            var locale = self.get('locale');
            prepareYears(self, this);
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

/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/decade-panel/decade-panel-xtpl', ['./decades-xtpl'], function (S, require, exports, module) {
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
    var t = function (scope, buffer, payload, undefined) {
        var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
        if ('5.0.0' !== S.version) {
            throw new Error('current xtemplate file(' + engine.name + ')(v5.0.0) need to be recompiled using current kissy(v' + S.version + ')!');
        }
        var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var commandRet2 = callCommandUtil(engine, scope, option0, buffer, 'getBaseCssClasses', 1);
        if (commandRet2 && commandRet2.isBuffer) {
            buffer = commandRet2;
            commandRet2 = undefined;
        }
        buffer.write(commandRet2, true);
        buffer.write('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-century-btn');
        option3.params = params4;
        var commandRet5 = callCommandUtil(engine, scope, option3, buffer, 'getBaseCssClasses', 2);
        if (commandRet5 && commandRet5.isBuffer) {
            buffer = commandRet5;
            commandRet5 = undefined;
        }
        buffer.write(commandRet5, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousCenturyLabel']);
        buffer.write(id6, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <div class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('century');
        option7.params = params8;
        var commandRet9 = callCommandUtil(engine, scope, option7, buffer, 'getBaseCssClasses', 8);
        if (commandRet9 && commandRet9.isBuffer) {
            buffer = commandRet9;
            commandRet9 = undefined;
        }
        buffer.write(commandRet9, true);
        buffer.write('">\r\n                ');
        var id10 = scope.resolve(['startYear']);
        buffer.write(id10, true);
        buffer.write('-');
        var id11 = scope.resolve(['endYear']);
        buffer.write(id11, true);
        buffer.write('\r\n    </div>\r\n    <a class="');
        var option12 = { escape: 1 };
        var params13 = [];
        params13.push('next-century-btn');
        option12.params = params13;
        var commandRet14 = callCommandUtil(engine, scope, option12, buffer, 'getBaseCssClasses', 11);
        if (commandRet14 && commandRet14.isBuffer) {
            buffer = commandRet14;
            commandRet14 = undefined;
        }
        buffer.write(commandRet14, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id15 = scope.resolve(['nextCenturyLabel']);
        buffer.write(id15, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option16 = { escape: 1 };
        var params17 = [];
        params17.push('body');
        option16.params = params17;
        var commandRet18 = callCommandUtil(engine, scope, option16, buffer, 'getBaseCssClasses', 18);
        if (commandRet18 && commandRet18.isBuffer) {
            buffer = commandRet18;
            commandRet18 = undefined;
        }
        buffer.write(commandRet18, true);
        buffer.write('">\r\n    <table class="');
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('table');
        option19.params = params20;
        var commandRet21 = callCommandUtil(engine, scope, option19, buffer, 'getBaseCssClasses', 19);
        if (commandRet21 && commandRet21.isBuffer) {
            buffer = commandRet21;
            commandRet21 = undefined;
        }
        buffer.write(commandRet21, true);
        buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="');
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('tbody');
        option22.params = params23;
        var commandRet24 = callCommandUtil(engine, scope, option22, buffer, 'getBaseCssClasses', 20);
        if (commandRet24 && commandRet24.isBuffer) {
            buffer = commandRet24;
            commandRet24 = undefined;
        }
        buffer.write(commandRet24, true);
        buffer.write('">\r\n        ');
        var option25 = {};
        var params26 = [];
        params26.push('./decades-xtpl');
        option25.params = params26;
        require('./decades-xtpl');
        option25.params[0] = module.resolve(option25.params[0]);
        var commandRet27 = includeCommand.call(engine, scope, option25, buffer, 21, payload);
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
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/decade-panel/decades-xtpl', [], function (S, require, exports, module) {
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
    var t = function (scope, buffer, payload, undefined) {
        var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
        if ('5.0.0' !== S.version) {
            throw new Error('current xtemplate file(' + engine.name + ')(v5.0.0) need to be recompiled using current kissy(v' + S.version + ')!');
        }
        var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands['debugger'];
        buffer.write('');
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['decades']);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.write('\r\n<tr role="row">\r\n    ');
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
                buffer.write('\r\n    <td role="gridcell"\r\n        class="');
                var option7 = { escape: 1 };
                var params8 = [];
                params8.push('cell');
                option7.params = params8;
                var commandRet9 = callCommandUtil(engine, scope, option7, buffer, 'getBaseCssClasses', 5);
                if (commandRet9 && commandRet9.isBuffer) {
                    buffer = commandRet9;
                    commandRet9 = undefined;
                }
                buffer.write(commandRet9, true);
                buffer.write('\r\n        ');
                var option10 = { escape: 1 };
                var params11 = [];
                var id12 = scope.resolve(['startDecade']);
                var exp14 = id12;
                var id13 = scope.resolve(['year']);
                exp14 = id12 <= id13;
                var exp18 = exp14;
                if (exp14) {
                    var id15 = scope.resolve(['year']);
                    var exp17 = id15;
                    var id16 = scope.resolve(['endDecade']);
                    exp17 = id15 <= id16;
                    exp18 = exp17;
                }
                params11.push(exp18);
                option10.params = params11;
                option10.fn = function (scope, buffer) {
                    buffer.write('\r\n         ');
                    var option19 = { escape: 1 };
                    var params20 = [];
                    params20.push('selected-cell');
                    option19.params = params20;
                    var commandRet21 = callCommandUtil(engine, scope, option19, buffer, 'getBaseCssClasses', 7);
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
                var option22 = { escape: 1 };
                var params23 = [];
                var id24 = scope.resolve(['startDecade']);
                var exp26 = id24;
                var id25 = scope.resolve(['startYear']);
                exp26 = id24 < id25;
                params23.push(exp26);
                option22.params = params23;
                option22.fn = function (scope, buffer) {
                    buffer.write('\r\n         ');
                    var option27 = { escape: 1 };
                    var params28 = [];
                    params28.push('last-century-cell');
                    option27.params = params28;
                    var commandRet29 = callCommandUtil(engine, scope, option27, buffer, 'getBaseCssClasses', 10);
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
                var option30 = { escape: 1 };
                var params31 = [];
                var id32 = scope.resolve(['endDecade']);
                var exp34 = id32;
                var id33 = scope.resolve(['endYear']);
                exp34 = id32 > id33;
                params31.push(exp34);
                option30.params = params31;
                option30.fn = function (scope, buffer) {
                    buffer.write('\r\n         ');
                    var option35 = { escape: 1 };
                    var params36 = [];
                    params36.push('next-century-cell');
                    option35.params = params36;
                    var commandRet37 = callCommandUtil(engine, scope, option35, buffer, 'getBaseCssClasses', 13);
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
                var option38 = { escape: 1 };
                var params39 = [];
                params39.push('decade');
                option38.params = params39;
                var commandRet40 = callCommandUtil(engine, scope, option38, buffer, 'getBaseCssClasses', 19);
                if (commandRet40 && commandRet40.isBuffer) {
                    buffer = commandRet40;
                    commandRet40 = undefined;
                }
                buffer.write(commandRet40, true);
                buffer.write('">\r\n            ');
                var id41 = scope.resolve(['startDecade']);
                buffer.write(id41, true);
                buffer.write('-');
                var id42 = scope.resolve(['endDecade']);
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
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 11:58
*/
/*
combined modules:
date/format
date/gregorian
*/
/**
 * @ignore
 * DateTimeFormat for KISSY.
 * Inspired by DateTimeFormat from JDK.
 * @author yiminghe@gmail.com
 */
KISSY.add('date/format', [
    'date/gregorian',
    'i18n!date',
    './gregorian/utils',
    'i18n!date',
    './gregorian/const',
    './const'
], 'date/format', [
    'date/gregorian',
    'i18n!date'
], function (S, require) {
    var GregorianCalendar = require('date/gregorian');
    var defaultLocale = require('i18n!date');
    var MAX_VALUE = Number.MAX_VALUE,
        /**
         * date or time style enum
         * @enum {Number} KISSY.Date.Formatter.Style
         */
        DateTimeStyle = {
            /**
             * full style
             */
            FULL: 0,
            /**
             * long style
             */
            LONG: 1,
            /**
             * medium style
             */
            MEDIUM: 2,
            /**
             * short style
             */
            SHORT: 3
        };    /*
     Letter    Date or Time Component    Presentation    Examples
     G    Era designator    Text    AD
     y    Year    Year    1996; 96
     M    Month in year    Month    July; Jul; 07
     w    Week in year    Number    27
     W    Week in month    Number    2
     D    Day in year    Number    189
     d    Day in month    Number    10
     F    Day of week in month    Number    2
     E    Day in week    Text    Tuesday; Tue
     a    Am/pm marker    Text    PM
     H    Hour in day (0-23)    Number    0
     k    Hour in day (1-24)    Number    24
     K    Hour in am/pm (0-11)    Number    0
     h    Hour in am/pm (1-12)    Number    12
     m    Minute in hour    Number    30
     s    Second in minute    Number    55
     S    Millisecond    Number    978
     x z    Time zone    General time zone    Pacific Standard Time; PST; GMT-08:00
     Z    Time zone    RFC 822 time zone    -0800
     */
              /*
     Letter    Date or Time Component    Presentation    Examples
     G    Era designator    Text    AD
     y    Year    Year    1996; 96
     M    Month in year    Month    July; Jul; 07
     w    Week in year    Number    27
     W    Week in month    Number    2
     D    Day in year    Number    189
     d    Day in month    Number    10
     F    Day of week in month    Number    2
     E    Day in week    Text    Tuesday; Tue
     a    Am/pm marker    Text    PM
     H    Hour in day (0-23)    Number    0
     k    Hour in day (1-24)    Number    24
     K    Hour in am/pm (0-11)    Number    0
     h    Hour in am/pm (1-12)    Number    12
     m    Minute in hour    Number    30
     s    Second in minute    Number    55
     S    Millisecond    Number    978
     x z    Time zone    General time zone    Pacific Standard Time; PST; GMT-08:00
     Z    Time zone    RFC 822 time zone    -0800
     */
    /*
     Letter    Date or Time Component    Presentation    Examples
     G    Era designator    Text    AD
     y    Year    Year    1996; 96
     M    Month in year    Month    July; Jul; 07
     w    Week in year    Number    27
     W    Week in month    Number    2
     D    Day in year    Number    189
     d    Day in month    Number    10
     F    Day of week in month    Number    2
     E    Day in week    Text    Tuesday; Tue
     a    Am/pm marker    Text    PM
     H    Hour in day (0-23)    Number    0
     k    Hour in day (1-24)    Number    24
     K    Hour in am/pm (0-11)    Number    0
     h    Hour in am/pm (1-12)    Number    12
     m    Minute in hour    Number    30
     s    Second in minute    Number    55
     S    Millisecond    Number    978
     x z    Time zone    General time zone    Pacific Standard Time; PST; GMT-08:00
     Z    Time zone    RFC 822 time zone    -0800
     */
    /*
     Letter    Date or Time Component    Presentation    Examples
     G    Era designator    Text    AD
     y    Year    Year    1996; 96
     M    Month in year    Month    July; Jul; 07
     w    Week in year    Number    27
     W    Week in month    Number    2
     D    Day in year    Number    189
     d    Day in month    Number    10
     F    Day of week in month    Number    2
     E    Day in week    Text    Tuesday; Tue
     a    Am/pm marker    Text    PM
     H    Hour in day (0-23)    Number    0
     k    Hour in day (1-24)    Number    24
     K    Hour in am/pm (0-11)    Number    0
     h    Hour in am/pm (1-12)    Number    12
     m    Minute in hour    Number    30
     s    Second in minute    Number    55
     S    Millisecond    Number    978
     x z    Time zone    General time zone    Pacific Standard Time; PST; GMT-08:00
     Z    Time zone    RFC 822 time zone    -0800
     */
    var logger = S.getLogger('s/date/format');
    var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).join('1');
    var ERA = 0;
    var calendarIndexMap = {};
    patternChars = patternChars.split('');
    patternChars[ERA] = 'G';
    patternChars[GregorianCalendar.YEAR] = 'y';
    patternChars[GregorianCalendar.MONTH] = 'M';
    patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
    patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
    patternChars[GregorianCalendar.MINUTES] = 'm';
    patternChars[GregorianCalendar.SECONDS] = 's';
    patternChars[GregorianCalendar.MILLISECONDS] = 'S';
    patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
    patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
    patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
    patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';
    S.each(patternChars, function (v, index) {
        calendarIndexMap[v] = index;
    });
    patternChars = /**
     @ignore
     @type String
     */
    patternChars.join('') + 'ahkKZE';
    function encode(lastField, count, compiledPattern) {
        compiledPattern.push({
            field: lastField,
            count: count
        });
    }
    function compile(pattern) {
        var length = pattern.length;
        var inQuote = false;
        var compiledPattern = [];
        var tmpBuffer = null;
        var count = 0;
        var lastField = -1;
        for (var i = 0; i < length; i++) {
            var c = pattern.charAt(i);
            if (c === '\'') {
                // '' is treated as a single quote regardless of being
                // in a quoted section.
                if (i + 1 < length) {
                    c = pattern.charAt(i + 1);
                    if (c === '\'') {
                        i++;
                        if (count !== 0) {
                            encode(lastField, count, compiledPattern);
                            lastField = -1;
                            count = 0;
                        }
                        if (inQuote) {
                            tmpBuffer += c;
                        }
                        continue;
                    }
                }
                if (!inQuote) {
                    if (count !== 0) {
                        encode(lastField, count, compiledPattern);
                        lastField = -1;
                        count = 0;
                    }
                    tmpBuffer = '';
                    inQuote = true;
                } else {
                    compiledPattern.push({ text: tmpBuffer });
                    inQuote = false;
                }
                continue;
            }
            if (inQuote) {
                tmpBuffer += c;
                continue;
            }
            if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z')) {
                if (count !== 0) {
                    encode(lastField, count, compiledPattern);
                    lastField = -1;
                    count = 0;
                }
                compiledPattern.push({ text: c });
                continue;
            }
            if (patternChars.indexOf(c) === -1) {
                throw new Error('Illegal pattern character "' + c + '"');
            }
            if (lastField === -1 || lastField === c) {
                lastField = c;
                count++;
                continue;
            }
            encode(lastField, count, compiledPattern);
            lastField = c;
            count = 1;
        }
        if (inQuote) {
            throw new Error('Unterminated quote');
        }
        if (count !== 0) {
            encode(lastField, count, compiledPattern);
        }
        return compiledPattern;
    }
    var zeroDigit = '0';    // TODO zeroDigit localization??
                            // TODO zeroDigit localization??
    // TODO zeroDigit localization??
    // TODO zeroDigit localization??
    function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
        // Optimization for 1, 2 and 4 digit numbers. This should
        // cover most cases of formatting date/time related items.
        // Note: This optimization code assumes that maxDigits is
        // either 2 or Integer.MAX_VALUE (maxIntCount in format()).
        buffer = buffer || [];
        maxDigits = maxDigits || MAX_VALUE;
        if (value >= 0) {
            if (value < 100 && minDigits >= 1 && minDigits <= 2) {
                if (value < 10 && minDigits === 2) {
                    buffer.push(zeroDigit);
                }
                buffer.push(value);
                return buffer.join('');
            } else if (value >= 1000 && value < 10000) {
                if (minDigits === 4) {
                    buffer.push(value);
                    return buffer.join('');
                }
                if (minDigits === 2 && maxDigits === 2) {
                    return zeroPaddingNumber(value % 100, 2, 2, buffer);
                }
            }
        }
        buffer.push(value + '');
        return buffer.join('');
    }    /**
     *
     * date time formatter for KISSY gregorian date.
     *
     *      @example
     *      KISSY.use('date/format,date/gregorian',function(S, DateFormat, GregorianCalendar){
     *          var calendar = new GregorianCalendar(2013,9,24);
     *          // ' to escape
     *          var formatter = new DateFormat("'today is' ''yyyy/MM/dd a''");
     *          document.write(formatter.format(calendar));
     *      });
     *
     * @class KISSY.Date.Formatter
     * @param {String} pattern patter string of date formatter
     *
     * <table border="1">
     * <thead valign="bottom">
     * <tr><th class="head">Letter</th>
     * <th class="head">Date or Time Component</th>
     * <th class="head">Presentation</th>
     * <th class="head">Examples</th>
     * </tr>
     * </thead>
     * <tbody valign="top">
     * <tr><td>G</td>
     * <td>Era designator</td>
     * <td>Text</td>
     * <td>AD</td>
     * </tr>
     * <tr><td>y</td>
     * <td>Year</td>
     * <td>Year</td>
     * <td>1996; 96</td>
     * </tr>
     * <tr><td>M</td>
     * <td>Month in year</td>
     * <td>Month</td>
     * <td>July; Jul; 07</td>
     * </tr>
     * <tr><td>w</td>
     * <td>Week in year</td>
     * <td>Number</td>
     * <td>27</td>
     * </tr>
     * <tr><td>W</td>
     * <td>Week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>D</td>
     * <td>Day in year</td>
     * <td>Number</td>
     * <td>189</td>
     * </tr>
     * <tr><td>d</td>
     * <td>Day in month</td>
     * <td>Number</td>
     * <td>10</td>
     * </tr>
     * <tr><td>F</td>
     * <td>Day of week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>E</td>
     * <td>Day in week</td>
     * <td>Text</td>
     * <td>Tuesday; Tue</td>
     * </tr>
     * <tr><td>a</td>
     * <td>Am/pm marker</td>
     * <td>Text</td>
     * <td>PM</td>
     * </tr>
     * <tr><td>H</td>
     *       <td>Hour in day (0-23)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>k</td>
     *       <td>Hour in day (1-24)</td>
     * <td>Number</td>
     * <td>24</td>
     * </tr>
     * <tr><td>K</td>
     * <td>Hour in am/pm (0-11)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>h</td>
     * <td>Hour in am/pm (1-12)</td>
     * <td>Number</td>
     * <td>12</td>
     * </tr>
     * <tr><td>m</td>
     * <td>Minute in hour</td>
     * <td>Number</td>
     * <td>30</td>
     * </tr>
     * <tr><td>s</td>
     * <td>Second in minute</td>
     * <td>Number</td>
     * <td>55</td>
     * </tr>
     * <tr><td>S</td>
     * <td>Millisecond</td>
     * <td>Number</td>
     * <td>978</td>
     * </tr>
     * <tr><td>x/z</td>
     * <td>Time zone</td>
     * <td>General time zone</td>
     * <td>Pacific Standard Time; PST; GMT-08:00</td>
     * </tr>
     * <tr><td>Z</td>
     * <td>Time zone</td>
     * <td>RFC 822 time zone</td>
     * <td>-0800</td>
     * </tr>
     * </tbody>
     * </table>

     * @param {Object} locale locale object
     * @param {Number} timeZoneOffset time zone offset by minutes
     */
         /**
     *
     * date time formatter for KISSY gregorian date.
     *
     *      @example
     *      KISSY.use('date/format,date/gregorian',function(S, DateFormat, GregorianCalendar){
     *          var calendar = new GregorianCalendar(2013,9,24);
     *          // ' to escape
     *          var formatter = new DateFormat("'today is' ''yyyy/MM/dd a''");
     *          document.write(formatter.format(calendar));
     *      });
     *
     * @class KISSY.Date.Formatter
     * @param {String} pattern patter string of date formatter
     *
     * <table border="1">
     * <thead valign="bottom">
     * <tr><th class="head">Letter</th>
     * <th class="head">Date or Time Component</th>
     * <th class="head">Presentation</th>
     * <th class="head">Examples</th>
     * </tr>
     * </thead>
     * <tbody valign="top">
     * <tr><td>G</td>
     * <td>Era designator</td>
     * <td>Text</td>
     * <td>AD</td>
     * </tr>
     * <tr><td>y</td>
     * <td>Year</td>
     * <td>Year</td>
     * <td>1996; 96</td>
     * </tr>
     * <tr><td>M</td>
     * <td>Month in year</td>
     * <td>Month</td>
     * <td>July; Jul; 07</td>
     * </tr>
     * <tr><td>w</td>
     * <td>Week in year</td>
     * <td>Number</td>
     * <td>27</td>
     * </tr>
     * <tr><td>W</td>
     * <td>Week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>D</td>
     * <td>Day in year</td>
     * <td>Number</td>
     * <td>189</td>
     * </tr>
     * <tr><td>d</td>
     * <td>Day in month</td>
     * <td>Number</td>
     * <td>10</td>
     * </tr>
     * <tr><td>F</td>
     * <td>Day of week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>E</td>
     * <td>Day in week</td>
     * <td>Text</td>
     * <td>Tuesday; Tue</td>
     * </tr>
     * <tr><td>a</td>
     * <td>Am/pm marker</td>
     * <td>Text</td>
     * <td>PM</td>
     * </tr>
     * <tr><td>H</td>
     *       <td>Hour in day (0-23)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>k</td>
     *       <td>Hour in day (1-24)</td>
     * <td>Number</td>
     * <td>24</td>
     * </tr>
     * <tr><td>K</td>
     * <td>Hour in am/pm (0-11)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>h</td>
     * <td>Hour in am/pm (1-12)</td>
     * <td>Number</td>
     * <td>12</td>
     * </tr>
     * <tr><td>m</td>
     * <td>Minute in hour</td>
     * <td>Number</td>
     * <td>30</td>
     * </tr>
     * <tr><td>s</td>
     * <td>Second in minute</td>
     * <td>Number</td>
     * <td>55</td>
     * </tr>
     * <tr><td>S</td>
     * <td>Millisecond</td>
     * <td>Number</td>
     * <td>978</td>
     * </tr>
     * <tr><td>x/z</td>
     * <td>Time zone</td>
     * <td>General time zone</td>
     * <td>Pacific Standard Time; PST; GMT-08:00</td>
     * </tr>
     * <tr><td>Z</td>
     * <td>Time zone</td>
     * <td>RFC 822 time zone</td>
     * <td>-0800</td>
     * </tr>
     * </tbody>
     * </table>

     * @param {Object} locale locale object
     * @param {Number} timeZoneOffset time zone offset by minutes
     */
    /**
     *
     * date time formatter for KISSY gregorian date.
     *
     *      @example
     *      KISSY.use('date/format,date/gregorian',function(S, DateFormat, GregorianCalendar){
     *          var calendar = new GregorianCalendar(2013,9,24);
     *          // ' to escape
     *          var formatter = new DateFormat("'today is' ''yyyy/MM/dd a''");
     *          document.write(formatter.format(calendar));
     *      });
     *
     * @class KISSY.Date.Formatter
     * @param {String} pattern patter string of date formatter
     *
     * <table border="1">
     * <thead valign="bottom">
     * <tr><th class="head">Letter</th>
     * <th class="head">Date or Time Component</th>
     * <th class="head">Presentation</th>
     * <th class="head">Examples</th>
     * </tr>
     * </thead>
     * <tbody valign="top">
     * <tr><td>G</td>
     * <td>Era designator</td>
     * <td>Text</td>
     * <td>AD</td>
     * </tr>
     * <tr><td>y</td>
     * <td>Year</td>
     * <td>Year</td>
     * <td>1996; 96</td>
     * </tr>
     * <tr><td>M</td>
     * <td>Month in year</td>
     * <td>Month</td>
     * <td>July; Jul; 07</td>
     * </tr>
     * <tr><td>w</td>
     * <td>Week in year</td>
     * <td>Number</td>
     * <td>27</td>
     * </tr>
     * <tr><td>W</td>
     * <td>Week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>D</td>
     * <td>Day in year</td>
     * <td>Number</td>
     * <td>189</td>
     * </tr>
     * <tr><td>d</td>
     * <td>Day in month</td>
     * <td>Number</td>
     * <td>10</td>
     * </tr>
     * <tr><td>F</td>
     * <td>Day of week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>E</td>
     * <td>Day in week</td>
     * <td>Text</td>
     * <td>Tuesday; Tue</td>
     * </tr>
     * <tr><td>a</td>
     * <td>Am/pm marker</td>
     * <td>Text</td>
     * <td>PM</td>
     * </tr>
     * <tr><td>H</td>
     *       <td>Hour in day (0-23)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>k</td>
     *       <td>Hour in day (1-24)</td>
     * <td>Number</td>
     * <td>24</td>
     * </tr>
     * <tr><td>K</td>
     * <td>Hour in am/pm (0-11)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>h</td>
     * <td>Hour in am/pm (1-12)</td>
     * <td>Number</td>
     * <td>12</td>
     * </tr>
     * <tr><td>m</td>
     * <td>Minute in hour</td>
     * <td>Number</td>
     * <td>30</td>
     * </tr>
     * <tr><td>s</td>
     * <td>Second in minute</td>
     * <td>Number</td>
     * <td>55</td>
     * </tr>
     * <tr><td>S</td>
     * <td>Millisecond</td>
     * <td>Number</td>
     * <td>978</td>
     * </tr>
     * <tr><td>x/z</td>
     * <td>Time zone</td>
     * <td>General time zone</td>
     * <td>Pacific Standard Time; PST; GMT-08:00</td>
     * </tr>
     * <tr><td>Z</td>
     * <td>Time zone</td>
     * <td>RFC 822 time zone</td>
     * <td>-0800</td>
     * </tr>
     * </tbody>
     * </table>

     * @param {Object} locale locale object
     * @param {Number} timeZoneOffset time zone offset by minutes
     */
    /**
     *
     * date time formatter for KISSY gregorian date.
     *
     *      @example
     *      KISSY.use('date/format,date/gregorian',function(S, DateFormat, GregorianCalendar){
     *          var calendar = new GregorianCalendar(2013,9,24);
     *          // ' to escape
     *          var formatter = new DateFormat("'today is' ''yyyy/MM/dd a''");
     *          document.write(formatter.format(calendar));
     *      });
     *
     * @class KISSY.Date.Formatter
     * @param {String} pattern patter string of date formatter
     *
     * <table border="1">
     * <thead valign="bottom">
     * <tr><th class="head">Letter</th>
     * <th class="head">Date or Time Component</th>
     * <th class="head">Presentation</th>
     * <th class="head">Examples</th>
     * </tr>
     * </thead>
     * <tbody valign="top">
     * <tr><td>G</td>
     * <td>Era designator</td>
     * <td>Text</td>
     * <td>AD</td>
     * </tr>
     * <tr><td>y</td>
     * <td>Year</td>
     * <td>Year</td>
     * <td>1996; 96</td>
     * </tr>
     * <tr><td>M</td>
     * <td>Month in year</td>
     * <td>Month</td>
     * <td>July; Jul; 07</td>
     * </tr>
     * <tr><td>w</td>
     * <td>Week in year</td>
     * <td>Number</td>
     * <td>27</td>
     * </tr>
     * <tr><td>W</td>
     * <td>Week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>D</td>
     * <td>Day in year</td>
     * <td>Number</td>
     * <td>189</td>
     * </tr>
     * <tr><td>d</td>
     * <td>Day in month</td>
     * <td>Number</td>
     * <td>10</td>
     * </tr>
     * <tr><td>F</td>
     * <td>Day of week in month</td>
     * <td>Number</td>
     * <td>2</td>
     * </tr>
     * <tr><td>E</td>
     * <td>Day in week</td>
     * <td>Text</td>
     * <td>Tuesday; Tue</td>
     * </tr>
     * <tr><td>a</td>
     * <td>Am/pm marker</td>
     * <td>Text</td>
     * <td>PM</td>
     * </tr>
     * <tr><td>H</td>
     *       <td>Hour in day (0-23)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>k</td>
     *       <td>Hour in day (1-24)</td>
     * <td>Number</td>
     * <td>24</td>
     * </tr>
     * <tr><td>K</td>
     * <td>Hour in am/pm (0-11)</td>
     * <td>Number</td>
     * <td>0</td>
     * </tr>
     * <tr><td>h</td>
     * <td>Hour in am/pm (1-12)</td>
     * <td>Number</td>
     * <td>12</td>
     * </tr>
     * <tr><td>m</td>
     * <td>Minute in hour</td>
     * <td>Number</td>
     * <td>30</td>
     * </tr>
     * <tr><td>s</td>
     * <td>Second in minute</td>
     * <td>Number</td>
     * <td>55</td>
     * </tr>
     * <tr><td>S</td>
     * <td>Millisecond</td>
     * <td>Number</td>
     * <td>978</td>
     * </tr>
     * <tr><td>x/z</td>
     * <td>Time zone</td>
     * <td>General time zone</td>
     * <td>Pacific Standard Time; PST; GMT-08:00</td>
     * </tr>
     * <tr><td>Z</td>
     * <td>Time zone</td>
     * <td>RFC 822 time zone</td>
     * <td>-0800</td>
     * </tr>
     * </tbody>
     * </table>

     * @param {Object} locale locale object
     * @param {Number} timeZoneOffset time zone offset by minutes
     */
    function DateTimeFormat(pattern, locale, timeZoneOffset) {
        this.locale = locale || defaultLocale;
        this.pattern = compile(pattern);
        this.timezoneOffset = timeZoneOffset;
    }
    function formatField(field, count, locale, calendar) {
        var current, value;
        switch (field) {
        case 'G':
            value = calendar.getYear() > 0 ? 1 : 0;
            current = locale.eras[value];
            break;
        case 'y':
            value = calendar.getYear();
            if (value <= 0) {
                value = 1 - value;
            }
            current = zeroPaddingNumber(value, 2, count !== 2 ? MAX_VALUE : 2);
            break;
        case 'M':
            value = calendar.getMonth();
            if (count >= 4) {
                current = locale.months[value];
            } else if (count === 3) {
                current = locale.shortMonths[value];
            } else {
                current = zeroPaddingNumber(value + 1, count);
            }
            break;
        case 'k':
            current = zeroPaddingNumber(calendar.getHourOfDay() || 24, count);
            break;
        case 'E':
            value = calendar.getDayOfWeek();
            current = count >= 4 ? locale.weekdays[value] : locale.shortWeekdays[value];
            break;
        case 'a':
            current = locale.ampms[calendar.getHourOfDay() >= 12 ? 1 : 0];
            break;
        case 'h':
            current = zeroPaddingNumber(calendar.getHourOfDay() % 12 || 12, count);
            break;
        case 'K':
            current = zeroPaddingNumber(calendar.getHourOfDay() % 12, count);
            break;
        case 'Z':
            var offset = calendar.getTimezoneOffset();
            var parts = [offset < 0 ? '-' : '+'];
            offset = Math.abs(offset);
            parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2), zeroPaddingNumber(offset % 60, 2));
            current = parts.join('');
            break;
        default:
            // case 'd':
            // case 'H':
            // case 'm':
            // case 's':
            // case 'S':
            // case 'D':
            // case 'F':
            // case 'w':
            // case 'W':
            var index = calendarIndexMap[field];
            value = calendar.get(index);
            current = zeroPaddingNumber(value, count);
        }
        return current;
    }
    function matchField(dateStr, startIndex, matches) {
        var matchedLen = -1, index = -1, i, len = matches.length;
        for (i = 0; i < len; i++) {
            var m = matches[i];
            var mLen = m.length;
            if (mLen > matchedLen && matchPartString(dateStr, startIndex, m, mLen)) {
                matchedLen = mLen;
                index = i;
            }
        }
        return index >= 0 ? {
            value: index,
            startIndex: startIndex + matchedLen
        } : null;
    }
    function matchPartString(dateStr, startIndex, match, mLen) {
        for (var i = 0; i < mLen; i++) {
            if (dateStr.charAt(startIndex + i) !== match.charAt(i)) {
                return false;
            }
        }
        return true;
    }
    function getLeadingNumberLen(str) {
        var i, c, len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charAt(i);
            if (c < '0' || c > '9') {
                break;
            }
        }
        return i;
    }
    function matchNumber(dateStr, startIndex, count, obeyCount) {
        var str = dateStr, n;
        if (obeyCount) {
            if (dateStr.length <= startIndex + count) {
                return null;
            }
            str = dateStr.substring(startIndex, count);
            if (!str.match(/^\d+$/)) {
                return null;
            }
        } else {
            str = str.substring(startIndex);
        }
        n = parseInt(str, 10);
        if (isNaN(n)) {
            return null;
        }
        return {
            value: n,
            startIndex: startIndex + getLeadingNumberLen(str)
        };
    }
    function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
        var match, year, hour;
        if (dateStr.length <= startIndex) {
            return startIndex;
        }
        switch (field) {
        case 'G':
            if (match = matchField(dateStr, startIndex, locale.eras)) {
                if (calendar.isSetYear()) {
                    if (match.value === 0) {
                        year = calendar.getYear();
                        calendar.setYear(1 - year);
                    }
                } else {
                    tmp.era = match.value;
                }
            }
            break;
        case 'y':
            if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                year = match.value;
                if ('era' in tmp) {
                    if (tmp.era === 0) {
                        year = 1 - year;
                    }
                }
                calendar.setYear(year);
            }
            break;
        case 'M':
            var month;
            if (count >= 3) {
                if (match = matchField(dateStr, startIndex, locale[count === 3 ? 'shortMonths' : 'months'])) {
                    month = match.value;
                }
            } else {
                if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                    month = match.value - 1;
                }
            }
            if (match) {
                calendar.setMonth(month);
            }
            break;
        case 'k':
            if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                calendar.setHourOfDay(match.value % 24);
            }
            break;
        case 'E':
            if (match = matchField(dateStr, startIndex, locale[count > 3 ? 'weekdays' : 'shortWeekdays'])) {
                calendar.setDayOfWeek(match.value);
            }
            break;
        case 'a':
            if (match = matchField(dateStr, startIndex, locale.ampms)) {
                if (calendar.isSetHourOfDay()) {
                    if (match.value) {
                        hour = calendar.getHourOfDay();
                        if (hour < 12) {
                            calendar.setHourOfDay((hour + 12) % 24);
                        }
                    }
                } else {
                    tmp.ampm = match.value;
                }
            }
            break;
        case 'h':
            if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                hour = match.value %= 12;
                if (tmp.ampm) {
                    hour += 12;
                }
                calendar.setHourOfDay(hour);
            }
            break;
        case 'K':
            if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                hour = match.value;
                if (tmp.ampm) {
                    hour += 12;
                }
                calendar.setHourOfDay(hour);
            }
            break;
        case 'Z':
            var sign = 1, zoneChar = dateStr.charAt(startIndex);
            if (zoneChar === '-') {
                sign = -1;
                startIndex++;
            } else if (zoneChar === '+') {
                startIndex++;
            } else {
                break;
            }
            if (match = matchNumber(dateStr, startIndex, 2, true)) {
                var zoneOffset = match.value * 60;
                startIndex = match.startIndex;
                if (match = matchNumber(dateStr, startIndex, 2, true)) {
                    zoneOffset += match.value;
                }
                calendar.setTimezoneOffset(zoneOffset);
            }
            break;
        default:
            // case 'd':
            // case 'H':
            // case 'm':
            // case 's':
            // case 'S':
            // case 'D':
            // case 'F':
            // case 'w':
            // case 'W'
            if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                var index = calendarIndexMap[field];
                calendar.set(index, match.value);
            }
        }
        if (match) {
            startIndex = match.startIndex;
        }
        return startIndex;
    }
    S.augment(DateTimeFormat, {
        /**
         * format a GregorianDate instance according to specified pattern
         * @param {KISSY.Date.Gregorian} calendar GregorianDate instance
         * @returns {string} formatted string of GregorianDate instance
         */
        format: function (calendar) {
            var time = calendar.getTime();
            calendar = /**@type {KISSY.Date.Gregorian}
             @ignore*/
            new GregorianCalendar(this.timezoneOffset, this.locale);
            calendar.setTime(time);
            var i, ret = [], pattern = this.pattern, len = pattern.length;
            for (i = 0; i < len; i++) {
                var comp = pattern[i];
                if (comp.text) {
                    ret.push(comp.text);
                } else if ('field' in comp) {
                    ret.push(formatField(comp.field, comp.count, this.locale, calendar));
                }
            }
            return ret.join('');
        },
        /**
         * parse a formatted string of GregorianDate instance according to specified pattern
         * @param {String} dateStr formatted string of GregorianDate
         * @returns {KISSY.Date.Gregorian}
         */
        parse: function (dateStr) {
            var calendar = /**@type {KISSY.Date.Gregorian}
                 @ignore*/
                new GregorianCalendar(this.timezoneOffset, this.locale), i, j, tmp = {}, obeyCount = false, dateStrLen = dateStr.length, errorIndex = -1, startIndex = 0, oldStartIndex = 0, pattern = this.pattern, len = pattern.length;
            loopPattern: {
                for (i = 0; errorIndex < 0 && i < len; i++) {
                    var comp = pattern[i], text, textLen;
                    oldStartIndex = startIndex;
                    if (text = comp.text) {
                        textLen = text.length;
                        if (textLen + startIndex > dateStrLen) {
                            errorIndex = startIndex;
                        } else {
                            for (j = 0; j < textLen; j++) {
                                if (text.charAt(j) !== dateStr.charAt(j + startIndex)) {
                                    errorIndex = startIndex;
                                    break loopPattern;
                                }
                            }
                            startIndex += textLen;
                        }
                    } else if ('field' in comp) {
                        obeyCount = false;
                        var nextComp = pattern[i + 1];
                        if (nextComp) {
                            if ('field' in nextComp) {
                                obeyCount = true;
                            } else {
                                var c = nextComp.text.charAt(0);
                                if (c >= '0' && c <= '9') {
                                    obeyCount = true;
                                }
                            }
                        }
                        startIndex = parseField(calendar, dateStr, startIndex, comp.field, comp.count, this.locale, obeyCount, tmp);
                        if (startIndex === oldStartIndex) {
                            errorIndex = startIndex;
                        }
                    }
                }
            }
            if (errorIndex >= 0) {
                logger.error('error when parsing date');
                logger.error(dateStr);
                logger.error(dateStr.substring(0, errorIndex) + '^');
                return undefined;
            }
            return calendar;
        }
    });
    S.mix(DateTimeFormat, {
        Style: DateTimeStyle,
        /**
         * get a formatter instance of short style pattern.
         * en-us: M/d/yy h:mm a
         * zh-cn: yy-M-d ah:mm
         * @param {Object} locale locale object
         * @param {Number} timeZoneOffset time zone offset by minutes
         * @returns {KISSY.Date.Gregorian}
         * @static
         */
        getInstance: function (locale, timeZoneOffset) {
            return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
        },
        /**
         * get a formatter instance of specified date style.
         * @param {KISSY.Date.Formatter.Style} dateStyle date format style
         * @param {Object} locale
         * @param {Number} timeZoneOffset time zone offset by minutes
         * @returns {KISSY.Date.Gregorian}
         * @static
         */
        getDateInstance: function (dateStyle, locale, timeZoneOffset) {
            return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
        },
        /**
         * get a formatter instance of specified date style and time style.
         * @param {KISSY.Date.Formatter.Style} dateStyle date format style
         * @param {KISSY.Date.Formatter.Style} timeStyle time format style
         * @param {Object} locale
         * @param {Number} timeZoneOffset time zone offset by minutes
         * @returns {KISSY.Date.Gregorian}
         * @static
         */
        getDateTimeInstance: function (dateStyle, timeStyle, locale, timeZoneOffset) {
            locale = locale || defaultLocale;
            var datePattern = '';
            if (dateStyle !== undefined) {
                datePattern = locale.datePatterns[dateStyle];
            }
            var timePattern = '';
            if (timeStyle !== undefined) {
                timePattern = locale.timePatterns[timeStyle];
            }
            var pattern = datePattern;
            if (timePattern) {
                if (datePattern) {
                    pattern = S.substitute(locale.dateTimePattern, {
                        date: datePattern,
                        time: timePattern
                    });
                } else {
                    pattern = timePattern;
                }
            }
            return new DateTimeFormat(pattern, locale, timeZoneOffset);
        },
        /**
         * get a formatter instance of specified time style.
         * @param {KISSY.Date.Formatter.Style} timeStyle time format style
         * @param {Object} locale
         * @param {Number} timeZoneOffset time zone offset by minutes
         * @returns {KISSY.Date.Gregorian}
         * @static
         */
        getTimeInstance: function (timeStyle, locale, timeZoneOffset) {
            return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
        }
    });
    return DateTimeFormat;
});    /*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 11:48
*/
       /*
combined modules:
date/gregorian
date/gregorian/utils
date/gregorian/const
*/
       /**
 * GregorianCalendar class for KISSY.
 * @ignore
 * @author yiminghe@gmail.com
 */
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 11:48
*/
/*
combined modules:
date/gregorian
date/gregorian/utils
date/gregorian/const
*/
/**
 * GregorianCalendar class for KISSY.
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian', [
    './gregorian/utils',
    'i18n!date',
    './gregorian/const',
    './const'
], 'date/gregorian', [
    './gregorian/utils',
    'i18n!date',
    './gregorian/const'
], function (S, require) {
    var toInt = parseInt;
    var Utils = require('./gregorian/utils');
    var defaultLocale = require('i18n!date');
    var Const = require('./gregorian/const');    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
                                                 /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
                                                 /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
                                                 /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    function GregorianCalendar(timezoneOffset, locale) {
        var args = S.makeArray(arguments);
        if (typeof timezoneOffset === 'object') {
            locale = timezoneOffset;
            timezoneOffset = locale.timezoneOffset;
        } else if (args.length >= 3) {
            timezoneOffset = locale = null;
        }
        locale = locale || defaultLocale;
        this.locale = locale;
        this.fields = [];    /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
                             /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
                             /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
                             /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        this.time = undefined;    /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
                                  /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
                                  /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
                                  /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        this.timezoneOffset = timezoneOffset || locale.timezoneOffset;    /**
         * The first day of the week
         * @type Number
         * @protected
         */
                                                                          /**
         * The first day of the week
         * @type Number
         * @protected
         */
                                                                          /**
         * The first day of the week
         * @type Number
         * @protected
         */
                                                                          /**
         * The first day of the week
         * @type Number
         * @protected
         */
        /**
         * The first day of the week
         * @type Number
         * @protected
         */
        /**
         * The first day of the week
         * @type Number
         * @protected
         */
        /**
         * The first day of the week
         * @type Number
         * @protected
         */
        /**
         * The first day of the week
         * @type Number
         * @protected
         */
        this.firstDayOfWeek = locale.firstDayOfWeek;    /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
                                                        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
                                                        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
                                                        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
        this.fieldsComputed = false;
        if (arguments.length >= 3) {
            this.set.apply(this, args);
        }
    }
    S.mix(GregorianCalendar, Const);
    S.mix(GregorianCalendar, {
        Utils: Utils,
        /**
         * Determines if the given year is a leap year.
         * Returns true if the given year is a leap year. To specify BC year numbers,
         * 1 - year number must be given. For example, year BC 4 is specified as -3.
         * @param {Number} year the given year.
         * @returns {Boolean} true if the given year is a leap year; false otherwise.
         * @static
         * @method
         */
        isLeapYear: Utils.isLeapYear,
        /**
         * Enum indicating year field of date
         * @type Number
         */
        YEAR: 1,
        /**
         * Enum indicating month field of date
         * @type Number
         */
        MONTH: 2,
        /**
         * Enum indicating the day of the month
         * @type Number
         */
        DAY_OF_MONTH: 3,
        /**
         * Enum indicating the hour (24).
         * @type Number
         */
        HOUR_OF_DAY: 4,
        /**
         * Enum indicating the minute of the day
         * @type Number
         */
        MINUTES: 5,
        /**
         * Enum indicating the second of the day
         * @type Number
         */
        SECONDS: 6,
        /**
         * Enum indicating the millisecond of the day
         * @type Number
         */
        MILLISECONDS: 7,
        /**
         * Enum indicating the week number within the current year
         * @type Number
         */
        WEEK_OF_YEAR: 8,
        /**
         * Enum indicating the week number within the current month
         * @type Number
         */
        WEEK_OF_MONTH: 9,
        /**
         * Enum indicating the day of the day number within the current year
         * @type Number
         */
        DAY_OF_YEAR: 10,
        /**
         * Enum indicating the day of the week
         * @type Number
         */
        DAY_OF_WEEK: 11,
        /**
         * Enum indicating the day of the ordinal number of the day of the week
         * @type Number
         */
        DAY_OF_WEEK_IN_MONTH: 12,
        /**
         * Enum indicating am
         * @type Number
         */
        AM: 0,
        /**
         * Enum indicating pm
         * @type Number
         */
        PM: 1
    });
    var fields = [
            '',
            'Year',
            'Month',
            'DayOfMonth',
            'HourOfDay',
            'Minutes',
            'Seconds',
            'Milliseconds',
            'WeekOfYear',
            'WeekOfMonth',
            'DayOfYear',
            'DayOfWeek',
            'DayOfWeekInMonth'
        ];
    var YEAR = GregorianCalendar.YEAR;
    var MONTH = GregorianCalendar.MONTH;
    var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
    var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
    var MINUTE = GregorianCalendar.MINUTES;
    var SECONDS = GregorianCalendar.SECONDS;
    var MILLISECONDS = GregorianCalendar.MILLISECONDS;
    var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
    var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
    var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
    var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
    var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
    var MONTH_LENGTH = [
            31,
            28,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31
        ];    // 0-based
              // 0-based
              // 0-based
              // 0-based
    // 0-based
    // 0-based
    // 0-based
    // 0-based
    var LEAP_MONTH_LENGTH = [
            31,
            29,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31
        ];    // 0-based
              // 0-based
              // 0-based
              // 0-based
    // 0-based
    // 0-based
    // 0-based
    // 0-based
    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    var ONE_WEEK = ONE_DAY * 7;
    var EPOCH_OFFSET = 719163;    // Fixed date of January 1, 1970 (Gregorian)
                                  // Fixed date of January 1, 1970 (Gregorian)
                                  // Fixed date of January 1, 1970 (Gregorian)
                                  // Fixed date of January 1, 1970 (Gregorian)
    // Fixed date of January 1, 1970 (Gregorian)
    // Fixed date of January 1, 1970 (Gregorian)
    // Fixed date of January 1, 1970 (Gregorian)
    // Fixed date of January 1, 1970 (Gregorian)
    var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
    var MIN_VALUES = [
            undefined,
            1,
            // YEAR
            GregorianCalendar.JANUARY,
            // MONTH
            1,
            // DAY_OF_MONTH
            0,
            // HOUR_OF_DAY
            0,
            // MINUTE
            0,
            // SECONDS
            0,
            // MILLISECONDS
            1,
            // WEEK_OF_YEAR
            undefined,
            // WEEK_OF_MONTH
            1,
            // DAY_OF_YEAR
            GregorianCalendar.SUNDAY,
            // DAY_OF_WEEK
            1    // DAY_OF_WEEK_IN_MONTH
        ];    // DAY_OF_WEEK_IN_MONTH
              // DAY_OF_WEEK_IN_MONTH
              // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    var MAX_VALUES = [
            undefined,
            292278994,
            // YEAR
            GregorianCalendar.DECEMBER,
            // MONTH
            undefined,
            // DAY_OF_MONTH
            23,
            // HOUR_OF_DAY
            59,
            // MINUTE
            59,
            // SECONDS
            999,
            // MILLISECONDS
            undefined,
            // WEEK_OF_YEAR
            undefined,
            // WEEK_OF_MONTH
            undefined,
            // DAY_OF_YEAR
            GregorianCalendar.SATURDAY,
            // DAY_OF_WEEK
            undefined    // DAY_OF_WEEK_IN_MONTH
        ];    // DAY_OF_WEEK_IN_MONTH
              // DAY_OF_WEEK_IN_MONTH
              // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    // DAY_OF_WEEK_IN_MONTH
    GregorianCalendar.prototype = {
        constructor: GregorianCalendar,
        /**
         * Determines if current year is a leap year.
         * Returns true if the given year is a leap year. To specify BC year numbers,
         * 1 - year number must be given. For example, year BC 4 is specified as -3.
         * @returns {Boolean} true if the given year is a leap year; false otherwise.
         * @method
         * @member KISSY.Date.Gregorian
         */
        isLeapYear: function () {
            return isLeapYear(this.getYear());
        },
        /**
         * Return local info for current date instance
         * @returns {Object}
         */
        getLocale: function () {
            return this.locale;
        },
        /**
         * Returns the minimum value for
         * the given calendar field of this GregorianCalendar instance.
         * The minimum value is defined as the smallest value
         * returned by the get method for any possible time value,
         * taking into consideration the current values of the getFirstDayOfWeek,
         * getMinimalDaysInFirstWeek.
         * @param field the calendar field.
         * @returns {Number} the minimum value for the given calendar field.
         */
        getActualMinimum: function (field) {
            if (MIN_VALUES[field] !== undefined) {
                return MIN_VALUES[field];
            }
            var fields = this.fields;
            if (field === WEEK_OF_MONTH) {
                var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
                return cal.get(WEEK_OF_MONTH);
            }
            throw new Error('minimum value not defined!');
        },
        /**
         * Returns the maximum value for the given calendar field
         * of this GregorianCalendar instance.
         * The maximum value is defined as the largest value returned
         * by the get method for any possible time value, taking into consideration
         * the current values of the getFirstDayOfWeek, getMinimalDaysInFirstWeek methods.
         * @param field the calendar field.
         * @returns {Number} the maximum value for the given calendar field.
         */
        getActualMaximum: function (field) {
            if (MAX_VALUES[field] !== undefined) {
                return MAX_VALUES[field];
            }
            var value, fields = this.fields;
            switch (field) {
            case DAY_OF_MONTH:
                value = getMonthLength(fields[YEAR], fields[MONTH]);
                break;
            case WEEK_OF_YEAR:
                var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
                value = endOfYear.get(WEEK_OF_YEAR);
                if (value === 1) {
                    value = 52;
                }
                break;
            case WEEK_OF_MONTH:
                var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
                value = endOfMonth.get(WEEK_OF_MONTH);
                break;
            case DAY_OF_YEAR:
                value = getYearLength(fields[YEAR]);
                break;
            case DAY_OF_WEEK_IN_MONTH:
                value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
                break;
            }
            if (value === undefined) {
                throw new Error('maximum value not defined!');
            }
            return value;
        },
        /**
         * Determines if the given calendar field has a value set,
         * including cases that the value has been set by internal fields calculations
         * triggered by a get method call.
         * @param field the calendar field to be cleared.
         * @returns {boolean} true if the given calendar field has a value set; false otherwise.
         */
        isSet: function (field) {
            return this.fields[field] !== undefined;
        },
        /**
         * Converts the time value (millisecond offset from the Epoch)
         * to calendar field values.
         * @protected
         */
        computeFields: function () {
            var time = this.time;
            var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
            var fixedDate = toInt(timezoneOffset / ONE_DAY);
            var timeOfDay = timezoneOffset % ONE_DAY;
            fixedDate += toInt(time / ONE_DAY);
            timeOfDay += time % ONE_DAY;
            if (timeOfDay >= ONE_DAY) {
                timeOfDay -= ONE_DAY;
                fixedDate++;
            } else {
                while (timeOfDay < 0) {
                    timeOfDay += ONE_DAY;
                    fixedDate--;
                }
            }
            fixedDate += EPOCH_OFFSET;
            var date = Utils.getGregorianDateFromFixedDate(fixedDate);
            var year = date.year;
            var fields = this.fields;
            fields[YEAR] = year;
            fields[MONTH] = date.month;
            fields[DAY_OF_MONTH] = date.dayOfMonth;
            fields[DAY_OF_WEEK] = date.dayOfWeek;
            if (timeOfDay !== 0) {
                fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
                var r = timeOfDay % ONE_HOUR;
                fields[MINUTE] = toInt(r / ONE_MINUTE);
                r %= ONE_MINUTE;
                fields[SECONDS] = toInt(r / ONE_SECOND);
                fields[MILLISECONDS] = r % ONE_SECOND;
            } else {
                fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
            }
            var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
            var dayOfYear = fixedDate - fixedDateJan1 + 1;
            var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
            fields[DAY_OF_YEAR] = dayOfYear;
            fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
            var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);    // 本周没有足够的时间在当前年
                                                                               // 本周没有足够的时间在当前年
                                                                               // 本周没有足够的时间在当前年
                                                                               // 本周没有足够的时间在当前年
            // 本周没有足够的时间在当前年
            // 本周没有足够的时间在当前年
            // 本周没有足够的时间在当前年
            // 本周没有足够的时间在当前年
            if (weekOfYear === 0) {
                // If the date belongs to the last week of the
                // previous year, use the week number of "12/31" of
                // the "previous" year.
                var fixedDec31 = fixedDateJan1 - 1;
                var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
                weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
            } else // 本周是年末最后一周，可能有足够的时间在新的一年
            if (weekOfYear >= 52) {
                var nextJan1 = fixedDateJan1 + getYearLength(year);
                var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
                var nDays = nextJan1st - nextJan1;    // 本周有足够天数在新的一年
                                                      // 本周有足够天数在新的一年
                                                      // 本周有足够天数在新的一年
                                                      // 本周有足够天数在新的一年
                // 本周有足够天数在新的一年
                // 本周有足够天数在新的一年
                // 本周有足够天数在新的一年
                // 本周有足够天数在新的一年
                if (nDays >= this.minimalDaysInFirstWeek && // 当天确实在本周，weekOfYear === 53 时是不需要这个判断
                    fixedDate >= nextJan1st - 7) {
                    weekOfYear = 1;
                }
            }
            fields[WEEK_OF_YEAR] = weekOfYear;
            fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
            this.fieldsComputed = true;
        },
        /**
         * Converts calendar field values to the time value
         * (millisecond offset from the Epoch).
         * @protected
         */
        computeTime: function () {
            if (!this.isSet(YEAR)) {
                throw new Error('year must be set for KISSY GregorianCalendar');
            }
            var fields = this.fields;
            var year = fields[YEAR];
            var timeOfDay = 0;
            if (this.isSet(HOUR_OF_DAY)) {
                timeOfDay += fields[HOUR_OF_DAY];
            }
            timeOfDay *= 60;
            timeOfDay += fields[MINUTE] || 0;
            timeOfDay *= 60;
            timeOfDay += fields[SECONDS] || 0;
            timeOfDay *= 1000;
            timeOfDay += fields[MILLISECONDS] || 0;
            var fixedDate = 0;
            fields[YEAR] = year;
            fixedDate = fixedDate + this.getFixedDate();    // millis represents local wall-clock time in milliseconds.
                                                            // millis represents local wall-clock time in milliseconds.
                                                            // millis represents local wall-clock time in milliseconds.
                                                            // millis represents local wall-clock time in milliseconds.
            // millis represents local wall-clock time in milliseconds.
            // millis represents local wall-clock time in milliseconds.
            // millis represents local wall-clock time in milliseconds.
            // millis represents local wall-clock time in milliseconds.
            var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
            millis -= this.timezoneOffset * ONE_MINUTE;
            this.time = millis;
            this.computeFields();
        },
        /**
         * Fills in any unset fields in the calendar fields. First,
         * the computeTime() method is called if the time value (millisecond offset from the Epoch)
         * has not been calculated from calendar field values.
         * Then, the computeFields() method is called to calculate all calendar field values.
         * @protected
         */
        complete: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            if (!this.fieldsComputed) {
                this.computeFields();
            }
        },
        getFixedDate: function () {
            var self = this;
            var fields = self.fields;
            var firstDayOfWeekCfg = self.firstDayOfWeek;
            var year = fields[YEAR];
            var month = GregorianCalendar.JANUARY;
            if (self.isSet(MONTH)) {
                month = fields[MONTH];
                if (month > GregorianCalendar.DECEMBER) {
                    year += toInt(month / 12);
                    month %= 12;
                } else if (month < GregorianCalendar.JANUARY) {
                    year += floorDivide(month / 12);
                    month = mod(month, 12);
                }
            }    // Get the fixed date since Jan 1, 1 (Gregorian). We are on
                 // the first day of either `month' or January in 'year'.
                 // Get the fixed date since Jan 1, 1 (Gregorian). We are on
                 // the first day of either `month' or January in 'year'.
                 // Get the fixed date since Jan 1, 1 (Gregorian). We are on
                 // the first day of either `month' or January in 'year'.
                 // Get the fixed date since Jan 1, 1 (Gregorian). We are on
                 // the first day of either `month' or January in 'year'.
            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            var fixedDate = Utils.getFixedDate(year, month, 1);
            var firstDayOfWeek;
            var dayOfWeek = self.firstDayOfWeek;
            if (self.isSet(DAY_OF_WEEK)) {
                dayOfWeek = fields[DAY_OF_WEEK];
            }
            if (self.isSet(MONTH)) {
                if (self.isSet(DAY_OF_MONTH)) {
                    fixedDate += fields[DAY_OF_MONTH] - 1;
                } else {
                    if (self.isSet(WEEK_OF_MONTH)) {
                        firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);    // If we have enough days in the first week, then
                                                                                                          // move to the previous week.
                                                                                                          // If we have enough days in the first week, then
                                                                                                          // move to the previous week.
                                                                                                          // If we have enough days in the first week, then
                                                                                                          // move to the previous week.
                                                                                                          // If we have enough days in the first week, then
                                                                                                          // move to the previous week.
                        // If we have enough days in the first week, then
                        // move to the previous week.
                        // If we have enough days in the first week, then
                        // move to the previous week.
                        // If we have enough days in the first week, then
                        // move to the previous week.
                        // If we have enough days in the first week, then
                        // move to the previous week.
                        if (firstDayOfWeek - fixedDate >= self.minimalDaysInFirstWeek) {
                            firstDayOfWeek -= 7;
                        }
                        if (dayOfWeek !== firstDayOfWeekCfg) {
                            firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
                        }
                        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
                    } else {
                        var dowim;
                        if (self.isSet(DAY_OF_WEEK_IN_MONTH)) {
                            dowim = fields[DAY_OF_WEEK_IN_MONTH];
                        } else {
                            dowim = 1;
                        }
                        var lastDate = 7 * dowim;
                        if (dowim < 0) {
                            lastDate = getMonthLength(year, month) + 7 * (dowim + 1);
                        }
                        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
                    }
                }
            } else {
                // We are on the first day of the year.
                if (self.isSet(DAY_OF_YEAR)) {
                    fixedDate += fields[DAY_OF_YEAR] - 1;
                } else {
                    firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);    // If we have enough days in the first week, then move
                                                                                                      // to the previous week.
                                                                                                      // If we have enough days in the first week, then move
                                                                                                      // to the previous week.
                                                                                                      // If we have enough days in the first week, then move
                                                                                                      // to the previous week.
                                                                                                      // If we have enough days in the first week, then move
                                                                                                      // to the previous week.
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    if (firstDayOfWeek - fixedDate >= self.minimalDaysInFirstWeek) {
                        firstDayOfWeek -= 7;
                    }
                    if (dayOfWeek !== firstDayOfWeekCfg) {
                        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
                    }
                    fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
                }
            }
            return fixedDate;
        },
        /**
         * Returns this Calendar's time value in milliseconds
         * @member KISSY.Date.Gregorian
         * @returns {Number} the current time as UTC milliseconds from the epoch.
         */
        getTime: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            return this.time;
        },
        /**
         * Sets this Calendar's current time from the given long value.
         * @param time the new time in UTC milliseconds from the epoch.
         */
        setTime: function (time) {
            this.time = time;
            this.fieldsComputed = false;
            this.complete();
        },
        /**
         * Returns the value of the given calendar field.
         * @param field the given calendar field.
         * @returns {Number} the value for the given calendar field.
         */
        get: function (field) {
            this.complete();
            return this.fields[field];
        },
        /**
         * Returns the year of the given calendar field.
         * @method getYear
         * @returns {Number} the year for the given calendar field.
         */
        /**
         * Returns the month of the given calendar field.
         * @method getMonth
         * @returns {Number} the month for the given calendar field.
         */
        /**
         * Returns the day of month of the given calendar field.
         * @method getDayOfMonth
         * @returns {Number} the day of month for the given calendar field.
         */
        /**
         * Returns the hour of day of the given calendar field.
         * @method getHourOfDay
         * @returns {Number} the hour of day for the given calendar field.
         */
        /**
         * Returns the minute of the given calendar field.
         * @method getMinute
         * @returns {Number} the minute for the given calendar field.
         */
        /**
         * Returns the second of the given calendar field.
         * @method getSecond
         * @returns {Number} the second for the given calendar field.
         */
        /**
         * Returns the millisecond of the given calendar field.
         * @method getMilliSecond
         * @returns {Number} the millisecond for the given calendar field.
         */
        /**
         * Returns the week of year of the given calendar field.
         * @method getWeekOfYear
         * @returns {Number} the week of year for the given calendar field.
         */
        /**
         * Returns the week of month of the given calendar field.
         * @method getWeekOfMonth
         * @returns {Number} the week of month for the given calendar field.
         */
        /**
         * Returns the day of year of the given calendar field.
         * @method getDayOfYear
         * @returns {Number} the day of year for the given calendar field.
         */
        /**
         * Returns the day of week of the given calendar field.
         * @method getDayOfWeek
         * @returns {Number} the day of week for the given calendar field.
         */
        /**
         * Returns the day of week in month of the given calendar field.
         * @method getDayOfWeekInMonth
         * @returns {Number} the day of week in month for the given calendar field.
         */
        /**
         * Sets the given calendar field to the given value.
         * @param field the given calendar field.
         * @param v the value to be set for the given calendar field.
         */
        set: function (field, v) {
            var len = arguments.length;
            if (len === 2) {
                this.fields[field] = v;
            } else if (len < MILLISECONDS + 1) {
                for (var i = 0; i < len; i++) {
                    this.fields[YEAR + i] = arguments[i];
                }
            } else {
                throw new Error('illegal arguments for KISSY GregorianCalendar set');
            }
            this.time = undefined;
        },
        /**
         * Set the year of the given calendar field.
         * @method setYear
         */
        /**
         * Set the month of the given calendar field.
         * @method setMonth
         */
        /**
         * Set the day of month of the given calendar field.
         * @method setDayOfMonth
         */
        /**
         * Set the hour of day of the given calendar field.
         * @method setHourOfDay
         */
        /**
         * Set the minute of the given calendar field.
         * @method setMinute
         */
        /**
         * Set the second of the given calendar field.
         * @method setSecond
         */
        /**
         * Set the millisecond of the given calendar field.
         * @method setMilliSecond
         */
        /**
         * Set the week of year of the given calendar field.
         * @method setWeekOfYear
         */
        /**
         * Set the week of month of the given calendar field.
         * @method setWeekOfMonth
         */
        /**
         * Set the day of year of the given calendar field.
         * @method setDayOfYear
         */
        /**
         * Set the day of week of the given calendar field.
         * @method setDayOfWeek
         */
        /**
         * Set the day of week in month of the given calendar field.
         * @method setDayOfWeekInMonth
         */
        /**
         * add for specified field based on two rules:
         *
         *  - Add rule 1. The value of field after the call minus the value of field before the
         *  call is amount, modulo any overflow that has occurred in field
         *  Overflow occurs when a field value exceeds its range and,
         *  as a result, the next larger field is incremented or
         *  decremented and the field value is adjusted back into its range.
         *
         *  - Add rule 2. If a smaller field is expected to be invariant,
         *  but it is impossible for it to be equal to its
         *  prior value because of changes in its minimum or maximum after
         *  field is changed, then its value is adjusted to be as close
         *  as possible to its expected value. A smaller field represents a
         *  smaller unit of time. HOUR_OF_DAY is a smaller field than
         *  DAY_OF_MONTH. No adjustment is made to smaller fields
         *  that are not expected to be invariant. The calendar system
         *  determines what fields are expected to be invariant.
         *
         *
         *      @example
         *      KISSY.use('date/gregorian',function(S, GregorianCalendar){
         *          var d = new GregorianCalendar();
         *          d.set(2012, GregorianCalendar.JANUARY, 31);
         *          d.add(Gregorian.MONTH,1);
         *          // 2012-2-29
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *          d.add(Gregorian.MONTH,12);
         *          // 2013-2-28
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *      });
         *
         * @param field the calendar field.
         * @param {Number} amount he amount of date or time to be added to the field.
         */
        add: function (field, amount) {
            if (!amount) {
                return;
            }
            var self = this;
            var fields = self.fields;    // computer and retrieve original value
                                         // computer and retrieve original value
                                         // computer and retrieve original value
                                         // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            var value = self.get(field);
            if (field === YEAR) {
                value += amount;
                self.set(YEAR, value);
                adjustDayOfMonth(self);
            } else if (field === MONTH) {
                value += amount;
                var yearAmount = floorDivide(value / 12);
                value = mod(value, 12);
                if (yearAmount) {
                    self.set(YEAR, fields[YEAR] + yearAmount);
                }
                self.set(MONTH, value);
                adjustDayOfMonth(self);
            } else {
                switch (field) {
                case HOUR_OF_DAY:
                    amount *= ONE_HOUR;
                    break;
                case MINUTE:
                    amount *= ONE_MINUTE;
                    break;
                case SECONDS:
                    amount *= ONE_SECOND;
                    break;
                case MILLISECONDS:
                    break;
                case WEEK_OF_MONTH:
                case WEEK_OF_YEAR:
                case DAY_OF_WEEK_IN_MONTH:
                    amount *= ONE_WEEK;
                    break;
                case DAY_OF_WEEK:
                case DAY_OF_YEAR:
                case DAY_OF_MONTH:
                    amount *= ONE_DAY;
                    break;
                default:
                    throw new Error('illegal field for add');
                }
                self.setTime(self.time + amount);
            }
        },
        /**
         * add the year of the given calendar field.
         * @method addYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the month of the given calendar field.
         * @method addMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of month of the given calendar field.
         * @method addDayOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the hour of day of the given calendar field.
         * @method addHourOfDay
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the minute of the given calendar field.
         * @method addMinute
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the second of the given calendar field.
         * @method addSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the millisecond of the given calendar field.
         * @method addMilliSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the week of year of the given calendar field.
         * @method addWeekOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the week of month of the given calendar field.
         * @method addWeekOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of year of the given calendar field.
         * @method addDayOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of week of the given calendar field.
         * @method addDayOfWeek
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * add the day of week in month of the given calendar field.
         * @method addDayOfWeekInMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * Get rolled value for the field
         * @protected
         */
        getRolledValue: function (value, amount, min, max) {
            var diff = value - min;
            var range = max - min + 1;
            amount %= range;
            return min + (diff + amount + range) % range;
        },
        /**
         * Adds a signed amount to the specified calendar field without changing larger fields.
         * A negative roll amount means to subtract from field without changing
         * larger fields. If the specified amount is 0, this method performs nothing.
         *
         *
         *
         *      @example
         *      var d = new GregorianCalendar();
         *      d.set(1999, GregorianCalendar.AUGUST, 31);
         *      // 1999-4-30
         *      // Tuesday June 1, 1999
         *      d.set(1999, GregorianCalendar.JUNE, 1);
         *      d.add(Gregorian.WEEK_OF_MONTH,-1); // === d.add(Gregorian.WEEK_OF_MONTH,
         *      d.get(Gregorian.WEEK_OF_MONTH));
         *      // 1999-06-29
         *
         *
         * @param field the calendar field.
         * @param {Number} amount the signed amount to add to field.
         */
        roll: function (field, amount) {
            if (!amount) {
                return;
            }
            var self = this;    // computer and retrieve original value
                                // computer and retrieve original value
                                // computer and retrieve original value
                                // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            // computer and retrieve original value
            var value = self.get(field);
            var min = self.getActualMinimum(field);
            var max = self.getActualMaximum(field);
            value = self.getRolledValue(value, amount, min, max);
            self.set(field, value);    // consider compute time priority
                                       // consider compute time priority
                                       // consider compute time priority
                                       // consider compute time priority
            // consider compute time priority
            // consider compute time priority
            // consider compute time priority
            // consider compute time priority
            switch (field) {
            case MONTH:
                adjustDayOfMonth(self);
                break;
            default:
                // other fields are set already when get
                self.updateFieldsBySet(field);
                break;
            }
        },
        /**
         * roll the year of the given calendar field.
         * @method rollYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the month of the given calendar field.
         * @param {Number} amount the signed amount to add to field.
         * @method rollMonth
         */
        /**
         * roll the day of month of the given calendar field.
         * @method rollDayOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the hour of day of the given calendar field.
         * @method rollHourOfDay
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the minute of the given calendar field.
         * @method rollMinute
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the second of the given calendar field.
         * @method rollSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the millisecond of the given calendar field.
         * @method rollMilliSecond
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the week of year of the given calendar field.
         * @method rollWeekOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the week of month of the given calendar field.
         * @method rollWeekOfMonth
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the day of year of the given calendar field.
         * @method rollDayOfYear
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * roll the day of week of the given calendar field.
         * @method rollDayOfWeek
         * @param {Number} amount the signed amount to add to field.
         */
        /**
         * remove other priority fields when call getFixedDate
         * precondition: other fields are all set or computed
         * @protected
         */
        updateFieldsBySet: function (field) {
            var fields = this.fields;
            switch (field) {
            case WEEK_OF_MONTH:
                fields[DAY_OF_MONTH] = undefined;
                break;
            case DAY_OF_YEAR:
                fields[MONTH] = undefined;
                break;
            case DAY_OF_WEEK:
                fields[DAY_OF_MONTH] = undefined;
                break;
            case WEEK_OF_YEAR:
                fields[DAY_OF_YEAR] = undefined;
                fields[MONTH] = undefined;
                break;
            }
        },
        /**
         * get current date instance's timezone offset
         * @returns {Number}
         */
        getTimezoneOffset: function () {
            return this.timezoneOffset;
        },
        /**
         * set current date instance's timezone offset
         */
        setTimezoneOffset: function (timezoneOffset) {
            if (this.timezoneOffset !== timezoneOffset) {
                this.fieldsComputed = undefined;
                this.timezoneOffset = timezoneOffset;
            }
        },
        /**
         * set first day of week for current date instance
         */
        setFirstDayOfWeek: function (firstDayOfWeek) {
            if (this.firstDayOfWeek !== firstDayOfWeek) {
                this.firstDayOfWeek = firstDayOfWeek;
                this.fieldsComputed = false;
            }
        },
        /**
         * Gets what the first day of the week is; e.g., SUNDAY in the U.S., MONDAY in France.
         * @returns {Number} the first day of the week.
         */
        getFirstDayOfWeek: function () {
            return this.firstDayOfWeek;
        },
        /**
         * Sets what the minimal days required in the first week of the year are; For example,
         * if the first week is defined as one that contains the first day of the first month of a year,
         * call this method with value 1.
         * If it must be a full week, use value 7.
         * @param minimalDaysInFirstWeek the given minimal days required in the first week of the year.
         */
        setMinimalDaysInFirstWeek: function (minimalDaysInFirstWeek) {
            if (this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek) {
                this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
                this.fieldsComputed = false;
            }
        },
        /**
         * Gets what the minimal days required in the first week of the year are; e.g.,
         * if the first week is defined as one that contains the first day of the first month of a year,
         * this method returns 1.
         * If the minimal days required must be a full week, this method returns 7.
         * @returns {Number} the minimal days required in the first week of the year.
         */
        getMinimalDaysInFirstWeek: function () {
            return this.minimalDaysInFirstWeek;
        },
        /**
         * Returns the number of weeks in the week year
         * represented by this GregorianCalendar.
         *
         * For example, if this GregorianCalendar's date is
         * December 31, 2008 with the ISO
         * 8601 compatible setting, this method will return 53 for the
         * period: December 29, 2008 to January 3, 2010
         * while getActualMaximum(WEEK_OF_YEAR) will return
         * 52 for the period: December 31, 2007 to December 28, 2008.
         *
         * @return {Number} the number of weeks in the week year.
         */
        getWeeksInWeekYear: function () {
            var weekYear = this.getWeekYear();
            if (weekYear === this.get(YEAR)) {
                return this.getActualMaximum(WEEK_OF_YEAR);
            }    // Use the 2nd week for calculating the max of WEEK_OF_YEAR
                 // Use the 2nd week for calculating the max of WEEK_OF_YEAR
                 // Use the 2nd week for calculating the max of WEEK_OF_YEAR
                 // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            var gc = this.clone();
            gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
            return gc.getActualMaximum(WEEK_OF_YEAR);
        },
        /**
         * Returns the week year represented by this GregorianCalendar.
         * The dates in the weeks between 1 and the
         * maximum week number of the week year have the same week year value
         * that may be one year before or after the calendar year value.
         *
         * @return {Number} the week year represented by this GregorianCalendar.
         */
        getWeekYear: function () {
            var year = this.get(YEAR);    // implicitly  complete
                                          // implicitly  complete
                                          // implicitly  complete
                                          // implicitly  complete
            // implicitly  complete
            // implicitly  complete
            // implicitly  complete
            // implicitly  complete
            var weekOfYear = this.get(WEEK_OF_YEAR);
            var month = this.get(MONTH);
            if (month === GregorianCalendar.JANUARY) {
                if (weekOfYear >= 52) {
                    --year;
                }
            } else if (month === GregorianCalendar.DECEMBER) {
                if (weekOfYear === 1) {
                    ++year;
                }
            }
            return year;
        },
        /**
         * Sets this GregorianCalendar to the date given by the date specifiers - weekYear,
         * weekOfYear, and dayOfWeek. weekOfYear follows the WEEK_OF_YEAR numbering.
         * The dayOfWeek value must be one of the DAY_OF_WEEK values: SUNDAY to SATURDAY.
         *
         * @param weekYear    the week year
         * @param weekOfYear  the week number based on weekYear
         * @param dayOfWeek   the day of week value
         */
        setWeekDate: function (weekYear, weekOfYear, dayOfWeek) {
            if (dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY) {
                throw new Error('invalid dayOfWeek: ' + dayOfWeek);
            }
            var fields = this.fields;    // To avoid changing the time of day fields by date
                                         // calculations, use a clone with the GMT time zone.
                                         // To avoid changing the time of day fields by date
                                         // calculations, use a clone with the GMT time zone.
                                         // To avoid changing the time of day fields by date
                                         // calculations, use a clone with the GMT time zone.
                                         // To avoid changing the time of day fields by date
                                         // calculations, use a clone with the GMT time zone.
            // To avoid changing the time of day fields by date
            // calculations, use a clone with the GMT time zone.
            // To avoid changing the time of day fields by date
            // calculations, use a clone with the GMT time zone.
            // To avoid changing the time of day fields by date
            // calculations, use a clone with the GMT time zone.
            // To avoid changing the time of day fields by date
            // calculations, use a clone with the GMT time zone.
            var gc = this.clone();
            gc.clear();
            gc.setTimezoneOffset(0);
            gc.set(YEAR, weekYear);
            gc.set(WEEK_OF_YEAR, 1);
            gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
            var days = dayOfWeek - this.getFirstDayOfWeek();
            if (days < 0) {
                days += 7;
            }
            days += 7 * (weekOfYear - 1);
            if (days !== 0) {
                gc.add(DAY_OF_YEAR, days);
            } else {
                gc.complete();
            }
            fields[YEAR] = gc.get(YEAR);
            fields[MONTH] = gc.get(MONTH);
            fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
            this.complete();
        },
        /**
         * Creates and returns a copy of this object.
         * @returns {KISSY.Date.Gregorian}
         */
        clone: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
            cal.setTime(this.time);
            return cal;
        },
        /**
         * Compares this GregorianCalendar to the specified Object.
         * The result is true if and only if the argument is a GregorianCalendar object
         * that represents the same time value (millisecond offset from the Epoch)
         * under the same Calendar parameters and Gregorian change date as this object.
         * @param {KISSY.Date.Gregorian} obj the object to compare with.
         * @returns {boolean} true if this object is equal to obj; false otherwise.
         */
        equals: function (obj) {
            return this.getTime() === obj.getTime() && this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek;
        },
        /**
         * Sets all the calendar field values or specified field and the time value
         * (millisecond offset from the Epoch) of this Calendar undefined.
         * This means that isSet() will return false for all the calendar fields,
         * and the date and time calculations will treat the fields as if they had never been set.
         * @param [field] the calendar field to be cleared.
         */
        clear: function (field) {
            if (field === undefined) {
                this.field = [];
            } else {
                this.fields[field] = undefined;
            }
            this.time = undefined;
            this.fieldsComputed = false;
        }
    };
    var GregorianCalendarProto = GregorianCalendar.prototype;
    if ('@DEBUG@') {
        // for idea
        GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
        GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
    }
    S.each(fields, function (f, index) {
        if (f) {
            GregorianCalendarProto['get' + f] = function () {
                return this.get(index);
            };
            GregorianCalendarProto['isSet' + f] = function () {
                return this.isSet(index);
            };
            GregorianCalendarProto['set' + f] = function (v) {
                return this.set(index, v);
            };
            GregorianCalendarProto['add' + f] = function (v) {
                return this.add(index, v);
            };
            GregorianCalendarProto['roll' + f] = function (v) {
                return this.roll(index, v);
            };
        }
    });    // ------------------- private start
           // ------------------- private start
           // ------------------- private start
           // ------------------- private start
    // ------------------- private start
    // ------------------- private start
    // ------------------- private start
    // ------------------- private start
    function adjustDayOfMonth(self) {
        var fields = self.fields;
        var year = fields[YEAR];
        var month = fields[MONTH];
        var monthLen = getMonthLength(year, month);
        var dayOfMonth = fields[DAY_OF_MONTH];
        if (dayOfMonth > monthLen) {
            self.set(DAY_OF_MONTH, monthLen);
        }
    }
    function getMonthLength(year, month) {
        return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
    }
    function getYearLength(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function getWeekNumber(self, fixedDay1, fixedDate) {
        var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
        var nDays = fixedDay1st - fixedDay1;
        if (nDays >= self.minimalDaysInFirstWeek) {
            fixedDay1st -= 7;
        }
        var normalizedDayOfPeriod = fixedDate - fixedDay1st;
        return floorDivide(normalizedDayOfPeriod / 7) + 1;
    }
    function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
        // 1.1.1 is monday
        // one week has 7 days
        return fixedDate - mod(fixedDate - dayOfWeek, 7);
    }    // ------------------- private end
         // ------------------- private end
         // ------------------- private end
         // ------------------- private end
    // ------------------- private end
    // ------------------- private end
    // ------------------- private end
    // ------------------- private end
    return GregorianCalendar;
});    /*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */
       /**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */
       /*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */
       /**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */
/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */
/**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */
/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */
/**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian/utils', ['./const'], function (S, require) {
    var Const = require('./const');
    var ACCUMULATED_DAYS_IN_MONTH    //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
 = //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        [
            0,
            31,
            59,
            90,
            120,
            151,
            181,
            212,
            243,
            273,
            304,
            334
        ], ACCUMULATED_DAYS_IN_MONTH_LEAP    //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
                                          // 10/1   11/1   12/1
 = //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
        // 10/1   11/1   12/1
        //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
        // 10/1   11/1   12/1
        //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
        // 10/1   11/1   12/1
        [
            0,
            31,
            59 + 1,
            90 + 1,
            120 + 1,
            151 + 1,
            181 + 1,
            212 + 1,
            243 + 1,
            273 + 1,
            304 + 1,
            334 + 1
        ], DAYS_OF_YEAR = 365, DAYS_OF_4YEAR = 365 * 4 + 1, DAYS_OF_100YEAR = DAYS_OF_4YEAR * 25 - 1, DAYS_OF_400YEAR = DAYS_OF_100YEAR * 4 + 1, Utils = {};
    function getDayOfYear(year, month, dayOfMonth) {
        return dayOfMonth + (isLeapYear(year) ? ACCUMULATED_DAYS_IN_MONTH_LEAP[month] : ACCUMULATED_DAYS_IN_MONTH[month]);
    }
    function getDayOfWeekFromFixedDate(fixedDate) {
        // The fixed day 1 (January 1, 1 Gregorian) is Monday.
        if (fixedDate >= 0) {
            return fixedDate % 7;
        }
        return mod(fixedDate, 7);
    }
    function getGregorianYearFromFixedDate(fixedDate) {
        var d0;
        var d1, d2, d3;    //, d4;
                           //, d4;
                           //, d4;
                           //, d4;
        //, d4;
        //, d4;
        //, d4;
        //, d4;
        var n400, n100, n4, n1;
        var year;
        d0 = fixedDate - 1;
        n400 = floorDivide(d0 / DAYS_OF_400YEAR);
        d1 = mod(d0, DAYS_OF_400YEAR);
        n100 = floorDivide(d1 / DAYS_OF_100YEAR);
        d2 = mod(d1, DAYS_OF_100YEAR);
        n4 = floorDivide(d2 / DAYS_OF_4YEAR);
        d3 = mod(d2, DAYS_OF_4YEAR);
        n1 = floorDivide(d3 / DAYS_OF_YEAR);
        year = 400 * n400 + 100 * n100 + 4 * n4 + n1;    // ?
                                                         // ?
                                                         // ?
                                                         // ?
        // ?
        // ?
        // ?
        // ?
        if (!(n100 === 4 || n1 === 4)) {
            ++year;
        }
        return year;
    }
    S.mix(Utils, {
        isLeapYear: function (year) {
            if ((year & 3) !== 0) {
                return false;
            }
            return year % 100 !== 0 || year % 400 === 0;
        },
        mod: function (x, y) {
            // 负数时不是镜像关系
            return x - y * floorDivide(x / y);
        },
        // month: 0 based
        getFixedDate: function (year, month, dayOfMonth) {
            var prevYear = year - 1;    // 考虑公元前
                                        // 考虑公元前
                                        // 考虑公元前
                                        // 考虑公元前
            // 考虑公元前
            // 考虑公元前
            // 考虑公元前
            // 考虑公元前
            return DAYS_OF_YEAR * prevYear + floorDivide(prevYear / 4) - floorDivide(prevYear / 100) + floorDivide(prevYear / 400) + getDayOfYear(year, month, dayOfMonth);
        },
        getGregorianDateFromFixedDate: function (fixedDate) {
            var year = getGregorianYearFromFixedDate(fixedDate);
            var jan1 = Utils.getFixedDate(year, Const.JANUARY, 1);
            var isLeap = isLeapYear(year);
            var ACCUMULATED_DAYS = isLeap ? ACCUMULATED_DAYS_IN_MONTH_LEAP : ACCUMULATED_DAYS_IN_MONTH;
            var daysDiff = fixedDate - jan1;
            var month, i;
            for (i = 0; i < ACCUMULATED_DAYS.length; i++) {
                if (ACCUMULATED_DAYS[i] <= daysDiff) {
                    month = i;
                } else {
                    break;
                }
            }
            var dayOfMonth = fixedDate - jan1 - ACCUMULATED_DAYS[month] + 1;
            var dayOfWeek = getDayOfWeekFromFixedDate(fixedDate);
            return {
                year: year,
                month: month,
                dayOfMonth: dayOfMonth,
                dayOfWeek: dayOfWeek,
                isLeap: isLeap
            };
        }
    });
    var floorDivide = Math.floor, isLeapYear = Utils.isLeapYear, mod = Utils.mod;
    return Utils;
});    /**
 * @ignore
 * const for gregorian date
 * @author yiminghe@gmail.com
 */
       /**
 * @ignore
 * const for gregorian date
 * @author yiminghe@gmail.com
 */
/**
 * @ignore
 * const for gregorian date
 * @author yiminghe@gmail.com
 */
/**
 * @ignore
 * const for gregorian date
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian/const', [], function () {
    return {
        /**
         * Enum indicating sunday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        SUNDAY: 0,
        /**
         * Enum indicating monday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        MONDAY: 1,
        /**
         * Enum indicating tuesday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        TUESDAY: 2,
        /**
         * Enum indicating wednesday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        WEDNESDAY: 3,
        /**
         * Enum indicating thursday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        THURSDAY: 4,
        /**
         * Enum indicating friday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        FRIDAY: 5,
        /**
         * Enum indicating saturday
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        SATURDAY: 6,
        /**
         * Enum indicating january
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        JANUARY: 0,
        /**
         * Enum indicating february
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        FEBRUARY: 1,
        /**
         * Enum indicating march
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        MARCH: 2,
        /**
         * Enum indicating april
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        APRIL: 3,
        /**
         * Enum indicating may
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        MAY: 4,
        /**
         * Enum indicating june
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        JUNE: 5,
        /**
         * Enum indicating july
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        JULY: 6,
        /**
         * Enum indicating august
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        AUGUST: 7,
        /**
         * Enum indicating september
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        SEPTEMBER: 8,
        /**
         * Enum indicating october
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        OCTOBER: 9,
        /**
         * Enum indicating november
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        NOVEMBER: 10,
        /**
         * Enum indicating december
         * @type Number
         * @member KISSY.Date.Gregorian
         */
        DECEMBER: 11
    };
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/year-panel/years-xtpl', [], function (S, require, exports, module) {
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
    var t = function (scope, buffer, payload, undefined) {
        var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
        if ('5.0.0' !== S.version) {
            throw new Error('current xtemplate file(' + engine.name + ')(v5.0.0) need to be recompiled using current kissy(v' + S.version + ')!');
        }
        var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands['debugger'];
        buffer.write('');
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['years']);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.write('\r\n<tr role="row">\r\n    ');
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
                buffer.write('\r\n    <td role="gridcell"\r\n        title="');
                var id7 = scope.resolve(['title']);
                buffer.write(id7, true);
                buffer.write('"\r\n        class="');
                var option8 = { escape: 1 };
                var params9 = [];
                params9.push('cell');
                option8.params = params9;
                var commandRet10 = callCommandUtil(engine, scope, option8, buffer, 'getBaseCssClasses', 6);
                if (commandRet10 && commandRet10.isBuffer) {
                    buffer = commandRet10;
                    commandRet10 = undefined;
                }
                buffer.write(commandRet10, true);
                buffer.write('\r\n        ');
                var option11 = { escape: 1 };
                var params12 = [];
                var id13 = scope.resolve(['content']);
                var exp15 = id13;
                var id14 = scope.resolve(['year']);
                exp15 = id13 === id14;
                params12.push(exp15);
                option11.params = params12;
                option11.fn = function (scope, buffer) {
                    buffer.write('\r\n         ');
                    var option16 = { escape: 1 };
                    var params17 = [];
                    params17.push('selected-cell');
                    option16.params = params17;
                    var commandRet18 = callCommandUtil(engine, scope, option16, buffer, 'getBaseCssClasses', 8);
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
                var option19 = { escape: 1 };
                var params20 = [];
                var id21 = scope.resolve(['content']);
                var exp23 = id21;
                var id22 = scope.resolve(['startYear']);
                exp23 = id21 < id22;
                params20.push(exp23);
                option19.params = params20;
                option19.fn = function (scope, buffer) {
                    buffer.write('\r\n         ');
                    var option24 = { escape: 1 };
                    var params25 = [];
                    params25.push('last-decade-cell');
                    option24.params = params25;
                    var commandRet26 = callCommandUtil(engine, scope, option24, buffer, 'getBaseCssClasses', 11);
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
                var option27 = { escape: 1 };
                var params28 = [];
                var id29 = scope.resolve(['content']);
                var exp31 = id29;
                var id30 = scope.resolve(['endYear']);
                exp31 = id29 > id30;
                params28.push(exp31);
                option27.params = params28;
                option27.fn = function (scope, buffer) {
                    buffer.write('\r\n         ');
                    var option32 = { escape: 1 };
                    var params33 = [];
                    params33.push('next-decade-cell');
                    option32.params = params33;
                    var commandRet34 = callCommandUtil(engine, scope, option32, buffer, 'getBaseCssClasses', 14);
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
                var option35 = { escape: 1 };
                var params36 = [];
                params36.push('year');
                option35.params = params36;
                var commandRet37 = callCommandUtil(engine, scope, option35, buffer, 'getBaseCssClasses', 20);
                if (commandRet37 && commandRet37.isBuffer) {
                    buffer = commandRet37;
                    commandRet37 = undefined;
                }
                buffer.write(commandRet37, true);
                buffer.write('">\r\n            ');
                var id38 = scope.resolve(['content']);
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
KISSY.add('date/picker/year-panel/year-panel-xtpl', ['./years-xtpl'], function (S, require, exports, module) {
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
    var t = function (scope, buffer, payload, undefined) {
        var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
        if ('5.0.0' !== S.version) {
            throw new Error('current xtemplate file(' + engine.name + ')(v5.0.0) need to be recompiled using current kissy(v' + S.version + ')!');
        }
        var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var commandRet2 = callCommandUtil(engine, scope, option0, buffer, 'getBaseCssClasses', 1);
        if (commandRet2 && commandRet2.isBuffer) {
            buffer = commandRet2;
            commandRet2 = undefined;
        }
        buffer.write(commandRet2, true);
        buffer.write('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-decade-btn');
        option3.params = params4;
        var commandRet5 = callCommandUtil(engine, scope, option3, buffer, 'getBaseCssClasses', 2);
        if (commandRet5 && commandRet5.isBuffer) {
            buffer = commandRet5;
            commandRet5 = undefined;
        }
        buffer.write(commandRet5, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousDecadeLabel']);
        buffer.write(id6, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('decade-select');
        option7.params = params8;
        var commandRet9 = callCommandUtil(engine, scope, option7, buffer, 'getBaseCssClasses', 9);
        if (commandRet9 && commandRet9.isBuffer) {
            buffer = commandRet9;
            commandRet9 = undefined;
        }
        buffer.write(commandRet9, true);
        buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
        var id10 = scope.resolve(['decadeSelectLabel']);
        buffer.write(id10, true);
        buffer.write('">\r\n            <span class="');
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('decade-select-content');
        option11.params = params12;
        var commandRet13 = callCommandUtil(engine, scope, option11, buffer, 'getBaseCssClasses', 14);
        if (commandRet13 && commandRet13.isBuffer) {
            buffer = commandRet13;
            commandRet13 = undefined;
        }
        buffer.write(commandRet13, true);
        buffer.write('">\r\n                ');
        var id14 = scope.resolve(['startYear']);
        buffer.write(id14, true);
        buffer.write('-');
        var id15 = scope.resolve(['endYear']);
        buffer.write(id15, true);
        buffer.write('\r\n            </span>\r\n        <span class="');
        var option16 = { escape: 1 };
        var params17 = [];
        params17.push('decade-select-arrow');
        option16.params = params17;
        var commandRet18 = callCommandUtil(engine, scope, option16, buffer, 'getBaseCssClasses', 17);
        if (commandRet18 && commandRet18.isBuffer) {
            buffer = commandRet18;
            commandRet18 = undefined;
        }
        buffer.write(commandRet18, true);
        buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="');
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('next-decade-btn');
        option19.params = params20;
        var commandRet21 = callCommandUtil(engine, scope, option19, buffer, 'getBaseCssClasses', 20);
        if (commandRet21 && commandRet21.isBuffer) {
            buffer = commandRet21;
            commandRet21 = undefined;
        }
        buffer.write(commandRet21, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id22 = scope.resolve(['nextDecadeLabel']);
        buffer.write(id22, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option23 = { escape: 1 };
        var params24 = [];
        params24.push('body');
        option23.params = params24;
        var commandRet25 = callCommandUtil(engine, scope, option23, buffer, 'getBaseCssClasses', 27);
        if (commandRet25 && commandRet25.isBuffer) {
            buffer = commandRet25;
            commandRet25 = undefined;
        }
        buffer.write(commandRet25, true);
        buffer.write('">\r\n    <table class="');
        var option26 = { escape: 1 };
        var params27 = [];
        params27.push('table');
        option26.params = params27;
        var commandRet28 = callCommandUtil(engine, scope, option26, buffer, 'getBaseCssClasses', 28);
        if (commandRet28 && commandRet28.isBuffer) {
            buffer = commandRet28;
            commandRet28 = undefined;
        }
        buffer.write(commandRet28, true);
        buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="');
        var option29 = { escape: 1 };
        var params30 = [];
        params30.push('tbody');
        option29.params = params30;
        var commandRet31 = callCommandUtil(engine, scope, option29, buffer, 'getBaseCssClasses', 29);
        if (commandRet31 && commandRet31.isBuffer) {
            buffer = commandRet31;
            commandRet31 = undefined;
        }
        buffer.write(commandRet31, true);
        buffer.write('">\r\n        ');
        var option32 = {};
        var params33 = [];
        params33.push('./years-xtpl');
        option32.params = params33;
        require('./years-xtpl');
        option32.params[0] = module.resolve(option32.params[0]);
        var commandRet34 = includeCommand.call(engine, scope, option32, buffer, 30, payload);
        if (commandRet34 && commandRet34.isBuffer) {
            buffer = commandRet34;
            commandRet34 = undefined;
        }
        buffer.write(commandRet34, false);
        buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
        return buffer;
    };
    t.TPL_NAME = module.name;
    return t;
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/picker/month-panel/months-xtpl', [], function (S, require, exports, module) {
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
    var t = function (scope, buffer, payload, undefined) {
        var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
        if ('5.0.0' !== S.version) {
            throw new Error('current xtemplate file(' + engine.name + ')(v5.0.0) need to be recompiled using current kissy(v' + S.version + ')!');
        }
        var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands['debugger'];
        buffer.write('');
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['months']);
        params1.push(id2);
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.write('\r\n<tr role="row">\r\n    ');
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
                buffer.write('\r\n    <td role="gridcell"\r\n        title="');
                var id7 = scope.resolve(['title']);
                buffer.write(id7, true);
                buffer.write('"\r\n        class="');
                var option8 = { escape: 1 };
                var params9 = [];
                params9.push('cell');
                option8.params = params9;
                var commandRet10 = callCommandUtil(engine, scope, option8, buffer, 'getBaseCssClasses', 6);
                if (commandRet10 && commandRet10.isBuffer) {
                    buffer = commandRet10;
                    commandRet10 = undefined;
                }
                buffer.write(commandRet10, true);
                buffer.write('\r\n        ');
                var option11 = { escape: 1 };
                var params12 = [];
                var id13 = scope.resolve(['month']);
                var exp15 = id13;
                var id14 = scope.resolve(['value']);
                exp15 = id13 === id14;
                params12.push(exp15);
                option11.params = params12;
                option11.fn = function (scope, buffer) {
                    buffer.write('\r\n        ');
                    var option16 = { escape: 1 };
                    var params17 = [];
                    params17.push('selected-cell');
                    option16.params = params17;
                    var commandRet18 = callCommandUtil(engine, scope, option16, buffer, 'getBaseCssClasses', 8);
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
                var option19 = { escape: 1 };
                var params20 = [];
                params20.push('month');
                option19.params = params20;
                var commandRet21 = callCommandUtil(engine, scope, option19, buffer, 'getBaseCssClasses', 14);
                if (commandRet21 && commandRet21.isBuffer) {
                    buffer = commandRet21;
                    commandRet21 = undefined;
                }
                buffer.write(commandRet21, true);
                buffer.write('">\r\n            ');
                var id22 = scope.resolve(['content']);
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
KISSY.add('date/picker/month-panel/month-panel-xtpl', ['./months-xtpl'], function (S, require, exports, module) {
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
    var t = function (scope, buffer, payload, undefined) {
        var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
        if ('5.0.0' !== S.version) {
            throw new Error('current xtemplate file(' + engine.name + ')(v5.0.0) need to be recompiled using current kissy(v' + S.version + ')!');
        }
        var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var commandRet2 = callCommandUtil(engine, scope, option0, buffer, 'getBaseCssClasses', 1);
        if (commandRet2 && commandRet2.isBuffer) {
            buffer = commandRet2;
            commandRet2 = undefined;
        }
        buffer.write(commandRet2, true);
        buffer.write('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-year-btn');
        option3.params = params4;
        var commandRet5 = callCommandUtil(engine, scope, option3, buffer, 'getBaseCssClasses', 2);
        if (commandRet5 && commandRet5.isBuffer) {
            buffer = commandRet5;
            commandRet5 = undefined;
        }
        buffer.write(commandRet5, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousYearLabel']);
        buffer.write(id6, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('year-select');
        option7.params = params8;
        var commandRet9 = callCommandUtil(engine, scope, option7, buffer, 'getBaseCssClasses', 9);
        if (commandRet9 && commandRet9.isBuffer) {
            buffer = commandRet9;
            commandRet9 = undefined;
        }
        buffer.write(commandRet9, true);
        buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
        var id10 = scope.resolve(['yearSelectLabel']);
        buffer.write(id10, true);
        buffer.write('">\r\n        <span class="');
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('year-select-content');
        option11.params = params12;
        var commandRet13 = callCommandUtil(engine, scope, option11, buffer, 'getBaseCssClasses', 14);
        if (commandRet13 && commandRet13.isBuffer) {
            buffer = commandRet13;
            commandRet13 = undefined;
        }
        buffer.write(commandRet13, true);
        buffer.write('">');
        var id14 = scope.resolve(['year']);
        buffer.write(id14, true);
        buffer.write('</span>\r\n        <span class="');
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('year-select-arrow');
        option15.params = params16;
        var commandRet17 = callCommandUtil(engine, scope, option15, buffer, 'getBaseCssClasses', 15);
        if (commandRet17 && commandRet17.isBuffer) {
            buffer = commandRet17;
            commandRet17 = undefined;
        }
        buffer.write(commandRet17, true);
        buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="');
        var option18 = { escape: 1 };
        var params19 = [];
        params19.push('next-year-btn');
        option18.params = params19;
        var commandRet20 = callCommandUtil(engine, scope, option18, buffer, 'getBaseCssClasses', 18);
        if (commandRet20 && commandRet20.isBuffer) {
            buffer = commandRet20;
            commandRet20 = undefined;
        }
        buffer.write(commandRet20, true);
        buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
        var id21 = scope.resolve(['nextYearLabel']);
        buffer.write(id21, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('body');
        option22.params = params23;
        var commandRet24 = callCommandUtil(engine, scope, option22, buffer, 'getBaseCssClasses', 25);
        if (commandRet24 && commandRet24.isBuffer) {
            buffer = commandRet24;
            commandRet24 = undefined;
        }
        buffer.write(commandRet24, true);
        buffer.write('">\r\n    <table class="');
        var option25 = { escape: 1 };
        var params26 = [];
        params26.push('table');
        option25.params = params26;
        var commandRet27 = callCommandUtil(engine, scope, option25, buffer, 'getBaseCssClasses', 26);
        if (commandRet27 && commandRet27.isBuffer) {
            buffer = commandRet27;
            commandRet27 = undefined;
        }
        buffer.write(commandRet27, true);
        buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="');
        var option28 = { escape: 1 };
        var params29 = [];
        params29.push('tbody');
        option28.params = params29;
        var commandRet30 = callCommandUtil(engine, scope, option28, buffer, 'getBaseCssClasses', 27);
        if (commandRet30 && commandRet30.isBuffer) {
            buffer = commandRet30;
            commandRet30 = undefined;
        }
        buffer.write(commandRet30, true);
        buffer.write('">\r\n        ');
        var option31 = {};
        var params32 = [];
        params32.push('./months-xtpl');
        option31.params = params32;
        require('./months-xtpl');
        option31.params[0] = module.resolve(option31.params[0]);
        var commandRet33 = includeCommand.call(engine, scope, option31, buffer, 28, payload);
        if (commandRet33 && commandRet33.isBuffer) {
            buffer = commandRet33;
            commandRet33 = undefined;
        }
        buffer.write(commandRet33, false);
        buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
        return buffer;
    };
    t.TPL_NAME = module.name;
    return t;
});
