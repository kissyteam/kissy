/**
 * @ignore
 * @fileOverview delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/delegate-children", function (S, UA) {

    var ie = S.Env.host.document.documentMode || UA.ie;

    function DelegateChildren() {
    }

    function handleChildMouseEvents(e) {
        if (!this.get("disabled")) {
            var control = this.getOwnerControl(e.target, e);
            if (control && !control.get("disabled")) {
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
    }

    DelegateChildren.ATTRS = {
        delegateChildren: {
            value: true
        }
    };

    S.augment(DelegateChildren, {

        __bindUI: function () {
            var self = this;
            if (self.get("delegateChildren")) {
                self.get("el").on("mousedown mouseup mouseover mouseout " +
                    (ie && ie < 9 ? "dblclick " : "") +
                    "contextmenu",
                    handleChildMouseEvents, self);
            }
        },

        /**
         * Get child component which contains current event target node.
         * @protected
         * @member KISSY.Component.Container
         * @param {HTMLElement} target Current event target node.
         * @return {KISSY.Component.Controller}
         */
        getOwnerControl: function (target) {
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
}, {
    requires: ['ua']
});