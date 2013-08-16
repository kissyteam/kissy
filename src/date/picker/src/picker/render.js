/**
 * render for year panel
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/render', function (S, Control, GregorianCalendar, DateTimeFormat, PickerTpl) {
    var dateRowTplStart = '<tr role="row">';
    var dateRowTplEnd = '</tr>';
    var dateCellTpl = '<td role="gridcell" title="{title}" class="{cls}">{content}</td>';
    var dateTpl = '<a hidefocus="on" class="{cls}" href="#">{content}</a>';
    var DATE_ROW_COUNT = 6;
    var DATE_COL_COUNT = 7;

    function isSameDay(one, two) {
        return one.get(GregorianCalendar.YEAR) == two.get(GregorianCalendar.YEAR) &&
            one.get(GregorianCalendar.MONTH) == two.get(GregorianCalendar.MONTH) &&
            one.get(GregorianCalendar.DAY_OF_MONTH) == two.get(GregorianCalendar.DAY_OF_MONTH);
    }

    function beforeCurrentMonthYear(current, today) {
        if (current.get(GregorianCalendar.YEAR) < today.get(GregorianCalendar.YEAR)) {
            return 1;
        }
        return current.get(GregorianCalendar.YEAR) == today.get(GregorianCalendar.YEAR) &&
            current.get(GregorianCalendar.MONTH) < today.get(GregorianCalendar.MONTH);
    }

    function afterCurrentMonthYear(current, today) {
        if (current.get(GregorianCalendar.YEAR) > today.get(GregorianCalendar.YEAR)) {
            return 1;
        }
        return current.get(GregorianCalendar.YEAR) == today.get(GregorianCalendar.YEAR) &&
            current.get(GregorianCalendar.MONTH) > today.get(GregorianCalendar.MONTH);
    }

    function renderDatesCmd(){
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
            today.setTimeInMillis(S.now());
            return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
        },
        beforeCreateDom: function (renderData, childrenSelectors, renderCommands) {
            var self = this;
            var control = self.control;
            var locale = control.get('locale');
            var value = control.get('value');
            var dateLocale = value.getLocale();
            S.mix(childrenSelectors, {
                previousMonthBtn: '#ks-date-picker-previous-month-btn-{id}',
                monthSelectEl: '#ks-date-picker-month-select-{id}',
                monthSelectContentEl: '#ks-date-picker-month-select-content-{id}',
                nextMonthBtn: '#ks-date-picker-next-month-btn-{id}',
                todayBtnEl: '#ks-date-picker-today-btn-{id}',
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
                monthYearLabel: self.getMonthYearLabel(),
                previousMonthLabel: locale.previousMonth,
                monthSelectLabel: locale.monthSelect,
                nextMonthLabel: locale.nextMonth,
                weekdays: weekDays,
                veryShortWeekdays: veryShortWeekdays,
                todayLabel: locale.today,
                todayTimeLabel: self.getTodayTimeLabel()
            });
            renderCommands.renderDates = renderDatesCmd;
        },
        renderDates: function () {
            var self = this,
                i, j,
                tables = [],
                current,
                control = self.control,
                locale = control.get('locale'),
                value = control.get('value'),
                today = value.clone(),
                cellClass = self.getBaseCssClass('cell'),
                dateClass = self.getBaseCssClass('date'),
                dateRender = control.get('dateRender'),
                disabledDate = control.get('disabledDate'),
                dateLocale = value.getLocale(),
                dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale),
                todayClass = self.getBaseCssClass('today'),
                selectedClass = self.getBaseCssClass('selected-day'),
                lastMonthDayClass = self.getBaseCssClass('last-month-cell'),
                nextMonthDayClass = self.getBaseCssClass('next-month-btn-day'),
                disabledClass = self.getBaseCssClass('disabled-cell');

            today.setTimeInMillis(S.now());
            var month1 = value.clone();

            month1.set(value.get(GregorianCalendar.YEAR), value.get(GregorianCalendar.MONTH), 1);
            var day = month1.get(GregorianCalendar.DAY_OF_WEEK);
            var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
            // calculate last month
            var lastMonth1 = month1.clone();
            lastMonth1.add(GregorianCalendar.DAY_OF_MONTH, -lastMonthDiffDay);
            var passed = 0;
            for (i = 0; i < DATE_ROW_COUNT; i++) {
                tables[i] = [];
                for (j = 0; j < DATE_COL_COUNT; j++) {
                    current = lastMonth1;
                    if (passed) {
                        current = current.clone();
                        current.add(GregorianCalendar.DAY_OF_MONTH, passed);
                    }
                    tables[i][j] = current;
                    passed++;
                }
            }
            var tableHtml = '';
            for (i = 0; i < DATE_ROW_COUNT; i++) {
                var rowHtml = dateRowTplStart;
                for (j = 0; j < DATE_COL_COUNT; j++) {
                    current = tables[i][j];
                    var cls = cellClass;

                    if (isSameDay(current, today)) {
                        cls += ' ' + todayClass;
                    }
                    if (isSameDay(current, value)) {
                        cls += ' ' + selectedClass;
                    }
                    if (beforeCurrentMonthYear(current, value)) {
                        cls += ' ' + lastMonthDayClass;
                    }
                    if (afterCurrentMonthYear(current, value)) {
                        cls += ' ' + nextMonthDayClass;
                    }
                    if (disabledDate && disabledDate(current, value)) {
                        cls += ' ' + disabledClass;
                    }

                    var dateHtml = '';
                    if (dateRender && (dateHtml = dateRender(current, value))) {
                    } else {
                        dateHtml = S.substitute(dateTpl, {
                            cls: dateClass,
                            content: current.get(GregorianCalendar.DAY_OF_MONTH)
                        });
                    }
                    rowHtml += S.substitute(dateCellTpl, {
                        cls: cls,
                        title: dateFormatter.format(current),
                        content: dateHtml
                    });
                }
                tableHtml += rowHtml + dateRowTplEnd;
            }
            control.dateTable = tables;
            return tableHtml;
        },
        // re render after current value change
        _onSetValue: function () {
            var control = this.control;
            var tbodyEl = control.get('tbodyEl');
            var monthSelectContentEl = control.get('monthSelectContentEl');
            var todayBtnEl = control.get('todayBtnEl');
            monthSelectContentEl.html(this.getMonthYearLabel());
            todayBtnEl.attr('title', this.getTodayTimeLabel());
            tbodyEl.html(this.renderDates());
        }
    }, {
        name: 'date-picker-render',
        ATTRS: {
            contentTpl: {
                value: PickerTpl
            }
        }
    });
}, {
    requires: ['component/control',
        'date/gregorian',
        'date/format',
        './picker-tpl']
});