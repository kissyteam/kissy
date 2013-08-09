/**
 * month select for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/year-panel/control', function (S, Node, GregorianCalendar, Control, YearPanelRender) {
    var tap = Node.Gesture.tap;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.add(GregorianCalendar.YEAR, direction);
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
        value.set(GregorianCalendar.YEAR, this.years[trIndex][tdIndex].content);
        this.set('value', value);
    }

    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextDecadeBtn').on(tap, nextDecade, self);
            self.get('previousDecadeBtn').on(tap, prevDecade, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
        }
    }, {
        xclass: 'date-picker-year-panel',
        ATTRS: {
            value: {
                view: 1
            },
            xrender: {
                value: YearPanelRender
            }
        }
    });
}, {
    requires: ['node', 'date/gregorian', 'component/control', './render']
});