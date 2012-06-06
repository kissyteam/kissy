/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
/**
 * Encapsulate triple state button for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/button/index", function (S, Editor, Button) {
    /**
     * 将 button ui 和点击功能分离
     */
    Editor.prototype.addButton = function (id, cfg, methods, ButtonType) {

        if (ButtonType === undefined) {
            if (cfg.checkable) {
                ButtonType = Button.Toggle;
            } else {
                ButtonType = Button;
            }
            delete  cfg.checkable;
        }

        var self = this,
            prefixCls = self.get("prefixCls") + "editor-",
            b = new ButtonType(S.mix({
                render:self.get("toolBarEl"),
                elAttrs:{
                    hideFocus:'hideFocus'
                },
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
        b.get("el").unselectable();

        b.on("afterContentClsChange", function (e) {
            contentEl[0].className = prefixCls + 'toolbar-item ' +
                prefixCls + 'toolbar-' + e.newVal;
        });

        S.mix(b, methods);

        if (b.init) {
            b.init();
        }

        if (b.selectionChange) {
            self.on("selectionChange", function (ev) {
                if (self.get("mode") == Editor.SOURCE_MODE) {
                    return;
                }
                b.selectionChange(ev);
            });
        }

        if (b.onClick || b.offClick) {
            b.on("click", function (ev) {
                var t = b.get("checked"),
                // note! 反过来
                    action = t === true || t === undefined ? "offClick" : "onClick";
                if (b[action]) {
                    b[action](ev);
                }
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

        self.addControl(id, b);

        return b;
    };

    return Button;
}, {
    requires:['editor', 'button']
});
