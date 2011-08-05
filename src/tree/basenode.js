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
     * @name BaseNode
     * @constructor
     * @extends Component.ModelControl
     * @borrows Component.DecorateChild.prototype
     */
    var BaseNode = UIBase.create(Component.ModelControl,
        /*
         * 可多继承从某个子节点开始装饰儿子组件
         */
        [Component.DecorateChild],
        /**
         * @lends BaseNode.prototype
         */
        {
            _keyNav:function(e) {
                var processed = true,
                    n,
                    children = this.get("children"),
                    keyCode = e.keyCode;

                // 顺序统统为前序遍历顺序
                switch (keyCode) {
                    // home
                    // 移到树的顶层节点
                    case KeyCodes.HOME:
                        n = this.get("tree");
                        break;

                    // end
                    // 移到最后一个可视节点
                    case KeyCodes.END:
                        n = this.get("tree").getLastVisibleDescendant();
                        break;

                    // 上
                    // 当前节点的上一个兄弟节点的最后一个可显示节点
                    case KeyCodes.UP:
                        n = this.getPreviousVisibleNode();
                        break;

                    // 下
                    // 当前节点的下一个可显示节点
                    case KeyCodes.DOWN:
                        n = this.getNextVisibleNode();
                        break;

                    // 左
                    // 选择父节点或 collapse 当前节点
                    case KeyCodes.LEFT:
                        if (this.get("expanded") && children.length) {
                            this.set("expanded", false);
                        } else {
                            n = this.get("parent");
                        }
                        break;

                    // 右
                    // expand 当前节点
                    case KeyCodes.RIGHT:
                        if (children.length) {
                            if (!this.get("expanded")) {
                                this.set("expanded", true);
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
                var children = this.get("children");
                // 没有展开或者根本没有儿子节点，可视的只有自己
                if (!this.get("expanded") || !children.length) {
                    return this;
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
                var n = this.next();
                while (parent && !n) {
                    n = parent.next();
                    parent = parent.get("parent");
                }
                return n;
            },

            getPreviousVisibleNode:function() {
                var prev = this.prev();
                if (!prev) {
                    prev = this.get("parent");
                } else {
                    prev = prev.getLastVisibleDescendant();
                }
                return prev;
            },

            next:function() {
                var parent = this.get("parent");
                if (!parent) {
                    return null;
                }
                var siblings = parent.get('children');
                var index = S.indexOf(this, siblings);
                if (index == siblings.length - 1) {
                    return null;
                }
                return siblings[index + 1];
            },

            prev:function() {
                var parent = this.get("parent");
                if (!parent) {
                    return null;
                }
                var siblings = parent.get('children');
                var index = S.indexOf(this, siblings);
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
                this.get("tree").set("selectedItem", this);
            },

            _performInternal:function(e) {
                var target = $(e.target),
                    tree = this.get("tree"),
                    view = this.get("view");
                tree.get("el")[0].focus();
                if (target.equals(view.get("expandIconEl"))) {
                    // 忽略双击
                    if (e.type != 'dblclick') {
                        this.set("expanded", !this.get("expanded"));
                    }
                } else if (e.type == 'dblclick') {
                    this.set("expanded", !this.get("expanded"));
                }
                else {
                    this.select();
                    tree.fire("click", {
                        target:this
                    });
                }
            },

            // 默认 addChild，这里需要设置 tree 属性
            decorateChildrenInternal:function(ui, c, cls) {
                this.addChild(new ui({
                    srcNode:c,
                    tree:this.get("tree"),
                    prefixCls:cls
                }));
            },

            addChild:function(c) {
                var tree = this.get("tree");
                c.set("tree", tree);
                c.set("depth", this.get('depth') + 1);
                BaseNode.superclass.addChild.call(this, c);
                this._updateRecursive();
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
                var view = this.get("view");
                view._computeClass(this.get('children'), this.get("parent"), cause);
            },

            _updateRecursive:function() {
                var len = this.get('children').length;
                this._computeClass("_updateRecursive");
                S.each(this.get("children"), function(c, index) {
                    c._computeClass("_updateRecursive_children");
                    c.get("view").set("ariaPosInSet", index + 1);
                    c.get("view").set("ariaSize", len);
                });
            },

            removeChild:function(c) {
                var tree = this.get("tree");
                tree._unregister(c);
                S.each(c.get("children"), function(cc) {
                    tree._unregister(cc);
                });
                BaseNode.superclass.removeChild.apply(this, S.makeArray(arguments));
                this._updateRecursive();
            },

            _uiSetExpanded:function(v) {
                this._computeClass("expanded-" + v);
                var tree = this.get("tree");
                if (v) {
                    tree.fire("expand", {
                        target:this
                    });
                } else {
                    tree.fire("collapse", {
                        target:this
                    });
                }
            },


            expandAll:function() {
                this.set("expanded", true);
                S.each(this.get("children"), function(c) {
                    c.set("expanded", true);
                });
            },

            collapseAll:function() {
                this.set("expanded", false);
                S.each(this.get("children"), function(c) {
                    c.set("expanded", false);
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
                        var id = this.get("el").attr("id");
                        if (!id) {
                            this.get("el").attr("id", id = S.guid("tree-node"));
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
                selected:{view:true},

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