/**
 * @ignore
 * decade panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Node = require('node'),
        Control = require('component/control'),
        CenturyPanelRender = require('./render');

    var tap = Node.Gesture.tap;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }

    function nextCentury(e) {
        e.preventDefault();
        goYear(this, 100);
    }

    function prevCentury(e) {
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
        bindUI: function () {
            var self = this;
            self.get('nextCenturyBtn').on(tap, nextCentury, self);
            self.get('previousCenturyBtn').on(tap, prevCentury, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
        }
    }, {
        xclass: 'date-picker-decade-panel',
        ATTRS: {
            focusable: {
                value: false
            },
            value: {
                view: 1
            },
            xrender: {
                value: CenturyPanelRender
            }
        }
    });
});