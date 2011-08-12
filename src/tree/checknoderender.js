KISSY.add("tree/checknoderender", function(S, Node, UIBase, Component, BaseNodeRender) {
    var $ = Node.all,
        ICON_CLS = "tree-icon",
        CHECK_CLS = "tree-item-check",
        ALL_STATES_CLS = "tree-item-checked0 tree-item-checked1 tree-item-checked2",
        INLINE_BLOCK = "inline-block";
    return UIBase.create(BaseNodeRender, {

        renderUI:function() {
            this.get("el").addClass(this.getCls(CHECK_CLS));
        },

        createDom:function() {
            var expandIconEl = this.get("expandIconEl"),
                checkEl = $("<div class='" + this.getCls(INLINE_BLOCK + " " + " "
                    + ICON_CLS) + "'/>").insertAfter(expandIconEl);
            this.set("checkEl", checkEl);
        },

        _uiSetCheckState:function(s) {
            var checkEl = this.get("checkEl");
            checkEl.removeClass(this.getCls(ALL_STATES_CLS))
                .addClass(this.getCls(CHECK_CLS + "ed" + s));
        }

    }, {
        ATTRS:{
            checkEl:{},
            checkState:{}
        },

        CHECK_CLS:CHECK_CLS
    });
}, {
    requires:['node','uibase','component','./basenoderender']
});