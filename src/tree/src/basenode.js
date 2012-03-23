/**
 * @fileOverview abstraction of tree node ,root and other node will extend it
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/basenode", function(S, Node, UIBase, Component, BaseNodeRender) {
    var $ = Node.all,
        ITEM_CLS = BaseNodeRender.ITEM_CLS,
        KeyCodes = Node.KeyCodes;


    /**
     * 基类树节点
     * @constructor
     */
    var BaseNode = UIBase.create(Component.Controller,
        /*
         * 可多继承从某个子节点开始装饰儿子组件
         */
        [Component.DecorateChild],
        {
            _keyNav:function(e) {
                var self = this,
                    processed = true,
                    n,
                    children = self.get("children"),
                    keyCode = e.keyCode;

                // 顺序统统为前序遍历顺序
                switch (keyCode) {
                    // home
                    // 移到树的顶层节点
                    case KeyCodes.HOME:
                        n = self.get("tree");
                        break;

                    // end
                    // 移到最后一个可视节点
                    case KeyCodes.END:
                        n = self.get("tree").getLastVisibleDescendant();
                        break;

                    // 上
                    // 当前节点的上一个兄弟节点的最后一个可显示节点
                    case KeyCodes.UP:
                        n = self.getPreviousVisibleNode();
                        break;

                    // 下
                    // 当前节点的下一个可显示节点
                    case KeyCodes.DOWN:
                        n = self.getNextVisibleNode();
                        break;

                    // 左
                    // 选择父节点或 collapse 当前节点
                    case KeyCodes.LEFT:
                        if (self.get("expanded") && (children.length || self.get("isLeaf") === false)) {
                            self.set("expanded", false);
                        } else {
                            n = self.get("parent");
                        }
                        break;

                    // 右
                    // expand 当前节点
                    case KeyCodes.RIGHT:
                        if (children.length || self.get("isLeaf") === false) {
                            if (!self.get("expanded")) {
                                self.set("expanded", true);
                            } else {
                                children[0].select();
                            }
                        }
                        break;

                    default:
                        processed = false;
                        break;

                }
                if (n) {
                    n.select();
                }
                return processed;
            },

            getLastVisibleDescendant:function() {
                var self = this,children = self.get("children");
                // 没有展开或者根本没有儿子节点，可视的只有自己
                if (!self.get("expanded") || !children.length) {
                    return self;
                }
                // 可视的最后一个子孙
                return children[children.length - 1].getLastVisibleDescendant();
            },

            getNextVisibleNode:function() {
                var self = this,
                    children = self.get("children"),
                    parent = self.get("parent");
                if (self.get("expanded") && children.length) {
                    return children[0];
                }
                // 没有展开或者根本没有儿子节点
                // 深度遍历的下一个
                var n = self.next();
                while (parent && !n) {
                    n = parent.next();
                    parent = parent.get("parent");
                }
                return n;
            },

            getPreviousVisibleNode:function() {
                var self = this,prev = self.prev();
                if (!prev) {
                    prev = self.get("parent");
                } else {
                    prev = prev.getLastVisibleDescendant();
                }
                return prev;
            },

            next:function() {
                var self = this,parent = self.get("parent");
                if (!parent) {
                    return null;
                }
                var siblings = parent.get('children');
                var index = S.indexOf(self, siblings);
                if (index == siblings.length - 1) {
                    return null;
                }
                return siblings[index + 1];
            },

            prev:function() {
                var self = this, parent = self.get("parent");
                if (!parent) {
                    return null;
                }
                var siblings = parent.get('children');
                var index = S.indexOf(self, siblings);
                if (index === 0) {
                    return null;
                }
                return siblings[index - 1];
            },

            /**
             * 选中当前节点
             * @public
             */
            select : function() {
                var self = this;
                self.get("tree").set("selectedItem", self);
            },

            _performInternal:function(e) {
                var self = this,
                    target = $(e.target),
                    tree = self.get("tree"),
                    view = self.get("view");
                tree.get("el")[0].focus();
                if (target.equals(view.get("expandIconEl"))) {
                    // 忽略双击
                    if (e.type != 'dblclick') {
                        self.set("expanded", !self.get("expanded"));
                    }
                } else if (e.type == 'dblclick') {
                    self.set("expanded", !self.get("expanded"));
                }
                else {
                    self.select();
                    tree.fire("click", {
                        target:self
                    });
                }
            },

            // 默认 addChild，这里需要设置 tree 属性
            decorateChildrenInternal:function(ui, c, cls) {
                var self = this;
                self.addChild(new ui({
                    srcNode:c,
                    tree:self.get("tree"),
                    prefixCls:cls
                }));
            },

            addChild:function(c) {
                var self = this,tree = self.get("tree");
                c.__set("tree", tree);
                c.__set("depth", self.get('depth') + 1);
                BaseNode.superclass.addChild.call(self, c);
                self._updateRecursive();
                tree._register(c);
                S.each(c.get("children"), function(cc) {
                    tree._register(cc);
                });
            },

            /*
             每次添加/删除节点，都检查自己以及自己子孙 class
             每次 expand/collapse，都检查
             */
            _computeClass:function(cause) {
                var self = this,view = self.get("view");
                view._computeClass(self.get('children'), self.get("parent"), cause);
            },

            _updateRecursive:function() {
                var self = this,len = self.get('children').length;
                self._computeClass("_updateRecursive");
                S.each(self.get("children"), function(c, index) {
                    c._computeClass("_updateRecursive_children");
                    c.get("view").set("ariaPosInSet", index + 1);
                    c.get("view").set("ariaSize", len);
                });
            },

            removeChild:function(c) {
                var self = this,tree = self.get("tree");
                tree._unregister(c);
                S.each(c.get("children"), function(cc) {
                    tree._unregister(cc);
                });
                BaseNode.superclass.removeChild.apply(self, S.makeArray(arguments));
                self._updateRecursive();
            },

            _uiSetExpanded:function(v) {
                var self = this,
                    tree = self.get("tree");
                self._computeClass("expanded-" + v);
                if (v) {
                    tree.fire("expand", {
                        target:self
                    });
                } else {
                    tree.fire("collapse", {
                        target:self
                    });
                }
            },

            _uiSetSelected:function(v) {
                this._forwardSetAttrToView("selected", v);
            },


            expandAll:function() {
                var self = this;
                self.set("expanded", true);
                S.each(self.get("children"), function(c) {
                    c.expandAll();
                });
            },

            collapseAll:function() {
                var self = this;
                self.set("expanded", false);
                S.each(self.get("children"), function(c) {
                    c.collapseAll();
                });
            }
        },

        {
            DefaultRender:BaseNodeRender,
            ATTRS:{
                /*事件代理*/
                handleMouseEvents:{
                    value:false
                },
                id:{
                    getter:function() {
                        var self = this,
                            id = self.get("el").attr("id");
                        if (!id) {
                            self.get("el").attr("id", id = S.guid("tree-node"));
                        }
                        return id;
                    }
                },
                /**
                 * 节点字内容
                 * @type String
                 */
                content:{view:true},

                /**
                 * 强制指明该节点是否具备子孙，影响样式，不配置默认样式自动变化
                 * @type Boolean
                 */
                isLeaf:{
                    view:true
                },

                expandIconEl:{ view:true},

                iconEl:{ view:true},

                /**
                 * 是否选中
                 * @type Boolean
                 */
                selected:{},

                expanded:{
                    value:false,
                    view:true
                },

                /**
                 * html title
                 * @type String
                 */
                tooltip:{view:true},
                tree:{
                },

                /**
                 * depth of node
                 */
                depth:{
                    value:0,
                    view:true
                },
                focusable:{value:false},
                decorateChildCls:{
                    value:"tree-children"
                }
            },

            HTML_PARSER:{
                expanded:function(el) {
                    var children = el.one("." + this.getCls("tree-children"));
                    if (!children) {
                        return false;
                    }
                    return children.css("display") != "none";
                }
            }
        });

    Component.UIStore.setUIByClass(ITEM_CLS, {
        priority:10,
        ui:BaseNode
    });

    return BaseNode;

}, {
    requires:['node','uibase','component','./basenoderender']
});