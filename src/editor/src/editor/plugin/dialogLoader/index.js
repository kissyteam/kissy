/**
 * load editor's dialog dynamically
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/dialogLoader/index", function (S, Overlay, KE) {
    var globalMask,
        loadMask = {
            loading:function () {
                if (!globalMask) {
                    globalMask = new Overlay({
                        x:0,
                        width:S.UA['ie'] == 6 ? S.DOM.docWidth() : "100%",
                        y:0,
                        // 指定全局 loading zIndex 值
                        "zIndex":KE.baseZIndex(KE.zIndexManager.LOADING),
                        elCls:"ke-global-loading"
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
            if (editor.hasDialog(name)) {
                editor.showDialog(name, args);
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