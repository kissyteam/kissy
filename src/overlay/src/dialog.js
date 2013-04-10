/**
 * @ignore
 * KISSY.Dialog
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/dialog', function (S, Overlay, DialogRender, Node, StdMod, DialogEffect) {

    /**
     * @class KISSY.Overlay.Dialog
     * KISSY Dialog Component. xclass: 'dialog'.
     * @extends KISSY.Overlay
     * @mixins KISSY.Overlay.Extension.StdMod
     */
    var Dialog = Overlay.extend([
        StdMod,
        DialogEffect
    ], {
            handleKeyEventInternal: function (e) {
                if (this.get('escapeToClose') &&
                    e.keyCode === Node.KeyCodes.ESC) {
                    if (e.target.nodeName.toLowerCase() == 'select' && !e.target.disabled) {
                        // escape at select
                    } else {
                        this.close();
                        e.halt();
                    }
                    return;
                }
                trapFocus.call(this, e);
            },

            _onSetVisible: function (v) {
                var self = this,
                    el = self.get('el');
                if (v) {
                    self.__lastActive = el[0].ownerDocument.activeElement;
                    self.set('focused', true);
                    // if d.show(); d.hide();
                    // async -> focus event -> handleFocus
                    // -> set('focused') -> el.focus() -> ie error
                    // el[0].focus && el[0].focus();
                    el.attr("aria-hidden", "false");
                } else {
                    el.attr("aria-hidden", "true");
                    try {
                        self.__lastActive && self.__lastActive.focus();
                    } catch (e) {
                        // ie can not be focused if lastActive is invisible
                    }
                }
                // prevent display none for effect
                Dialog.superclass._onSetVisible.apply(self, arguments);
            }
        },

        {
            ATTRS: {

                /**
                 * whether this component can be closed.
                 *
                 * Defaults to: true
                 *
                 * @cfg {Boolean} closable
                 * @protected
                 */
                /**
                 * @ignore
                 */
                closable: {
                    value: true
                },

                xrender: {
                    value: DialogRender
                },

                /**
                 * whether this component can be focused.
                 *
                 * Defaults to: true
                 *
                 * @cfg {Boolean} focusable
                 * @protected
                 */
                /**
                 * @ignore
                 */
                focusable: {
                    value: true
                },


                /**
                 * whether this component can be closed by press escape key.
                 *
                 * Defaults to: true
                 *
                 * @cfg {Boolean} escapeToClose
                 * @since 1.3.0
                 */
                /**
                 * @ignore
                 */
                escapeToClose: {
                    value: true
                }
            }
        }, {
            xclass: 'dialog',
            priority: 20
        });


    var KEY_TAB = Node.KeyCodes.TAB;

    // 不完美的方案，窗体末尾空白 tab 占位符，多了 tab 操作一次
    function trapFocus(e) {

        var self = this,
            keyCode = e.keyCode;

        if (keyCode != KEY_TAB) {
            return;
        }
        var el = self.get("el");
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = Node.all(e.target); // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state

        var lastFocusItem = el.last();

        // assumes el and lastFocusItem maintained by dialog object

        // see if we are shift-tabbing from first focusable item on dialog
        if (node.equals(el) && e.shiftKey) {
            lastFocusItem[0].focus(); // send focus to last item in dialog
            e.halt(); //stop the tab keypress event
        }
        // see if we are tabbing from the last focusable item
        else if (node.equals(lastFocusItem) && !e.shiftKey) {
            self.focus(); // send focus to first item in dialog
            e.halt(); //stop the tab keypress event
        }
        else {
            // see if the key is for the dialog
            if (node.equals(el) || el.contains(node)) {
                return;
            }
        }
        // this key is for the document window
        // allow tabbing into the dialog
        e.halt();//stop the event if not a tab keypress
    } // end of function
    return Dialog;

}, {
    requires: [
        "./base",
        './dialog-render',
        'node',
        './extension/stdmod',
        './extension/dialog-effect'
    ]
});

/**
 * @ignore
 *
 * 2012-09-06 yiminghe@gmail.com
 *  merge aria with dialog
 *  http://www.w3.org/TR/wai-aria-practices/#trap_focus
 *
 * 2010-11-10 yiminghe@gmail.com
 *  重构，使用扩展类
 */