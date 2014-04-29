/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:05
*/
/*
combined modules:
editor/plugin/overlay
*/
/**
 * @ignore
 * custom overlay  for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/overlay', [
    'editor',
    'overlay',
    './focus-fix'
], function (S, require) {
    var Editor = require('editor');
    var Overlay = require('overlay');
    var focusFix = require('./focus-fix');
    return Overlay.extend({
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


