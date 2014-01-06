/**
 * @ignore
 * render for year-panel
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
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