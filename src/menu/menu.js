/**
 * menu model and controller for kissy,accommodate menu items
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, UIBase, Component, MenuRender) {

    var Menu;

    Menu = UIBase.create(Component.ModelControl, [
        UIBase.Position,
        UIBase.Align
    ], {

        _bindMenuItem:function(menuItem) {
            var self = this;

            menuItem.on("afterHighlightedChange", function(ev) {
                //允许取消
                S.log("menu knows menuitemchange : " + ev.newVal
                    + " : " + menuItem.get("view").get("el").attr("id"));
                self.set("highlightedItem", ev.newVal ? this : null);
            });

            menuItem.on("click", function() {
                S.log("menu fire click : " + menuItem.get("view").get("el").attr("id"));
                self.fire("menuItemClick",{
                    menuItem:this
                });
            });
        },

        _uiSetHighlightedItem:function(v, ev) {
            if (ev && ev.prevVal) {
                ev.prevVal.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.get("view").set("highlightedItem", v);
            this.set("activeItem", v);
        },
        _handleBlur:function() {
            if (Menu.superclass._handleBlur.call(this) === false) return false;
            this.set("highlightedItem", null);
        },


        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted:function(index, dir) {
            var children = this.get("children");
            if (children.length == 0)return null;
            if (!children[index].get("disabled")) return children[index];
            var o = index;
            index += dir;
            while (index != o) {
                if (!children[index].get("disabled")) return children[index];
                index += dir;
                if (index == -1) index = children.length - 1;
                else if (index == children.length) index = 0;
            }
            return null;
        },

        _handleKeydown:function(e) {

            if (Menu.superclass._handleKeydown.call(this, e) === false)
                return false;
            var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem._handleKeydown) {
                if (highlightedItem._handleKeydown(e) === false) {
                    return false;
                }
            }

            //自己这边只处理上下
            var children = this.get("children");
            if (children.length === 0) {
                return;
            }
            var index,destIndex;

            //up
            if (e.keyCode == 38) {
                if (!highlightedItem) {
                    this.set("highlightedItem", this._getNextEnabledHighlighted(children.length - 1, -1));
                } else {
                    index = S.indexOf(highlightedItem, children);
                    destIndex = index == 0 ? children.length - 1 : index - 1;
                    this.set("highlightedItem", this._getNextEnabledHighlighted(destIndex, -1));
                }
                e.preventDefault();
                //自己处理了，嵌套菜单情况
                return false;
            }
            //down
            else if (e.keyCode == 40) {
                if (!highlightedItem) {
                    this.set("highlightedItem", this._getNextEnabledHighlighted(0, 1));
                } else {
                    index = S.indexOf(highlightedItem, children);
                    destIndex = index == children.length - 1 ? 0 : index + 1;
                    this.set("highlightedItem", this._getNextEnabledHighlighted(destIndex, 1));
                }
                e.preventDefault();
                //自己处理了，不要向上处理，嵌套菜单情况
                return false;
            }
        },

        bindUI:function() {
            var self = this;
            S.each(this.get("children"), function(c) {
                self._bindMenuItem(c);
            });
        }
    }, {
        ATTRS:{
            /**
             * 当前高亮的儿子菜单项
             */
            highlightedItem:{},

            /**
             * 当前 active 的子孙菜单项，并不一直等于 highlightedItem
             */
            activeItem:{
                view:true
            },
            focusable:{
                //默认可以获得焦点
                value:true,
                view:true
            }
        }
    });

    Menu.DefaultRender = MenuRender;
    return Menu;

}, {
    requires:['uibase','component','./menurender']
});