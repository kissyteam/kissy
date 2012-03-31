/**
 * @fileOverview menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/base", function (S, Event, UIBase, Component, MenuRender) {
    var KeyCodes = Event.KeyCodes;

    function onMenuHide() {
        this.set("highlightedItem", undefined);
    }

    /**
     * @name Menu
     * @constructor
     * @extends Component.Container
     */
    var Menu = UIBase.create(Component.Container,
        // ! note : 2012-03-31
        // sync with menu render,extends contentBox too!
        [UIBase.ContentBox],
        /** @lends Menu.prototype*/
        {
            _uiSetHighlightedItem:function (v, ev) {
                var pre = ev && ev.prevVal;
                if (pre) {
                    pre.set("highlighted", false);
                }
                v && v.set("highlighted", true);
                this.set("activeItem", v);
            },

            _handleBlur:function (e) {
                Menu.superclass._handleBlur.call(this, e);
                this.set("highlightedItem", undefined);
            },


            //dir : -1 ,+1
            //skip disabled items
            _getNextEnabledHighlighted:function (index, dir) {
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

            _handleKeydown:function (e) {
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
            _handleKeyEventInternal:function (e) {

                // Give the highlighted control the chance to handle the key event.
                var highlightedItem = this.get("highlightedItem");

                // 先看当前活跃 menuitem 是否要处理
                if (highlightedItem && highlightedItem._handleKeydown(e)) {
                    return true;
                }

                var children = this.get("children"), len = children.length;

                if (len === 0) {
                    return undefined;
                }

                var index, destIndex;

                //自己处理了，不要向上处理，嵌套菜单情况
                switch (e.keyCode) {
                    // esc
                    case KeyCodes.ESC:
                        // TODO
                        // focus 的话手动失去焦点
                        return undefined;
                        break;

                    // home
                    case KeyCodes.HOME:
                        this.set("highlightedItem",
                            this._getNextEnabledHighlighted(0, 1));
                        break;
                    // end
                    case KeyCodes.END:
                        this.set("highlightedItem",
                            this._getNextEnabledHighlighted(len - 1, -1));
                        break;
                    // up
                    case KeyCodes.UP:
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
                    case KeyCodes.DOWN:
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

            bindUI:function () {
                var self = this;
                /**
                 * 隐藏后，去掉高亮与当前
                 */
                self.on("hide", onMenuHide, self);
            },

            containsElement:function (element) {
                var self = this;

                // 隐藏当然不包含了
                // self.get("visible") === undefined 相当于 true
                if (self.get("visible") === false || !self.get("view")) {
                    return false;
                }

                if (self.get("view").containsElement(element)) {
                    return true;
                }

                var children = self.get('children');

                for (var i = 0, count = children.length; i < count; i++) {
                    var child = children[i];
                    if (typeof child.containsElement == 'function' &&
                        child.containsElement(element)) {
                        return true;
                    }
                }

                return false;
            }

            /*
             hideAll :function(){
             // 当前高亮项设置为 null，则全部子菜单都隐藏咯
             this.set("highlightedItem",null);
             }
             */
        }, {
            ATTRS:{
                // 普通菜单可聚焦
                // 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
                focusable:{
                    value:true
                },
                visibleMode:{
                    value:"display"
                },
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
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Menu
    });

    return Menu;

}, {
    requires:['event', 'uibase', 'component', './menurender', './submenu']
});

/**
 * TODO
 *  - 去除 activeItem
 **/