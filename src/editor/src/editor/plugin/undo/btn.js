KISSY.add("editor/plugin/undo/btn", function (S, KE, Button) {
    function Common() {
        var self = this,
            editor = self.get("editor");
        /**
         * save,restore完，更新工具栏状态
         */
        editor.on("afterSave afterRestore", self._respond, self);
        self.disable();
    }


    function UndoBtn() {
        UndoBtn.superclass.constructor.apply(this, arguments);
        Common.call(this);
    }

    S.extend(UndoBtn, Button, {
        offClick:function () {
            this.get("editor").execCommand("undo");
        },
        _respond:function (ev) {
            var self = this,
                index = ev.index;

            //有状态可退
            if (index > 0) {
                self.boff();
            } else {
                self.disable();
            }
        }
    });


    function RedoBtn() {
        RedoBtn.superclass.constructor.apply(this, arguments);
        Common.call(this);
    }

    S.extend(RedoBtn, Button, {
        offClick:function () {
            this.get("editor").execCommand("redo");
        },
        _respond:function (ev) {
            var self = this,
                history = ev.history,
                index = ev.index;
            //有状态可前进
            if (index < history.length - 1) {
                self.boff();
            } else {
                self.disable();
            }
        }
    });


    return {
        RedoBtn:RedoBtn,
        UndoBtn:UndoBtn
    };

}, {
    requires:['editor', '../button/']
});