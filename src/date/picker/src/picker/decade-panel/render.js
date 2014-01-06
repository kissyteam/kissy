/**
 * @ignore
 * render for decade panel
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Control = require('component/control'),
        DecadePanelTpl = require('./decade-panel-xtpl'),
        MonthsTpl = require('./decades-xtpl');

    function prepareYears(control, view) {
        var value = control.get('value');
        var currentYear = value.getYear();
        var startYear = parseInt(currentYear / 100,10) * 100;
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
        control.decades = decades;
        S.mix(view.renderData, {
            startYear: startYear,
            endYear: endYear,
            year: currentYear,
            decades: decades
        });
    }

    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData, childrenSelectors) {
            var control = this.control;
            var locale = control.get('locale');
            prepareYears(control, this);
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

        _onSetValue: function () {
            var control = this.control;
            prepareYears(control, this);
            var startYear = this.renderData.startYear;
            var endYear = this.renderData.endYear;
            control.get('tbodyEl').html(this.renderTpl(MonthsTpl));
            control.get('centuryEl').html(startYear + '-' + endYear);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: DecadePanelTpl
            }
        }
    });
});