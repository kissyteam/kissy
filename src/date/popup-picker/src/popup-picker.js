/**
 * @ignore
 * popup date picker
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
    var module = this;
    var PopupPickerTpl = module.require('./popup-picker/render-xtpl'),
        DatePicker = module.require('date/picker'),
        Shim = module.require('component/extension/shim'),
        AlignExtension = module.require('component/extension/align');

    var PopupDatePickerRender = DatePicker.getDefaultRender().extend({}, {
        ATTRS: {
            contentTpl: {
                value: PopupPickerTpl
            }
        }
    });

    /**
     * popup date picker ui component
     * @class KISSY.Date.PopupPicker
     * @extends KISSY.Component.Control
     * @mixins KISSY.Component.Extension.Shim
     * @mixins KISSY.Component.Extension.Align
     */
    return DatePicker.extend([Shim, AlignExtension], {
    }, {
        xclass: 'popup-date-picker',
        ATTRS: {
            xrender: {
                value: PopupDatePickerRender
            }
        }
    });
});