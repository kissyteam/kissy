/**
 * date picker control
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/control', function (S, GregorianDate, Control, PickerRender) {
    return Control.extend({

    }, {
        xclass: 'date-picker',
        ATTRS: {
            value: {
                valueFn: function () {
                    var date = new GregorianDate();
                    date.setTimeInMillis(S.now());
                    return date;
                }
            },
            previousMonthEl: {},
            monthSelectEl: {},
            nextMonthEl: {},
            tbodyEl: {},
            todayEl: {},
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
    requires: ['date/gregorian', 'component/control', './render']
});