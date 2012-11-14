/**
 * Encapsulate KISSY toggle button for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/button/index", function (S, Editor, Button) {
    /**
     * 将 button ui 和点击功能分离
     */
    Editor.prototype.addButton = function (id, cfg, ButtonType) {

        if (ButtonType === undefined) {
            ButtonType = Button;
        }
        var self = this,
            prefixCls = self.get("prefixCls") + "editor-toolbar-";

        if (cfg.elCls) {
            cfg.elCls = prefixCls + cfg.elCls;
        }

        cfg.elCls = prefixCls + 'button ' + (cfg.elCls || "");

        var b = new ButtonType(S.mix({
            render: self.get("toolBarEl"),
            content: '<span ' +
                'class="' + prefixCls + 'item ' +
                prefixCls + id +
                '"></span' +
                '>',
            prefixCls: self.get("prefixCls") + "editor-",
            editor: self
        }, cfg)).render();

        // preserver selection in editor iframe
        // magic happens when tabIndex and unselectable are both set
        b.get("el").unselectable();

        if (!cfg.content) {
            var contentEl = b.get("el").one("span");
            b.on("afterContentClsChange", function (e) {
                contentEl[0].className = prefixCls + 'item ' +
                    prefixCls + e.newVal;
            });
        }

        if (b.get("mode") == Editor.WYSIWYG_MODE) {
            self.on("wysiwygMode", function () {
                b.set("disabled", false);
            });
            self.on("sourceMode", function () {
                b.set("disabled", true);
            });
        }

        self.addControl(id + "/button", b);

        return b;
    };

    return Button;
}, {
    requires: ['editor', 'button']
});
