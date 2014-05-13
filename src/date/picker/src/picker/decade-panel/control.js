/**
 * @ignore
 * decade panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var util = require('util');
    var Node = require('node');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    var $ = Node.all;
    var Control = require('component/control'),
        DecadePanelTpl = require('./decade-panel-xtpl'),
        MonthsTpl = require('./decades-xtpl');

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
        util.mix(view.renderData, {
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
        this.fire('select', {
            value: value
        });
    }

    return Control.extend({
        beforeCreateDom: function (renderData, childrenSelectors) {
            var self = this;
            var locale = self.get('locale');
            prepareYears(self, this);
            util.mix(renderData, {
                previousCenturyLabel: locale.previousCentury,
                nextCenturyLabel: locale.nextCentury
            });
            util.mix(childrenSelectors, {
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
            self.get('tbodyEl').delegate(
                tap,
                    '.' + self.getBaseCssClass('cell'),
                chooseCell,
                self
            );
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
            contentTpl: {
                value: DecadePanelTpl
            },
            focusable: {
                value: false
            },
            value: {
                render: 1
            },
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