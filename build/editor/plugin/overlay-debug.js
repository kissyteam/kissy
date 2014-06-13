/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
/*
combined modules:
editor/plugin/overlay
*/
KISSY.add('editor/plugin/overlay', [
    'editor',
    'overlay',
    './focus-fix'
], function (S, require, exports, module) {
    /**
 * @ignore
 * custom overlay  for kissy editor
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var Overlay = require('overlay');
    var focusFix = require('./focus-fix');
    module.exports = Overlay.extend({
        bindUI: function () {
            focusFix.init(this);
        }
    }, {
        ATTRS: {
            prefixCls: { value: 'ks-editor-' },
            'zIndex': { value: Editor.baseZIndex(Editor.ZIndexManager.OVERLAY) }
        }
    });
});


