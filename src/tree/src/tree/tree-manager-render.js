/**
 * tree management utils render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-manager-render", function (S) {

    function TreeManagerRender() {
        this.get('elAttrs')['role']='tree';
    }

    TreeManagerRender.ATTRS = {
        // 默认 true
        // 是否显示根节点
        showRootNode: {
        }
    };

    S.augment(TreeManagerRender, {
        '_onSetShowRootNode': function (v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        }
    });

    return TreeManagerRender;
});