/**
 * @ignore
 * custom overlay  for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var Overlay = require('overlay');
    var focusFix = require('./focus-fix');

    return Overlay.extend({
        bindUI: function () {
            focusFix.init(this);
        }
    }, {
        ATTRS: {
            prefixCls: {
                value: 'ks-editor-'
            },
            'zIndex': {
                value: Editor.baseZIndex(Editor.ZIndexManager.OVERLAY)
            }
        }
    });
});