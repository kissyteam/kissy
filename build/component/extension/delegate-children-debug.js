/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 14:58
*/
/*
combined modules:
component/extension/delegate-children
*/
/**
 * @ignore
 * delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add('component/extension/delegate-children', [
    'component/manager',
    'event/gesture/base',
    'event/gesture/tap'
], function (S, require) {
    var Manager = require('component/manager');
    var BaseGesture = require('event/gesture/base');
    var TapGesture = require('event/gesture/tap');
    function onRenderChild(e) {
        if (e.target === this) {
            var child = e.component, el = child.$el;
            el.addClass(this.__childClsTag);
        }
    }
    function onRemoveChild(e) {
        if (e.target === this) {
            var child = e.component, el = child.$el;
            if (el) {
                el.removeClass(this.__childClsTag);
            }
        }
    }    /**
     * delegate events for component's children. for mixin.
     * @class KISSY.Component.Extension.DelegateChildren
     */
    /**
     * delegate events for component's children. for mixin.
     * @class KISSY.Component.Extension.DelegateChildren
     */
    function DelegateChildren() {
        var self = this;
        self.__childClsTag = S.guid('ks-component-child');
        self.on('afterRenderChild', onRenderChild, self).on('afterRemoveChild', onRemoveChild, self);
    }
    S.augment(DelegateChildren, {
        handleChildrenEvents: function (e) {
            if (!this.get('disabled')) {
                var control = this.getOwnerControl(e);
                if (control && !control.get('disabled')) {
                    // e.stopPropagation();
                    // Child control identified; forward the event.
                    switch (e.type) {
                    case BaseGesture.START:
                        control.handleMouseDown(e);
                        break;
                    case BaseGesture.END:
                        control.handleMouseUp(e);
                        break;
                    case TapGesture.TAP:
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
                    default:
                        S.error(e.type + ' unhandled!');
                    }
                }
            }
        },
        __bindUI: function () {
            var self = this, events = BaseGesture.START + ' ' + BaseGesture.END + ' ' + TapGesture.TAP;
            events += ' mouseenter mouseleave contextmenu';
            self.$el.delegate(events, '.' + self.__childClsTag, self.handleChildrenEvents, self);
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


