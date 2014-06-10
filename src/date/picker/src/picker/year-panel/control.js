/**
 * @ignore
 * month select for date picker
 * @author yiminghe@gmail.com
 */
var util = require('util');
var Control = require('component/control'),
    DecadePanel = require('../decade-panel/control');
var TapGesture = require('event/gesture/tap');
var tap = TapGesture.TAP;
var $ = require('node');
var DateFormat = require('date/format'),
    YearsTpl = require('./years-xtpl'),
    YearPanelTpl = require('./year-panel-xtpl');

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
    this.fire('select', {
        value: value
    });
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
        self.get('tbodyEl').delegate(
            tap,
                '.' + self.getBaseCssClass('cell'),
            chooseCell,
            self
        );
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
        contentTpl: {
            value: YearPanelTpl
        },
        focusable: {
            value: false
        },
        value: {
            render: 1
        },
        decadePanel: {
            valueFn: setUpDecadePanel
        },
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