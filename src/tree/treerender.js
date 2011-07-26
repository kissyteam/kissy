/**
 * root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treerender", function(S, UIBase, Component, AbstractNodeRender) {
    var FOCUSED_CLS = "tree-item-focused";
    return UIBase.create(AbstractNodeRender, {
        renderUI:function() {
            this.get("el").addClass(this.getCls("tree-root"))[0].hideFocus = true;
        },

        _uiSetShowRootNode:function(v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        },

        _uiSetFocused:function(v) {
            this.get("el")[v ? "addClass" : "removeClass"](this.getCls(FOCUSED_CLS));
        }
    }, {
        ATTRS:{
            showRootNode:{}
        }
    });
}, {
    requires:['uibase','component','./abstractnoderender']
});