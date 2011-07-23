/**
 * menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, UIBase, Component, MenuRender) {

    var Menu = UIBase.create(Component.Container, {
        _uiSetHighlightedItem:function(v, ev) {
            var pre = ev && ev.prevVal;
            if (pre) {
                pre.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.set("activeItem", v);
        },

        _handleBlur:function(e) {
            // 父亲不允许自己处理
            if (Menu.superclass._handleBlur.call(this, e)) {
                return true;
            }
            this.set("highlightedItem", undefined);
        },


        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted:function(index, dir) {
            var children = this.get("children"),
                len = children.length,
                o = index;
            do {
                var c = children[index];
                if (!c.get("disabled") && (c.get("visible") !== false)) {
                    return children[index];
                }
                index = (index + dir + len) % len;
            } while (index != o);
            return undefined;
        },

        _handleKeydown:function(e) {
            if (this._handleKeyEventInternal(e)) {
                e.halt();
                return true;
            }
            // return false , 会阻止 tab 键 ....
            return undefined;
        },

        /**
         * Attempts to handle a keyboard event; returns true if the event was handled,
         * false otherwise.  If the container is enabled, and a child is highlighted,
         * calls the child control's {@code handleKeyEvent} method to give the control
         * a chance to handle the event first.
         * @param  e Key event to handle.
         * @return {boolean} Whether the event was handled by the container (or one of
         *     its children).
         */
        _handleKeyEventInternal:function(e) {

            // Give the highlighted control the chance to handle the key event.
            var highlightedItem = this.get("highlightedItem");

            // 先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem._handleKeydown(e)) {
                return true;
            }

            var children = this.get("children"),len = children.length;

            if (len == 0) {
                return undefined;
            }

            var index,destIndex;

            //自己处理了，不要向上处理，嵌套菜单情况
            switch (e.keyCode) {
                // esc
                case 27:
                    // TODO
                    // focus 的话手动失去焦点
                    return undefined;
                    break;

                // home
                case 36:
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(0, 1));
                    break;
                // end
                case 35:
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(len - 1, -1));
                    break;
                // up
                case 38:
                    if (!highlightedItem) {
                        destIndex = len - 1;
                    } else {
                        index = S.indexOf(highlightedItem, children);
                        destIndex = (index - 1 + len) % len;
                    }
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(destIndex, -1));
                    break;
                //down
                case 40:
                    if (!highlightedItem) {
                        destIndex = 0;
                    } else {
                        index = S.indexOf(highlightedItem, children);
                        destIndex = (index + 1 + len) % len;
                    }
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(destIndex, 1));
                    break;
                default:
                    return undefined;
            }
            return true;
        },

        bindUI:function() {
            var self = this;
            /**
             * 隐藏后，去掉高亮与当前
             */
            self.on("hide", function() {
                self.set("highlightedItem", undefined);
            });
        },


        containsElement:function(element) {
            if (this.get("view").containsElement(element)) {
                return true;
            }

            var children = this.get('children');

            for (var i = 0, count = children.length; i < count; i++) {
                var child = children[i];
                if (typeof child.containsElement == 'function' &&
                    child.containsElement(element)) {
                    return true;
                }
            }

            return false;
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
        },
        DefaultRender:MenuRender
    });

    Component.UIStore.setUIByClass("menu", {
        priority:10,
        ui:Menu
    });

    return Menu;

}, {
    requires:['uibase','component','./menurender','./submenu']
});

/**
 * TODO
 *  - 去除 activeItem
 **/