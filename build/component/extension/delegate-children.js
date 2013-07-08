﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 14:39
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/extension/delegate-children
*/

/**
 * @ignore
 * delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/delegate-children", function (S, Node, Manager) {

    var UA = S.UA,
        ie = S.Env.host.document.documentMode || UA.ie,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    function onRenderChild(e) {
        if (e.target == this) {
            var child = e.component,
                el = child.$el;
            el.addClass(this.__childClsTag);
        }
    }

    function onRemoveChild(e) {
        if (e.target == this) {
            var child = e.component,
                el = child.$el;
            if (el) {
                el.removeClass(this.__childClsTag);
            }
        }
    }

    function DelegateChildren() {
        var self = this;
        self.__childClsTag = S.guid('ks-component-child');
        self.on('afterRenderChild', onRenderChild, self)
            .on('afterRemoveChild', onRemoveChild, self);

    }

    S.augment(DelegateChildren, {

        handleChildrenEvents: function (e) {
            if (!this.get("disabled")) {
                var control = this.getOwnerControl(e);
                if (control && !control.get("disabled")) {
                    e.stopPropagation();
                    // Child control identified; forward the event.
                    switch (e.type) {
                        case Gesture.start:
                            control.handleMouseDown(e);
                            break;
                        case Gesture.end:
                            control.handleMouseUp(e);
                            break;
                        case Gesture.tap:
                            control.handleClick(e);
                            break;
                        case "mouseenter":
                            control.handleMouseEnter(e);
                            break;
                        case "mouseleave":
                            control.handleMouseLeave(e);
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
        },

        __bindUI: function () {
            var self = this,
                events = Gesture.start +
                    " " + Gesture.end +
                    " " + Gesture.tap;

            if (Gesture.cancel) {
                events += ' ' + Gesture.cancel;
            }

            if (!isTouchEventSupported) {
                events += " mouseenter mouseleave contextmenu " +
                    (ie && ie < 9 ? "dblclick " : "");
            }

            self.$el.delegate(events, '.' + self.__childClsTag,
                self.handleChildrenEvents, self);
        },

        /**
         * Get child component which contains current event target node.
         * @protected
         * @param {KISSY.Event.DOMEventObject} e event
         * @return {KISSY.Component.Control}
         */
        getOwnerControl: function (e) {
            return Manager.getComponent(e.currentTarget.id);
        }
    });

    return DelegateChildren;
}, {
    requires: ['node', 'component/manager']
});

