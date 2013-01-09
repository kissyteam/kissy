/**
 *  check node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-node-render", function (S, Node, TreeNodeRender) {
    var $ = Node.all,
        CHECK_CLS = "tree-node-checked",
        ALL_STATES_CLS = "tree-node-checked0 tree-node-checked1 tree-node-checked2";
    return TreeNodeRender.extend({

        createDom:function () {
            var self = this,
                expandIconEl = self.get("expandIconEl"),
                checkIconEl = $("<div>").insertAfter(expandIconEl);
            self.setInternal("checkIconEl", checkIconEl);
        },

        _onSetCheckState:function (s) {
            var self = this,
                checkIconEl = self.get("checkIconEl");
            checkIconEl.removeClass(self.getCssClassWithPrefix(ALL_STATES_CLS))
                .addClass(self.getCssClassWithPrefix(CHECK_CLS) + s);
        }

    }, {
        ATTRS:{
            checkIconEl:{},
            checkState:{
                // check 的三状态
                // 0 一个不选
                // 1 儿子有选择
                // 2 全部都选了
                value:0
            }
        }
    });
}, {
    requires:['node', './node-render']
});