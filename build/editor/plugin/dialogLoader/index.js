/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 8 00:39
*/
/**
 * load editor's dialog dynamically
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/dialogLoader/index", function (S, Overlay, Editor) {
    var globalMask,
        loadMask = {
            loading:function () {
                if (!globalMask) {
                    globalMask = new Overlay({
                        x:0,
                        width:S.UA['ie'] == 6 ? S.DOM.docWidth() : "100%",
                        y:0,
                        // 指定全局 loading zIndex 值
                        "zIndex":Editor.baseZIndex(Editor.zIndexManager.LOADING),
                        prefixCls:'ks-editor-',
                        elCls:"ks-editor-global-loading"
                    });
                }
                globalMask.set("height", S.DOM.docHeight());
                globalMask.show();
                globalMask.loading();
            },
            unloading:function () {
                globalMask.hide();
            }
        };

    return {
        useDialog:function (editor, name, args) {
            // restore focus in editor
            // make dialog remember
            editor.focus();
            if (editor.hasDialog(name)) {
                setTimeout(function () {
                    editor.showDialog(name, args);
                }, 0);
                return;
            }
            loadMask.loading();
            S.use("editor/plugin/" + name, function (S, Dialog) {
                loadMask.unloading();
                editor.addDialog(name, new Dialog(editor));
                editor.showDialog(name, args);
            });
        }
    };
}, {
    requires:['overlay', 'editor']
});
