/**
 * @fileOverview KISSY.Dialog
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add('overlay/dialog', function (S, Overlay, DialogRender, Node) {

    var $ = Node.all;

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    /**
     * @class
     * KISSY Dialog Component.
     * xclass: 'dialog'.
     * @name Dialog
     * @memberOf Overlay
     * @extends Overlay
     * @extends Component.UIBase.StdMod
     * @extends Component.UIBase.Drag
     */
    var Dialog = Overlay.extend([
        require("stdmod"),
        require("drag")
    ],
        /**
         * @lends Overlay.Dialog#
         */
        {
            initializer: function () {
                var self = this, draggable;
                if (draggable = self.get("draggable")) {
                    if (!draggable.handlers) {
                        // default to drag header
                        draggable.handlers = [self.get("header")];
                    }
                }
            },
            handleKeyEventInternal: function (e) {
                if (e.keyCode === Node.KeyCodes.ESC) {
                    this.hide();
                    e.halt();
                    return;
                }
                trapFocus.call(this, e);
            },

            _uiSetVisible: function (v) {
                Dialog.superclass._uiSetVisible.apply(this, arguments);
                var el = this.get('el');
                if (v) {
                    this.__lastActive = el[0].ownerDocument.activeElement;
                    el[0].focus();
                    el.attr("aria-hidden", "false");
                } else {
                    el.attr("aria-hidden", "true");
                    this.__lastActive && this.__lastActive.focus();
                }
            }
        },

        {
            ATTRS: /**
             * @lends Overlay.Dialog#
             */
            {

                /**
                 * whether this component can be closed.
                 * @default true
                 * @type {Boolean}
                 */
                closable: {
                    value: true
                },

                xrender: {
                    value: DialogRender
                },

                focusable: {
                    value: true
                }
            }
        }, {
            xclass: 'dialog',
            priority: 20
        });


    var KEY_TAB = Node.KeyCodes.TAB;

    function trapFocus(e) {

        var self = this,
            keyCode = e.keyCode,
            firstFocusItem = self.get("el");
        if (keyCode != KEY_TAB) {
            return;
        }
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = $(e.target); // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state

        var lastFocusItem = firstFocusItem.last();

        // assumes firstFocusItem and lastFocusItem maintained by dialog object

        // see if we are shift-tabbing from first focusable item on dialog
        if (node.equals(firstFocusItem) && e.shiftKey) {
            lastFocusItem[0].focus(); // send focus to last item in dialog
            e.halt(); //stop the tab keypress event
        }
        // see if we are tabbing from the last focusable item
        else if (node.equals(lastFocusItem) && !e.shiftKey) {
            firstFocusItem[0].focus(); // send focus to first item in dialog
            e.halt(); //stop the tab keypress event
        }
        else {
            // see if the key is for the dialog
            if (node.equals(firstFocusItem) ||
                firstFocusItem.contains(node)) {
                return;
            }
        }
        // this key is for the document window
        // allow tabbing into the dialog
        e.halt();//stop the event if not a tab keypress
    } // end of function
    return Dialog;

}, {
    requires: [ "./base", './dialog-render', 'node']
});

/**
 * 2012-09-06 yiminghe@gmail.com
 *  merge aria with dialog
 *  http://www.w3.org/TR/wai-aria-practices/#trap_focus
 *
 * 2010-11-10 yiminghe@gmail.com
 *  重构，使用扩展类
 */



