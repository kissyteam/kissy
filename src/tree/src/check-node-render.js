/**
 * @fileOverview check node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-node-render", function (S, Node, TreeNodeRender) {
    var $ = Node.all,
        CHECK_CLS = "ks-tree-node-checked",
        ALL_STATES_CLS = "ks-tree-node-checked0 ks-tree-node-checked1 ks-tree-node-checked2";
    return TreeNodeRender.extend({

        createDom:function () {
            var self = this,
                expandIconEl = self.get("expandIconEl"),
                checkIconEl = $("<div>").insertAfter(expandIconEl);
            self.__set("checkIconEl", checkIconEl);
        },

        _uiSetCheckState:function (s) {
            var self = this,
                checkIconEl = self.get("checkIconEl");
            checkIconEl.removeClass(ALL_STATES_CLS).addClass(CHECK_CLS + s);
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