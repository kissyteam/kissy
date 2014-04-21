/**
 * @ignore
 * year panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node'),
        GregorianCalendar = require('date/gregorian'),
        locale = require('i18n!date/picker'),
        Control = require('component/control'),
        MonthPanel = require('./month-panel/control');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;
    var KeyCode = Node.KeyCode;

    var DateTimeFormat = require('date/format'),
        PickerTpl = require('date/picker-xtpl');
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
        beforeCreateDom: function (renderData, childrenSelectors, renderCommands) {
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
            var self = this,
                i, j,
                dateTable = [],
                current,
                isClear = self.get('clear'),
                showWeekNumber = self.get('showWeekNumber'),
                locale = self.get('locale'),
                value = self.get('value'),
                today = value.clone(),
                cellClass = self.getBaseCssClasses('cell'),
                weekNumberCellClass = self.getBaseCssClasses('week-number-cell'),
                dateClass = self.getBaseCssClasses('date'),
                dateRender = self.get('dateRender'),
                disabledDate = self.get('disabledDate'),
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
            contentTpl: {
                value: PickerTpl
            },

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
            monthPanel: {
                valueFn: setUpMonthPanel
            },
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
            }
        }
    });
});
/*
 keyboard
 - http://www.w3.org/TR/wai-aria-practices/#datepicker
 */