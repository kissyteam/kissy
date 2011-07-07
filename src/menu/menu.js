/**
 * menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, UIBase, Component, MenuRender) {

    var Menu;

    Menu = UIBase.create(Component.Container, [
        UIBase.Position,
        UIBase.Align
    ], {

        _uiSetHighlightedItem:function(v, ev) {
            var pre = ev && ev.prevVal;
            if (pre) {
                pre.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.set("activeItem", v);
        },

        _handleBlur:function(e) {
            if (Menu.superclass._handleBlur.call(this,e) === true) {
                return true;
            }
            this.set("highlightedItem", null);
        },


        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted:function(index, dir) {
            var children = this.get("children");
            if (children.length == 0) {
                return null;
            }
            if (!children[index].get("disabled")) {
                return children[index];
            }
            var o = index;
            index += dir;
            while (index != o) {
                if (!children[index].get("disabled")) {
                    return children[index];
                }
                index += dir;
                if (index == -1) {
                    index = children.length - 1;
                }
                else if (index == children.length) {
                    index = 0;
                }
            }
            return null;
        },

        _handleClick:function(e) {
            if (Menu.superclass._handleClick.call(this, e) === true)
                return true;
            var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem) {
                if (highlightedItem._handleClick(e) === true) {
                    return true;
                }
            }
        },

        _handleKeydown:function(e) {

            if (Menu.superclass._handleKeydown.call(this, e) === true)
                return true;
             var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem) {

                if (highlightedItem._handleKeydown(e) === true) {
                    return true;
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
                return true;
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
                return true;
            }
        },

        bindUI:function() {
            var self = this;
            /**
             * 隐藏后，去掉高亮与当前
             */
            self.on("hide", function() {
                self.set("highlightedItem", null);
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
            }
        }
    });

    Menu.DefaultRender = MenuRender;
    return Menu;

}, {
    requires:['uibase','component','./menurender','./submenu']
});