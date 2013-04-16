/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:23
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
        if (e.newVal) {
            self.set("expandedItem", null);
        } else {
            self.set("expandedItem", e.target);
        }
    }

    function afterHighlightedChange(e) {
        var self = this,
            expandedItem,
            children,
            target = e.target;
        if (self !== target && (target.isMenuItem || target.isButton)) {

            if (e.newVal) {
                children = self.get('children');
                if (expandedItem = self.get('expandedItem') && S.inArray(target, children)) {
                    // in case collapse false modify highlightedItem
                    self.set('expandedItem', target.isMenuButton ? target : null);
                }
                self.set("highlightedItem", target);
            } else {
                if (!e.byPassSetToolbarHighlightedItem) {
                    self.set('highlightedItem', null);
                }
            }
        }
    }

    function getChildByHighlightedItem(toolbar) {
        var children = toolbar.get('children'), i, child;
        for (i = 0; i < children.length; i++) {
            child = children[i];
            if (child.get('highlighted') || (child.isMenuButton && !child.get('collapsed'))) {
                return child;
            }
        }
        return null;
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
            createDom: function () {
                this.get("el").attr("role", "toolbar");
            },

            _onSetHighlightedItem: function (item, e) {
                var id, itemEl,
                    self = this,
                    prevVal = e && e.prevVal,
                    children = self.get('children'),
                    el = self.get('el');
                // only clear children's status
                if (prevVal && S.inArray(prevVal, children)) {
                    prevVal.set('highlighted', false, {
                        data: {
                            byPassSetToolbarHighlightedItem: 1
                        }
                    });
                }
                if (item) {
                    if (el[0].ownerDocument.activeElement != el[0]) {
                        self.focus();
                    }
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

            '_onSetExpandedItem': function (v, e) {
                if (e && e.prevVal) {
                    e.prevVal.set('collapsed', true);
                }
                if (v) {
                    v.set('collapsed', false);
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
                self.set("expandedItem", null);
                // clear for afterHighlightedChange
                if (highlightedItem = self.get("highlightedItem")) {
                    highlightedItem.set('highlighted', false);
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
                    currentChild = getChildByHighlightedItem(self),
                    nextHighlightedItem = self.getNextItemByKeyEventInternal(e, currentChild);

                if (typeof nextHighlightedItem == 'boolean') {
                    return nextHighlightedItem;
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
                },
                defaultChildCfg: {
                    value: {
                        xclass: 'button',
                        handleMouseEvents: false,
                        focusable: false
                    }
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
