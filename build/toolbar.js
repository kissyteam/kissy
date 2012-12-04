/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 5 02:27
*/
/**
 * Toolbar for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("toolbar", function (S, Component, Node, Separator, undefined) {

    var KeyCodes = Node.KeyCodes;

    function getNextEnabledItem(index, direction, self) {
        var children = self.get("children"),
            count = 0,
            childrenLength = children.length;

        if (index == undefined) {
            if (direction == 1) {
                index = 0;
            } else {
                index = childrenLength - 1;
            }
            if (!children[index].get("disabled")) {
                return children[index];
            }
        }

        do {
            count++;
            index = (index + childrenLength + direction) % childrenLength;
        } while (count < childrenLength && children[index].get("disabled"));

        if (count != childrenLength) {
            return children[index];
        }

        return null;
    }

    function afterCollapsedChange(e) {
        var self = this;
        if (e.target != self) {
            if (e.newVal) {
                self.set("expandedItem", null);
            } else {
                self.set("expandedItem", e.target);
            }
        }
    }

    function afterHighlightedChange(e) {
        var self = this,
            expandedItem,
            t = e.target;
        if (
        // 不是自己本身的事件！
            t != self) {

            // S.log(t.get('content') + ' : ' + e.newVal);

            if (e.newVal) {
                self.set("highlightedItem", t);
                // 保持扩展状态，只不过扩展的 item 变了
                if ((expandedItem = self.get("expandedItem")) &&
                    expandedItem.hasAttr("collapsed") &&
                    expandedItem != t) {
                    expandedItem.set("collapsed", true);
                    t.set("collapsed", false);
                }
            } else {
                self.set("highlightedItem", null);
            }

        }
    }

    function processChild(c) {
        // 交给容器代理
        c.set("handleMouseEvents", false);
        c.set("focusable", false);
    }

    /**
     * @name Toolbar
     * @class
     * KISSY Toolbar.
     * xclass: 'toolbar'.
     * @extends KISSY.Component.Container
     */
    var Toolbar = Component.Container.extend(
        /**
         * @lends Toolbar#
         */
        {

            addChild: function () {
                var c = Toolbar.superclass.addChild.apply(this, arguments);
                processChild(c);
                return c;
            },

            createDom: function () {
                this.get("el").attr("role", "toolbar");
            },

            _onSetHighlightedItem: function (item) {
                var id, self = this, itemEl, el = self.get('el');
                if (item) {
                    itemEl = item.get('el');
                    id = itemEl.attr("id");
                    if (!id) {
                        itemEl.attr("id", id = S.guid("ks-toolbar-item"));
                    }
                    el.attr("aria-activedescendant", id);
                } else {
                    el.attr("aria-activedescendant", "");
                }
            },

            /**
             * Protected.
             */
            bindUI: function () {
                var self = this;
                self.on("afterCollapsedChange", afterCollapsedChange, self);
                self.on("afterHighlightedChange", afterHighlightedChange, self);
            },

            handleBlur: function () {
                var self = this,
                    highlightedItem,
                    expandedItem;
                if (expandedItem = self.get("expandedItem")) {
                    expandedItem.set("collapsed", true);
                }
                if (highlightedItem = self.get("highlightedItem")) {
                    highlightedItem.set("highlighted", false);
                }
            },

            getNextItemByKeyEventInternal: function (e, current) {
                var self = this,
                    orientation = self.get("orientation"),
                    children = self.get("children"),
                    childIndex = current && S.indexOf(current, children);

                if (current) {
                    if (current.handleKeyEventInternal(e)) {
                        return true;
                    }
                }

                // Do not handle the key event if any modifier key is pressed.
                if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                    return false;
                }

                // Either nothing is highlighted, or the highlighted control didn't handle
                // the key event, so attempt to handle it here.
                switch (e.keyCode) {
                    case KeyCodes.ESC:
                        self.getKeyEventTarget().fire("blur");
                        return true;

                    case KeyCodes.HOME:
                        current = getNextEnabledItem(undefined, 1, self);
                        break;

                    case KeyCodes.END:
                        current = getNextEnabledItem(undefined, -1, self);
                        break;

                    case KeyCodes.UP:
                        current = getNextEnabledItem(childIndex, -1, self);
                        break;

                    case KeyCodes.LEFT:
                        current = getNextEnabledItem(childIndex, -1, self);
                        break;

                    case KeyCodes.DOWN:
                        current = getNextEnabledItem(childIndex, 1, self);
                        break;

                    case KeyCodes.RIGHT:
                        current = getNextEnabledItem(childIndex, 1, self);
                        break;

                    default:
                        return false;
                }
                return current;
            },

            handleKeyEventInternal: function (e) {
                var self = this,
                    current = self.get("highlightedItem"),
                    nextHighlightedItem = self.getNextItemByKeyEventInternal(e, current);

                if (S.isBoolean(nextHighlightedItem)) {
                    return nextHighlightedItem;
                }

                if (current) {
                    current.set("highlighted", false);
                }

                if (nextHighlightedItem) {
                    nextHighlightedItem.set("highlighted", true);
                }

                return true;
            }

        }, {
            ATTRS: /**
             * @lends Toolbar#
             */
            {
                // 当前的高亮项
                highlightedItem: {
                },
                // 当前的扩展项，切换高亮项时如要把以前的扩展项收起，并展开当前的高亮项
                expandedItem: {
                }
            }
        }, {
            xclass: 'toolbar',
            priority: 10
        });

    return Toolbar;

}, {
    requires: ['component/base', 'node']
});
