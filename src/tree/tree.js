/**
 * root node represent a simple tree
 * @author yiminghe@gmail.com
 * @refer http://www.w3.org/TR/wai-aria-practices/#TreeView
 */
KISSY.add("tree/tree", function(S, UIBase, Component, AbstractNode, TreeRender) {

    return UIBase.create(AbstractNode, {

        initializer:function() {
            /*加快从事件代理获取原事件节点*/
            this._allNodes = {

            };
        },

        renderUI:function() {
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


        bindUI:function() {
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

        _getOwnerNode:function(node) {
            var self = this,
                n,
                children = self.get("children"),
                len = children.length,
                elem = self.get('view').get("el")[0];
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
        }
    }, {
        ATTRS:{
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
            }
        },

        DefaultRender:TreeRender
    });

}, {
    requires:['uibase','component','./abstractnode','./treerender']
});