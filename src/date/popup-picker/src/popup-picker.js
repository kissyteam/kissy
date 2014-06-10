/**
 * @ignore
 * popup date picker
 * @author yiminghe@gmail.com
 */

var PopupPickerTpl = require('./popup-picker/render-xtpl'),
    DatePicker = require('date/picker'),
    Shim = require('component/extension/shim'),
    AlignExtension = require('component/extension/align');

/**
 * popup date picker ui component
 * @class KISSY.Date.PopupPicker
 * @extends KISSY.Component.Control
 * @mixins KISSY.Component.Extension.Shim
 * @mixins KISSY.Component.Extension.Align
 */
module.exports = DatePicker.extend([Shim, AlignExtension], {
}, {
    xclass: 'popup-date-picker',
    ATTRS: {
        contentTpl: {
            value: PopupPickerTpl
        }
    }
});
