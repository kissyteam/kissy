/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 14 18:39
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/dialog
*/

/**
 * custom dialog for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/dialog", function (S, Editor, Overlay,
                                            focusFix, ConstrainPlugin, DragPlugin) {

   return Overlay.Dialog.extend({

        initializer: function () {
            this.plug(new DragPlugin({
                handlers: ['.ks-editor-dialog-header'],
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
            self.callSuper();
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
    requires: ["editor", 'overlay', './focus-fix', 'dd/plugin/constrain', 'component/plugin/drag']
});

