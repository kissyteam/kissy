/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 17 23:00
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/button
*/

/**
 * @ignore
 * Encapsulate KISSY toggle button for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/button", function (S, Editor, Button) {
    /**
     * add button to editor
     * @param {String} id control id
     * @param {Object} cfg button config
     * @param {Function} ButtonType button constructor. needs to extend {@link KISSY.Button}, Defaults to {@link KISSY.Button}.
     * @member KISSY.Editor
     */
    Editor.prototype.addButton = function (id, cfg, ButtonType) {

        if (ButtonType === undefined) {
            ButtonType = Button;
        }
        var self = this,
            prefixCls = self.get('prefixCls') + "editor-toolbar-";

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
            prefixCls: self.get('prefixCls') + "editor-",
            editor: self
        }, cfg)).render();

        if (!cfg.content) {
            var contentEl = b.get("el").one("span");
            b.on("afterContentClsChange", function (e) {
                contentEl[0].className = prefixCls + 'item ' +
                    prefixCls + e.newVal;
            });
        }

        if (b.get("mode") == Editor.Mode.WYSIWYG_MODE) {
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

