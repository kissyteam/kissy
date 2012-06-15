/**
 * @fileOverview check node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checknodeRender", function (S, Node, BaseNodeRender) {
    var $ = Node.all,
        ICON_CLS = "ks-tree-icon",
        CHECK_CLS = "tree-item-checked",
        ALL_STATES_CLS = "tree-item-checked0 tree-item-checked1 tree-item-checked2",
        INLINE_BLOCK = " ks-inline-block";
    return BaseNodeRender.extend({

        createDom:function () {
            var self = this;
            var expandIconEl = self.get("expandIconEl"),
                checkEl = $("<div class='" + ICON_CLS + INLINE_BLOCK + "'/>").insertAfter(expandIconEl);
            self.__set("checkEl", checkEl);
        },

        _uiSetCheckState:function (s) {
            var self = this;
            var checkEl = self.get("checkEl");
            checkEl.removeClass(self.getCssClassWithPrefix(ALL_STATES_CLS))
                .addClass(self.getCssClassWithPrefix(CHECK_CLS + s));
        }

    }, {
        ATTRS:{
            checkEl:{},
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