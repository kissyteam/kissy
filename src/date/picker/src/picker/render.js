/**
 * date picker render
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/render', function (S, Control, DateTimeFormat, dateLocale, locale, PickerTpl) {
    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData, childrenSelectors, renderCommands) {
            var self = this;
            var control = self.control;
            var value = control.get('value');
            S.mix(childrenSelectors, {
                previousMonthEl: '#ks-date-picker-previous-month-{id}',
                monthSelectEl: '#ks-date-picker-month-select-{id}',
                nextMonthEl: '#ks-date-picker-next-month-{id}',
                tbodyEl: '#ks-date-picker-today-{id}'
            });
            S.mix(renderData, {
                monthYearLabel: new DateTimeFormat(locale.monthYearFormat).format(value),
                previousMonthLabel: locale.previousMonth,
                monthSelectLabel: locale.monthSelect,
                nextMonthLabel: locale.nextMonth,
                weekdays: dateLocale.weekdays,
                veryShortWeekdays: locale.veryShortWeekdays,
                todayLabel: locale.today,
                todayTimeLabel: new DateTimeFormat(locale.todayTimeFormat).format(value)
            });
            renderCommands.renderDates = S.bind(self.renderDates, self);
        },
        renderDates: function () {
            return 'TODO';
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: PickerTpl
            }
        }
    });
}, {
    requires: ['component/control',
        'date/format',
        'i18n!date',
        'i18n!date/picker',
        './picker-tpl']
});