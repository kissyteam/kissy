/**
 * abstraction of tree node ,root and other node will extend it
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/abstractnode", function(S, Node, UIBase, Component, AbstractNodeRender) {
    var $ = Node.all;
    var EXPAND_ICON_CLS = "tree-expand-icon";
    var AbstractNode = UIBase.create(Component.ModelControl, {

        _performInternal:function(e) {
            var target = $(e.target);
            var tree = this.get("tree");
            if (target.hasClass(this.getCls(EXPAND_ICON_CLS))
                || e.type == 'dblclick'
                ) {
                this.set("expanded", !this.get("expanded"));
            } else {
                this.set("selected", true);
                tree.set("selectedItem", this);
                tree.fire("click", {
                    target:this
                });
            }
        },


        addChild:function(c) {
            var tree = this.get("tree");
            c.set("tree", tree);
            c.set("depth", this.get('depth') + 1);
            AbstractNode.superclass.addChild.call(this, c);
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
            var view = this.get("view");
            this._computeClass("_updateRecursive");
            view.set("ariaSize", this.get('children').length);
            S.each(this.get("children"), function(c, index) {
                c._computeClass("_updateRecursive_children");
                c.get("view").set("ariaPosInSet", index);
            });
        },

        removeChild:function(c) {
            var tree = this.get("tree");
            tree._unregister(c);
            S.each(c.get("children"), function(cc) {
                tree._unregister(cc);
            });
            AbstractNode.superclass.removeChild.apply(this, S.makeArray(arguments));
            this._updateRecursive();
        },

        _uiSetExpanded:function(v) {
            this._computeClass("expanded-" + v);
        }
    }, {
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
            }
        },

        DefaultRender:AbstractNodeRender
    });

    return AbstractNode;

}, {
    requires:['node','uibase','component','./abstractnoderender']
});