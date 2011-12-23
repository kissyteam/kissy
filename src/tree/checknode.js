/**
 * @fileOverview checkable tree node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checknode", function(S, Node, UIBase, Component, BaseNode, CheckNodeRender) {
    var $ = Node.all,
        PARTIAL_CHECK = 2,
        CHECK_CLS = "tree-item-check",
        CHECK = 1,
        EMPTY = 0;

    var CheckNode = UIBase.create(BaseNode, {
        _performInternal:function(e) {
            var self=this;
            // 需要通知 tree 获得焦点
            self.get("tree").get("el")[0].focus();
            var target = $(e.target),
                view = self.get("view"),
                tree = self.get("tree");

            if (e.type == "dblclick") {
                // 双击在 +- 号上无效
                if (target.equals(view.get("expandIconEl"))) {
                    return;
                }
                // 双击在 checkbox 上无效
                if (target.equals(view.get("checkEl"))) {
                    return;
                }
                // 双击在字或者图标上，切换 expand 装tai
                self.set("expanded", !self.get("expanded"));
            }

            // 点击在 +- 号，切换状态
            if (target.equals(view.get("expandIconEl"))) {
                self.set("expanded", !self.get("expanded"));
                return;
            }

            // 单击任何其他地方都切换 check 状态
            var checkState = self.get("checkState");
            if (checkState == CHECK) {
                checkState = EMPTY;
            } else {
                checkState = CHECK;
            }
            self.set("checkState", checkState);
            tree.fire("click", {
                target:self
            });
        },

        _uiSetCheckState:function(s) {
            var self=this;
            if (s == CHECK || s == EMPTY) {
                S.each(self.get("children"), function(c) {
                    c.set("checkState", s);
                });
            }
            // 每次状态变化都通知 parent 沿链检查，一层层向上通知
            // 效率不高，但是结构清晰
            var parent = self.get("parent");
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
                else if (checkCount === 0) {
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
        CHECK_CLS :CHECK_CLS,
        DefaultRender:CheckNodeRender,
        PARTIAL_CHECK:PARTIAL_CHECK,
        CHECK:CHECK,
        EMPTY:EMPTY
    });

    Component.UIStore.setUIByClass(CHECK_CLS, {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:CheckNode
    });

    return CheckNode;
}, {
    requires:['node','uibase','component','./basenode','./checknoderender']
});