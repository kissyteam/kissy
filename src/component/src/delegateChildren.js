/**
 * @fileOverview delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/delegateChildren", function (S) {

    function DelegateChildren() {

    }

    S.augment(DelegateChildren, {
        __bindUI:function () {
            var self = this;
            self.get("el").on("mousedown mouseup mouseover mouseout dblclick",
                self._handleChildMouseEvents, self);
        },

        _handleChildMouseEvents:function (e) {
            var control = this.getOwnerControl(e.target);
            if (control) {
                // Child control identified; forward the event.
                switch (e.type) {
                    case "mousedown":
                        control.handleMouseDown(e);
                        break;
                    case "mouseup":
                        control.handleMouseUp(e);
                        break;
                    case "mouseover":
                        control.handleMouseOver(e);
                        break;
                    case "mouseout":
                        control.handleMouseOut(e);
                        break;
                    case "dblclick":
                        control.handleDblClick(e);
                        break;
                    default:
                        S.error(e.type + " unhandled!");
                }
            }
        },

        getOwnerControl:function (node) {
            var self = this,
                children = self.get("children"),
                len = children.length,
                elem = this.get("el")[0];
            while (node && node !== elem) {
                for (var i = 0; i < len; i++) {
                    if (children[i].get("el")[0] === node) {
                        return children[i];
                    }
                }
                node = node.parentNode;
            }
            return null;
        }
    });

    return DelegateChildren;
});