/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
/**
 * select component for kissy editor,need refactor to KISSY MenuButton
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/select/index", function (S, Editor, MenuButton, undefined) {
    /**
     * 将button ui 和点击功能分离
     * 按钮必须立刻显示出来，功能可以慢慢加载
     */
    Editor.prototype.addSelect = function (id, cfg, methods, SelectType) {

        SelectType = SelectType || MenuButton.Select;

        var self = this, prefixCls = self.get("prefixCls") + "editor-";

        if (cfg) {
            cfg.editor = self;
            if (cfg.menu) {
                cfg.menu.zIndex = Editor.baseZIndex(Editor.zIndexManager.SELECT);
                cfg.menu.xclass = 'popupmenu';
                S.each(cfg.menu.children, function (child) {
                    child.xclass = 'option';
                });
            }
        }

        var s = new SelectType(S.mix({
            elAttrs:{
                hideFocus:'hideFocus'
            },
            render:self.get("toolBarEl"),
            prefixCls:prefixCls,
            autoRender:true
        }, cfg));

        s.get("el").unselectable();

        S.mix(s, methods);

        if (s.selectionChange) {
            self.on("selectionChange", function () {
                if (self.get("mode") == Editor.SOURCE_MODE) {
                    return;
                }
                s.selectionChange.apply(s, arguments);
            });
        }

        if (s.click) {
            s.on("click", function (ev) {
                s.click.apply(s, arguments);
                ev.halt();
            });
        }

        if (cfg.mode == Editor.WYSIWYG_MODE) {
            self.on("wysiwygMode", function () {
                s.set('disabled', false);
            });
            self.on("sourceMode", function () {
                s.set('disabled', true);
            });
        }

        s.init && s.init();

        self.addControl(id, s);
        return s;

    };

    return MenuButton.Select;
}, {
    requires:['editor', 'menubutton']
});
