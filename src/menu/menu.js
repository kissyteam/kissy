/**
 * menu model and controller for kissy,accommodate menu items
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, UIBase, Component) {

    var Menu;

    Menu = UIBase.create(Component.ModelControl, [], {

        _bindMenuItem:function(menuItem) {
            var self = this;
            menuItem.on("afterSelectedChange", function(ev) {
                if (!ev.newVal) return;
                var selectedItem = self.get("selectedItem");
                if (selectedItem) {
                    selectedItem.set("selected", false);
                }
                self.set("selectedItem", this);
            });
            menuItem.on("afterHighlightedChange", function(ev) {
                if (!ev.newVal) return;
                var highlightedItem = this.get("highlightedItem");
                if (highlightedItem) {
                    highlightedItem.set("highlighted", false);
                }
                self.set("highlightedItem", this);
            });
        },

        _uiSetHighlightedItem:function(v, ev) {
            if (ev && ev.prevVal) {
                ev.prevVal.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.get("view").set("highlightedItem", v);
        },

        _handleMouseLeave:function() {
            if (Menu.superclass._handleMouseLeave.call(this) === false) return false;
            this.set("highlightedItem", null);
        },
        _handleBlur:function() {
            if (Menu.superclass._handleBlur.call(this) === false) return false;
            this.set("highlightedItem", null);
        },

        _handleClick:function() {

            if (Menu.superclass._handleClick.call(this) === false) return false;
            //从键盘来的，需要更新
            //否则 _bindMenuItem 会更新
            if (arguments.length == 0) {
                this.set("selectedItem", this.get("highlightedItem"));
            }
            if (this.get("selectedItem")) this.fire("menuItemSelected");
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

            if (Menu.superclass._handleKeydown.call(this, e) === false) return false;
            var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem._handleKeydown) {
                if (highlightedItem._handleKeydown(e) === false) return false;
            }

            //自己这边只处理上下
            var children = this.get("children");
            if (children.length == 0)return;
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
            }
        },

        bindUI:function() {
            var self = this;
            S.each(this.get("children"), function(c) {
                self._bindMenuItem(c);
            });
        },

        addChild:function(c) {
            Menu.superclass.addChild.call(this, c);
            this._bindMenuItem(c);
        },
        _uiSetVisible:function(v) {
            this.get("view").set("visible", v);
        },
        _uiFocusable:function(v) {
            this.get("view").set("focusable", v);
        },
        show:function() {
            this.set("visible", true);
        },
        hide:function() {
            this.set("visible", false);
        }
    }, {
        ATTRS:{
            highlightedItem:{},
            selectedItem:{},
            visible:{},
            focusable:{
                //默认可以获得焦点
                value:true
            }
        }
    });


    return Menu;

}, {
    requires:['uibase','component']
});