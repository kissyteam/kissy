/**
 * year panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/control', function (S, Node, GregorianCalendar, locale, Control, PickerRender) {
    var tap = Node.Gesture.tap;
    var $ = Node.all;

    function goMonth(self, direction) {
        var next = self.get('value').clone();
        next.add(GregorianCalendar.MONTH, direction);
        self.set('value', next);
    }

    function nextMonth(e) {
        e.preventDefault();
        goMonth(this, 1);
    }

    function prevMonth(e) {
        e.preventDefault();
        goMonth(this, -1);
    }

    function chooseCell(e) {
        e.preventDefault();
        var td = $(e.currentTarget);
        if (td.hasClass(this.view.getBaseCssClass('disabled-cell'))) {
            return;
        }
        var tr = td.parent();
        var tdIndex = td.index();
        var trIndex = tr.index();
        this.set('value', this.dateTable[trIndex][tdIndex]);
    }

    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextMonthBtn').on(tap, nextMonth, self);
            self.get('previousMonthBtn').on(tap, prevMonth, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
        }
    }, {
        xclass: 'date-picker',
        ATTRS: {
            value: {
                view: 1,
                valueFn: function () {
                    var date = new GregorianCalendar();
                    date.setTimeInMillis(S.now());
                    return date;
                }
            },
            previousMonthBtn: {},
            monthSelectEl: {},
            nextMonthBtn: {},
            tbodyEl: {},
            todayBtnEl: {},
            dateRender: {},
            disabledDate: {},
            locale: {
                value: locale
            },
            showToday: {
                view: 1,
                value: true
            },
            xrender: {
                value: PickerRender
            }
        }
    });
}, {
    requires: [
        'node',
        'date/gregorian',
        'i18n!date/picker',
        'component/control', './render'
    ]
});