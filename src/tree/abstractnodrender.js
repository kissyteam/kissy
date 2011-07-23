/**
 * common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/abstractnoderender", function(S, UIBase, Component) {

    var LABEL_CLS = "tree-item-label",
        ITEM_CLS = "tree-item",
        EXPAND_ICON_CLS = "tree-expand-icon",
        ICON_CLS = "tree-icon",
        ROW_CLS = "tree-row";
    return UIBase.create(Component.Render, {

        renderUI:function() {

        },
        creteDom:function() {

        }

    }, {
        ATTRS:{
            labelEl:{},
            content:{}
        }
    });

}, {
    requires:['uibase','component']
});