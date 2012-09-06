/**
 * load editor's dialog dynamically
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/dialog-loader/index", function (S, Overlay, Editor) {
    var globalMask,
        loadMask = {
            loading:function (prefixCls) {
                if (!globalMask) {
                    globalMask = new Overlay({
                        x:0,
                        width:S.UA['ie'] == 6 ? S.DOM.docWidth() : "100%",
                        y:0,
                        // 指定全局 loading zIndex 值
                        "zIndex":Editor.baseZIndex(Editor.zIndexManager.LOADING),
                        prefixCls:prefixCls+'editor-',
                        elCls:prefixCls+"editor-global-loading"
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
        useDialog:function (editor, name,config, args) {
            // restore focus in editor
            // make dialog remember
            editor.focus();
            var prefixCls=editor.get('prefixCls');
            if (editor.getControl(name + "/dialog")) {
                setTimeout(function () {
                    editor.showDialog(name, args);
                }, 0);
                return;
            }
            loadMask.loading(prefixCls);
            S.use("editor/plugin/" + name + "/dialog", function (S, Dialog) {
                loadMask.unloading();
                editor.addControl(name + "/dialog", new Dialog(editor,config));
                editor.showDialog(name, args);
            });
        }
    };
}, {
    requires:['overlay', 'editor']
});