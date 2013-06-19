/**
 * tree management utils render
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
        __beforeCreateDom:function(renderData){
            renderData.elAttrs.role='tree';
        },
        '_onSetShowRootNode': function (v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        }
    });

    return TreeManagerRender;
});