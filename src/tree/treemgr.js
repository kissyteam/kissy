/**
 * tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treemgr", function(S) {

    function TreeMgr() {
    }

    TreeMgr.ATTRS = {
        // 默认 true
        // 是否显示根节点
        showRootNode:{
            view:true
        },
        selectedItem:{},
        tree:{
            valueFn:function() {
                return this;
            }
        },
        focusable:{
            value:true
        }
    };

    S.augment(TreeMgr, {
        /*
         加快从事件代理获取原事件节点
         */
        __getAllNodes:function() {
            if (!this._allNodes) {
                this._allNodes = {};
            }
            return this._allNodes;
        },

        __renderUI:function() {
            // add 过那么一定调用过 checkIcon 了
            if (!this.get("children").length) {
                this._computeClass("root_renderUI");
            }
        },

        _register:function(c) {
            this.__getAllNodes()[c.get("id")] = c;
        },

        _unregister:function(c) {
            delete this.__getAllNodes()[c.get("id")];
        },

        _handleKeyEventInternal:function(e) {
            var current = this.get("selectedItem");
            if (e.keyCode == 13) {
                // 传递给真正的单个子节点
                return current._performInternal(e);
            }
            return current._keyNav(e);
        },

        // 重写 delegatechildren ，缓存加快从节点获取对象速度
        getOwnerControl:function(node) {
            var self = this,
                n,
                elem = self.get("el")[0];
            while (node && node !== elem) {
                if (n = self.__getAllNodes()[node.id]) {
                    return n;
                }
                node = node.parentNode;
            }
            // 最终自己处理
            return self;
        },

        // 单选
        _uiSetSelectedItem:function(n, ev) {
            if (ev.prevVal) {
                ev.prevVal.set("selected", false);
            }
            n.set("selected", true);
        },


        _uiSetFocused:function(v) {
            if (v) {
                // 得到焦点时没有选择节点
                // 默认选择自己
                if (!this.get("selectedItem")) {
                    this.select();
                }
            }
        }
    });

    return TreeMgr;
});