/**
 * @ignore
 * popup date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/popup-picker', function (S, PopupPickerTpl, DatePicker, AlignExtension, Shim) {
    var PopupDatePickerRender = DatePicker.getDefaultRender().extend({}, {
        ATTRS: {
            contentTpl: {
                value: PopupPickerTpl
            }
        }
    });
    return DatePicker.extend([Shim, AlignExtension], {
    }, {
        xclass: 'popup-date-picker',
        ATTRS: {
            xrender: {
                value: PopupDatePickerRender
            }
        }
    });
}, {
    requires: [
        './popup-picker/render-xtpl',
        'date/picker',
        'component/extension/align',
        'component/extension/shim'
    ]
});