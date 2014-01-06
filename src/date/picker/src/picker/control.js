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
        PickerRender = require('./render'),
        MonthPanel = require('./month-panel/control');
    var tap = Node.Gesture.tap;
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
        var value = self.dateTable[parseInt(td.attr('data-index'),10)];
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
                view: 1,
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
                view: 1,
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
                view: 1,
                value: true
            },
            clear: {
                view: 1,
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
                view: 1,
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