
KISSY.Editor.add("core~plugin", function(E) {

    /**
     * 插件种类
     */
    E.PLUGIN_TYPE = {
        CUSTOM: 0,
        TOOLBAR_SEPARATOR: 1,
        TOOLBAR_BUTTON: 2,
        TOOLBAR_DROP_BUTTON: 4,
        TOOLBAR_MENU_BUTTON: 8,
        TOOLBAR_SELECT: 16,
        STATUSBAR_ITEM: 32,
        FUNC: 64 // 纯功能性质插件，无 UI
    };

});
