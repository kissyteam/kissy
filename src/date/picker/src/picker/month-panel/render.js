/**
 * @ignore
 * render for month panel
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
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
                current.setMonth( index);
                months[i][j] = {
                    value:index,
                    content: shortMonths[index],
                    title: dateFormatter.format(current)
                };
                index++;
            }
        }
        S.mix(control.view.renderData,{
            months:months,
            year: value.getYear(),
            month:currentMonth
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