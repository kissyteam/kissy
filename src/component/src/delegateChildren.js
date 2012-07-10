/**
 * @fileOverview delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/delegateChildren", function (S) {

    function DelegateChildren() {
    }

    function handleChildMouseEvents(e) {
        var control = this.getOwnerControl(e.target, e);
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
                case "contextmenu":
                    control.handleContextMenu(e);
                    break;
                case "dblclick":
                    control.handleDblClick(e);
                    break;
                default:
                    S.error(e.type + " unhandled!");
            }
        }
    }

    S.augment(DelegateChildren, {

        __bindUI:function () {
            var self = this;
            self.get("el").on("mousedown mouseup mouseover mouseout dblclick contextmenu",
                handleChildMouseEvents, self);
        },

        getOwnerControl:function (target) {
            var self = this,
                children = self.get("children"),
                len = children.length,
                elem = self.get("el")[0];
            while (target && target !== elem) {
                for (var i = 0; i < len; i++) {
                    if (children[i].get("el")[0] === target) {
                        return children[i];
                    }
                }
                target = target.parentNode;
            }
            return null;
        }
    });

    return DelegateChildren;
});