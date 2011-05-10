/**
 * http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author:yiminghe@gmail.com
 */
KISSY.add("overlay/ariarender", function(S) {


    function Aria() {

    }

//    Aria.ATTRS={
//      aria:{
//          value:false
//      }
//    };


    function name(n) {
        return n[0].nodeName.toLowerCase();
    }

    function getFocusItems(el) {
        var els = el.all("*");
        var re = [];

        for (var ei = 0; ei < els.length; ei++) {
            var n = S.one(els[ei]);
            var reserved = false;
            if (-1 == n[0].tabIndex) {
                continue;
            }
            if (name(n) == "a") {
                reserved = true;
            } else if (name(n) == 'input' && ! n[0].disabled) {
                reserved = true;
            } else
            // 其他元素必须设 0
            if (n.hasAttr("tabindex") && n[0].tabIndex == 0) {
                reserved = true;
            }
            if (reserved) {
                var nIndex = n[0].tabIndex || 0;

                for (var i = 0; i < re.length; i++) {
                    var r = re[i],rIndex = r[0].tabIndex || 0;
                    if (rIndex > nIndex) {
                        //大的在后面
                        re.splice(i, 0, n);
                        break;
                    }
                }

                if (i == re.length) {
                    re.push(n);
                }
            }
        }

        return re;
    }

    var KEY_TAB = 9;

    function _onKey(/*Normalized Event*/ evt) {


        var self = this,
            keyCode = evt.keyCode,
            dialogContainerNode = self.get("el");
        if (keyCode != KEY_TAB) return;
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = evt.target; // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state
        var focusItemsArray = getFocusItems(dialogContainerNode);
        var firstFocusItem = focusItemsArray[0];
        var lastFocusItem = focusItemsArray[focusItemsArray.length - 1];

        // assumes firstFocusItem and lastFocusItem maintained by dialog object
        var singleFocusItem = (firstFocusItem == lastFocusItem);

        // see if we are shift-tabbing from first focusable item on dialog
        if (node[0] == firstFocusItem[0] && evt.shiftKey) {
            if (!singleFocusItem) {
                lastFocusItem[0].focus(); // send focus to last item in dialog
            }
            evt.halt(); //stop the tab keypress event
        }
        // see if we are tabbing from the last focusable item
        else if (node[0] == lastFocusItem[0] && !evt.shiftKey) {
            if (!singleFocusItem) {
                firstFocusItem[0].focus(); // send focus to first item in dialog
            }
            evt.halt(); //stop the tab keypress event
        }
        else {
            // see if the key is for the dialog
            if (node[0] == dialogContainerNode[0] ||
                dialogContainerNode.contains(node)) {
                return;
            }
        }
        // this key is for the document window
        // allow tabbing into the dialog
        evt.halt();//stop the event if not a tab keypress
    } // end of function


    Aria.prototype = {

        __renderUI:function() {
            var self = this,el = self.get("el"),header = self.get("header");
            if (self.get("aria")) {
                el.attr("role", "dialog");
                el.attr("tabindex", 0);
                if (!header.attr("id")) {
                    header.attr("id", S.guid("ks-dialog-header"));
                }
                el.attr("aria-labelledby", header.attr("id"));
            }
        },

        __bindUI:function() {

            var self = this;
            if (self.get("aria")) {
                var el = self.get("el"),lastActive;
                self.on("afterVisibleChange", function(ev) {
                    if (ev.newVal) {
                        lastActive = document.activeElement;
                        el[0].focus();
                        el.on("keydown", _onKey, self);
                    } else {
                        el.detach("keydown", _onKey, self);
                        lastActive && lastActive.focus();
                    }
                });
            }
        }
    };

    return Aria;
});