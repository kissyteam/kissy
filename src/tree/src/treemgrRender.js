/**
 * @fileOverview tree management utils render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treemgrRender", function (S) {

    function TreeMgrRender() {
    }

    TreeMgrRender.ATTRS = {
        // 默认 true
        // 是否显示根节点
        showRootNode:{
        }
    };

    S.augment(TreeMgrRender, {
        __renderUI:function () {
            var self = this;
            self.get("el").attr("role", "tree")[0]['hideFocus'] = true;
            self.get("rowEl").addClass("ks-tree-row");
        },

        _uiSetShowRootNode:function (v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        }
    });

    return TreeMgrRender;
});