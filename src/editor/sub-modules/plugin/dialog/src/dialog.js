/**
 * custom dialog for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/dialog", function (S, Editor, Overlay, focusFix, ConstrainPlugin, DragPlugin) {

    var Dialog4E = Overlay.Dialog.extend({

        initializer: function () {
            this.plug(new DragPlugin({
                handlers: ['.ks-editor-stdmod-header'],
                plugins: [
                    new ConstrainPlugin({
                        constrain: window
                    })
                ]
            }));
        },

        bindUI: function () {
            focusFix.init(this);
        },
        show: function () {
            var self = this;
            //在 show 之前调用
            self.center();
            var y = self.get("y");
            //居中有点偏下
            if (y - S.DOM.scrollTop() > 200) {
                y = S.DOM.scrollTop() + 200;
                self.set("y", y);
            }
            Dialog4E.superclass.show.call(self);
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

    return Dialog4E;
}, {
    requires: ["editor", 'overlay', './focus-fix', 'dd/plugin/constrain', 'component/plugin/drag']
});