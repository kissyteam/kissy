/**
 * @ignore
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
                value: Editor.baseZIndex(Editor.ZIndexManager.OVERLAY)
            }
        }
    });
}, {
    requires: ["editor", 'overlay', './focus-fix']
});