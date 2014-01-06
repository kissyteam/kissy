/**
 * @ignore
 * render for year panel
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
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
            lastMonth1.addDayOfMonth(-lastMonthDiffDay);
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

        '_onSetClear': function (v) {
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