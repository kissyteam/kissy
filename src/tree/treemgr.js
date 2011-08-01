/**
 * tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treemgr", function(S) {

    function TreeMgr() {
        /*加快从事件代理获取原事件节点*/
        this._allNodes = {};
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
        __renderUI:function() {
            // add 过那么一定调用过 checkIcon 了
            if (!this.get("children").length) {
                this._computeClass("root_renderUI");
            }
        },

        _register:function(c) {
            this._allNodes[c.get("id")] = c;
        },

        _unregister:function(c) {
            delete this._allNodes[c.get("id")];
        },


        __bindUI:function() {
            var self = this,el = self.get("el");
            el.on("mousedown mouseup mouseover mouseout dblclick",
                self._handleChildMouseEvents, self);
        },

        _handleChildMouseEvents:function(e) {
            var control = this._getOwnerNode(S.one(e.target)[0]);
            if (control) {
                // Child control identified; forward the event.
                switch (e.type) {
                    
                    case "mousedown":
                        control._handleMouseDown(e);
                        break;
                    case "mouseup":
                        control._handleMouseUp(e);
                        break;
                    case "mouseover":
                        control._handleMouseOver(e);
                        break;
                    case "mouseout":
                        control._handleMouseOut(e);
                        break;
                    case "dblclick":
                        control._handleDblClick(e);
                        break;
                }
            }
        },

        _handleKeyEventInternal:function(e) {
            var current = this.get("selectedItem");
            if (e.keyCode == 13) {
                // 传递给真正的单个子节点
                return current._performInternal(e);
            }
            return current._keyNav(e);
        },

        _getOwnerNode:function(node) {
            var self = this,
                n,
                elem = self.get("el")[0];
            while (node && node !== elem) {
                if (n = self._allNodes[node.id]) {
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