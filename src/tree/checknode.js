/**
 * checkable tree node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checknode", function(S, Node, UIBase, Component, BaseNode, CheckNodeRender) {
    var $ = Node.all,
        PARTIAL_CHECK = 2,
        CHECK = 1,
        EMPTY = 0,
        EXPAND_ICON_CLS = "tree-expand-icon";
    return UIBase.create(BaseNode, {
        _performInternal:function(e) {
            // 需要通知 tree 获得焦点
            this.get("tree").get("el")[0].focus();
            var target = $(e.target);
            var tree = this.get("tree");
            if (target.hasClass(this.getCls(EXPAND_ICON_CLS))
                || e.type == 'dblclick'
                ) {
                this.set("expanded", !this.get("expanded"));
            } else {
                var checkState = this.get("checkState");
                if (checkState == CHECK) {
                    checkState = EMPTY;
                } else {
                    checkState = CHECK;
                }
                this.set("checkState", checkState);
                tree.fire("click", {
                    target:this
                });
            }
        },

        _uiSetCheckState:function(s) {
            if (s == CHECK || s == EMPTY) {
                S.each(this.get("children"), function(c) {
                    c.set("checkState", s);
                });
            }
            // 每次状态变化都通知 parent 沿链检查，一层层向上通知
            // 效率不高，但是结构清晰
            var parent = this.get("parent");
            if (parent) {
                var checkCount = 0;
                var cs = parent.get("children");
                for (var i = 0; i < cs.length; i++) {
                    var c = cs[i],cState = c.get("checkState");
                    // 一个是部分选，父亲必定是部分选，立即结束
                    if (cState == PARTIAL_CHECK) {
                        parent.set("checkState", PARTIAL_CHECK);
                        return;
                    } else if (cState == CHECK) {
                        checkCount++;
                    }
                }

                // 儿子全都选了，父亲也全选
                if (checkCount == cs.length) {
                    parent.set("checkState", CHECK);
                }
                // 儿子都没选，父亲也不选
                else if (checkCount == 0) {
                    parent.set("checkState", EMPTY);
                }
                // 有的儿子选了，有的没选，父亲部分选
                else {
                    parent.set("checkState", PARTIAL_CHECK);
                }
            }
        }
    }, {
        ATTRS:{
            checkState:{
                view:true,
                // check 的三状态
                // 0 一个不选
                // 1 儿子有选择
                // 2 全部都选了
                value:0
            }
        },
        DefaultRender:CheckNodeRender,
        PARTIAL_CHECK:2,
        CHECK:1,
        EMPTY:0
    });
}, {
    requires:['node','uibase','component','./basenode','./checknoderender']
});