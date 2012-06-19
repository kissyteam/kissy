/**
 * @fileOverview tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treemgr", function (S, Event) {

    function TreeMgr() {
    }

    TreeMgr.ATTRS =
    /**
     * @lends Tree#
     */
    {
        /**
         * Whether show root node.
         * Default:true.
         * @type Boolean
         */
        showRootNode:{
            value:true,
            view:1
        },
        /**
         * Current selected tree node.
         * @type Tree.Node
         */
        selectedItem:{},
        tree:{
            valueFn:function () {
                return this;
            }
        },
        // only root node is focusable
        focusable:{
            value:true
        }
    };

    function getIdFromNode(c) {
        var el = c.get("el"),
            id = el.attr("id");
        if (!id) {
            el.attr("id", id=S.guid("tree-node"));
        }
        return id;
    }

    S.augment(TreeMgr, {
        /*
         加快从事件代理获取原事件节点
         */
        __getAllNodes:function () {
            var self = this;
            if (!self._allNodes) {
                self._allNodes = {};
            }
            return self._allNodes;
        },

        __renderUI:function () {
            var self = this;
            // add 过那么一定调用过 checkIcon 了
            if (!self.get("children").length) {
                self._computeClass("root_renderUI");
            }
        },

        _register:function (c) {
            this.__getAllNodes()[getIdFromNode(c)] = c;
        },

        _unRegister:function (c) {
            delete this.__getAllNodes()[getIdFromNode(c)];
        },

        handleKeyEventInternal:function (e) {
            var current = this.get("selectedItem");
            if (e.keyCode == Event.KeyCodes.ENTER) {
                // 传递给真正的单个子节点
                return current.performActionInternal(e);
            }
            return current._keyNav(e);
        },

        // 重写 delegateChildren ，缓存加快从节点获取对象速度
        getOwnerControl:function (node) {
            var self = this,
                n,
                allNodes = self.__getAllNodes(),
                elem = self.get("el")[0];
            while (node && node !== elem) {
                if (n = allNodes[node.id]) {
                    return n;
                }
                node = node.parentNode;
            }
            // 最终自己处理
            return self;
        },

        // 单选
        _uiSetSelectedItem:function (n, ev) {
            if (ev.prevVal) {
                ev.prevVal.set("selected", false);
            }
            n.set("selected", true);
        },


        _uiSetFocused:function (v) {
            var self = this;
            // 得到焦点时没有选择节点
            // 默认选择自己
            if (v && !self.get("selectedItem")) {
                self.select();
            }
        }
    });

    return TreeMgr;
}, {
    requires:['event']
});