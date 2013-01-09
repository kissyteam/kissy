/**
 * @ignore
 * delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/delegate-children", function (S, Event) {

    var UA = S.UA,
        ie = S.Env.host.document.documentMode || UA.ie,
        Features = S.Features,
        Gesture = Event.Gesture,
        isTouchSupported = Features.isTouchSupported();

    function DelegateChildren() {
    }

    function handleChildMouseEvents(e) {
        if (!this.get("disabled")) {
            var control = this.getOwnerControl(e.target, e);
            if (control && !control.get("disabled")) {
                // Child control identified; forward the event.
                switch (e.type) {
                    case Gesture.start:
                        control.handleMouseDown(e);
                        break;
                    case Gesture.end:
                        control.handleMouseUp(e);
                        break;
                    case Gesture.tap:
                        control.performActionInternal(e);
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
            var self = this,
                events;
            if (self.get("delegateChildren")) {

                events = Gesture.start + " " + Gesture.end + " " + Gesture.tap + " ";

                if (!isTouchSupported) {
                    events += "mouseover mouseout contextmenu " +
                        (ie && ie < 9 ? "dblclick " : "");
                }

                self.get("el").on(events, handleChildMouseEvents, self);
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
    requires: ['event']
});