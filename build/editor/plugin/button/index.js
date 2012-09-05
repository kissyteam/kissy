/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 5 10:33
*/
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
            prefixCls = self.get("prefixCls") + "editor-",
            b = new ButtonType(S.mix({
                render:self.get("toolBarEl"),
                autoRender:true,
                content:'<span ' +
                    'class="' + prefixCls + 'toolbar-item ' +
                    prefixCls + 'toolbar-' + id +
                    '"></span' +
                    '>',
                elCls:prefixCls + 'toolbar-button',
                prefixCls:prefixCls,
                editor:self
            }, cfg)), contentEl = b.get("el").one("span");

        // preserver selection in editor iframe
        // magic happens when tabIndex and unselectable are both set
        b.get("el").unselectable();

        b.on("afterContentClsChange", function (e) {
            contentEl[0].className = prefixCls + 'toolbar-item ' +
                prefixCls + 'toolbar-' + e.newVal;
        });

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
    requires:['editor', 'button']
});
