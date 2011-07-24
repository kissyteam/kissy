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
            if (target.hasClass(this.getCls(EXPAND_ICON_CLS))) {
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
            this._updateAriaSize();
            tree._register(c);
            S.each(c.get("children"), function(cc) {
                tree._register(cc);
            });
        },

        _updateAriaSize:function() {
            var view = this.get("view");
            view._checkIcon(this.get('children'));
            view.set("ariaSize", this.get('children').length);
            S.each(this.get("children"), function(c, index) {
                c.set("ariaPosInSet", index);
            });
        },

        removeChild:function() {
            var tree = this.get("tree");
            tree._unregister(c);
            S.each(c.get("children"), function(cc) {
                tree._unregister(cc);
            });
            AbstractNode.superclass.removeChild.apply(this, S.makeArray(arguments));
            this._updateAriaSize();
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