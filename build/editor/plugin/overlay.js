﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:54
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/overlay
*/

/**
 * custom overlay  for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/overlay", function (S, Editor, Overlay, focusFix) {
    return Overlay.extend({
        bindUI: function () {
            focusFix.init(this);
        }
    }, {
        ATTRS: {
            prefixCls: {
                value: "ks-editor-"
            },
            "zIndex": {
                value: Editor.baseZIndex(Editor.zIndexManager.OVERLAY)
            }
        }
    });
}, {
    requires: ["editor", 'overlay', './focus-fix']
});

