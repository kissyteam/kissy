/**
 * deletable menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitem", function(S, Node, UIBase, Component, MenuItem, DelMenuItemRender) {
    var $ = Node.all;
    var CLS = DelMenuItemRender.CLS,
        DEL_CLS = DelMenuItemRender.DEL_CLS;
    var DelMenuItem = UIBase.create(MenuItem, {
        _performInternal:function(e) {
            var target = $(e.target);
            // 点击了删除
            if (target.hasClass(this.getCls(DEL_CLS))) {
                this.get("parent").removeChild(this, true);
                this.get("parent").set("highlightedItem", null);
                this.get("parent").fire("delete", {
                    target:this
                });
                return true;
            }
            return MenuItem.prototype._performInternal.call(this, e);
        },
        _handleKeydown:function(e) {
            // d 键
            if (e.keyCode == 68) {
                this.get("parent").removeChild(this, true);
                this.get("parent").set("highlightedItem", null);
                this.get("parent").fire("delete", {
                    target:this
                });
                return true;
            }
        }
    }, {
        ATTRS:{
            delTooltip:{
                view:true
            }
        },
        DefaultRender:DelMenuItemRender
    });


    Component.UIStore.setUIByClass(CLS, {
        priority:40,
        ui:DelMenuItem
    });
    return DelMenuItem;
}, {
    requires:['node','uibase','component','./menuitem','./delmenuitemrender']
});