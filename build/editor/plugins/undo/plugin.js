/**
 * undo,redo manager for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("undo", function(editor) {
    var S = KISSY,
        KE = S.Editor;


    var RedoMap = {
        "redo":1,
        "undo":-1
    },
        tplCfg = {
            mode:KE.WYSIWYG_MODE,
            init:function() {
                var self = this,
                    editor = self.editor;
                /**
                 * save,restore完，更新工具栏状态
                 */
                editor.on("afterSave afterRestore",
                    self.cfg._respond,
                    self);
                self.btn.disable();
            },
            offClick:function() {
                var self = this;
                self.editor.fire("restore", {
                    d:RedoMap[self.cfg.flag]
                });
            }
        },
        undoCfg = S.mix({
            flag:"undo",
            _respond:function(ev) {
                var self = this,
                    index = ev.index,
                    btn = self.btn;

                //有状态可退
                if (index > 0) {
                    btn.boff();
                } else {
                    btn.disable();
                }
            }
        }, tplCfg, false),
        redoCfg = S.mix({
            flag:"redo",
            _respond:function(ev) {
                //debugger
                var self = this,
                    history = ev.history,
                    index = ev.index,
                    btn = self.btn;
                //有状态可前进
                if (index < history.length - 1) {
                    btn.boff();
                } else {
                    btn.disable();
                }
            }
        }, tplCfg, false);

    editor.addPlugin("undo", function() {
        /**
         * 撤销工具栏按钮
         */
        var b1 = editor.addButton("undo", {
            title:"撤销",
            loading:true,
            contentCls:"ke-toolbar-undo"
        });

        /**
         * 重做工具栏按钮
         */
        var b2 = editor.addButton("undo", {
            title:"重做",
            loading:true,
            contentCls:"ke-toolbar-redo"
        });
        KE.use("undo/support", function() {
            /**
             * 编辑器历史中央管理
             */
            new KE.UndoManager(editor);
            b1.reload(undoCfg);
            b2.reload(redoCfg);
        });

        this.destroy = function() {
            b1.destroy();
            b2.destroy();
        };
    });

}, {
    attach:false
});
