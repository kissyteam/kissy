/**
 *  tree management utils render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-manager-render", function (S) {

    function TreeManagerRender() {
    }

    TreeManagerRender.ATTRS = {
        // 默认 true
        // 是否显示根节点
        showRootNode: {
        }
    };

    S.augment(TreeManagerRender, {
        __renderUI: function () {
            var self = this;
            self.get("el").attr("role", "tree");
            self.get("rowEl").addClass(self.get('prefixCls') + "tree-row");
        },

        '_onSetShowRootNode': function (v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        }
    });

    return TreeManagerRender;
});