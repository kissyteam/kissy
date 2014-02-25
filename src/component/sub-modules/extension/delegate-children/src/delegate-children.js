/**
 * @ignore
 * delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node'),
        Manager = require('component/manager');
    var UA = S.UA,
        ie = UA.ieMode,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    function onRenderChild(e) {
        if (e.target === this) {
            var child = e.component,
                el = child.$el;
            el.addClass(this.__childClsTag);
        }
    }

    function onRemoveChild(e) {
        if (e.target === this) {
            var child = e.component,
                el = child.$el;
            if (el) {
                el.removeClass(this.__childClsTag);
            }
        }
    }

    /**
     * delegate events for component's children. for mixin.
     * @class KISSY.Component.Extension.DelegateChildren
     */
    function DelegateChildren() {
        var self = this;
        self.__childClsTag = S.guid('ks-component-child');
        self.on('afterRenderChild', onRenderChild, self)
            .on('afterRemoveChild', onRemoveChild, self);
    }

    S.augment(DelegateChildren, {
        handleChildrenEvents: function (e) {
            if (!this.get('disabled')) {
                var control = this.getOwnerControl(e);
                if (control && !control.get('disabled')) {
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
                        case 'mouseenter':
                            control.handleMouseEnter(e);
                            break;
                        case 'mouseleave':
                            control.handleMouseLeave(e);
                            break;
                        case 'contextmenu':
                            control.handleContextMenu(e);
                            break;
                        case 'dblclick':
                            control.handleDblClick(e);
                            break;
                        default:
                            S.error(e.type + ' unhandled!');
                    }
                }
            }
        },

        __bindUI: function () {
            var self = this,
                events = Gesture.start +
                    ' ' + Gesture.end +
                    ' ' + Gesture.tap;

            if (Gesture.cancel) {
                events += ' ' + Gesture.cancel;
            }

            events += ' mouseenter mouseleave contextmenu ' +
                (ie && ie < 9 ? 'dblclick ' : '');

            self.$el.delegate(events, '.' + self.__childClsTag,
                self.handleChildrenEvents, self);
        },

        /**
         * Get child component which contains current event target node.
         * @protected
         * @param {KISSY.Event.DomEvent.Object} e event
         * @return {KISSY.Component.Control}
         */
        getOwnerControl: function (e) {
            return Manager.getComponent(e.currentTarget.id);
        }
    });

    return DelegateChildren;
});