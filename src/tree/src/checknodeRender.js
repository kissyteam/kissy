/**
 * @fileOverview check node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checknodeRender", function (S, Node, BaseNodeRender) {
    var $ = Node.all,
        ICON_CLS = "ks-tree-icon",
        CHECK_CLS = "ks-treeitem-checked",
        ALL_STATES_CLS = "ks-treeitem-checked0 ks-treeitem-checked1 ks-treeitem-checked2",
        INLINE_BLOCK = " ks-inline-block";
    return BaseNodeRender.extend({

        createDom:function () {
            var self = this,
                expandIconEl = self.get("expandIconEl"),
                checkIconEl = $("<div class='" + ICON_CLS + INLINE_BLOCK + "'/>").insertAfter(expandIconEl);
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
    requires:['node', './basenodeRender']
});