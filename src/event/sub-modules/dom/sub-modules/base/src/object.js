/**
 * @ignore
 *  event object for dom
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/object', function (S, Event, undefined) {

    var doc = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        props = ('type altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis ' +
            'changedTouches touches targetTouches rotation scale').split(' ');

    /**
     * Do not new by yourself.
     *
     * KISSY 's dom event system normalizes the event object according to
     * W3C standards.
     *
     * The event object is guaranteed to be passed to
     * the event handler.
     *
     * Most properties from the original event are
     * copied over and normalized to the new event object
     * according to [W3C standards](http://www.w3.org/TR/dom/#event).
     *
     * @class KISSY.Event.DOMEventObject
     * @extends KISSY.Event.Object
     * @param domEvent native dom event
     */
    function DOMEventObject(domEvent) {
        var self = this;

        if ('@DEBUG@') {
            /**
             * altKey
             * @property altKey
             */
            self.altKey = undefined;
            /**
             * attrChange
             * @property attrChange
             */
            self.attrChange = undefined;
            /**
             * attrName
             * @property attrName
             */
            self.attrName = undefined;
            /**
             * bubbles
             * @property bubbles
             */
            self.bubbles = undefined;
            /**
             * button
             * @property button
             */
            self.button = undefined;
            /**
             * cancelable
             * @property cancelable
             */
            self.cancelable = undefined;
            /**
             * charCode
             * @property charCode
             */
            self.charCode = undefined;
            /**
             * clientX
             * @property clientX
             */
            self.clientX = undefined;
            /**
             * clientY
             * @property clientY
             */
            self.clientY = undefined;
            /**
             * ctrlKey
             * @property ctrlKey
             */
            self.ctrlKey = undefined;
            /**
             * data
             * @property data
             */
            self.data = undefined;
            /**
             * detail
             * @property detail
             */
            self.detail = undefined;
            /**
             * eventPhase
             * @property eventPhase
             */
            self.eventPhase = undefined;
            /**
             * fromElement
             * @property fromElement
             */
            self.fromElement = undefined;
            /**
             * handler
             * @property handler
             */
            self.handler = undefined;
            /**
             * keyCode
             * @property keyCode
             */
            self.keyCode = undefined;
            /**
             * metaKey
             * @property metaKey
             */
            self.metaKey = undefined;
            /**
             * newValue
             * @property newValue
             */
            self.newValue = undefined;
            /**
             * offsetX
             * @property offsetX
             */
            self.offsetX = undefined;
            /**
             * offsetY
             * @property offsetY
             */
            self.offsetY = undefined;
            /**
             * pageX
             * @property pageX
             */
            self.pageX = undefined;
            /**
             * pageY
             * @property pageY
             */
            self.pageY = undefined;
            /**
             * prevValue
             * @property prevValue
             */
            self.prevValue = undefined;
            /**
             * relatedNode
             * @property relatedNode
             */
            self.relatedNode = undefined;
            /**
             * relatedTarget
             * @property relatedTarget
             */
            self.relatedTarget = undefined;
            /**
             * screenX
             * @property screenX
             */
            self.screenX = undefined;
            /**
             * screenY
             * @property screenY
             */
            self.screenY = undefined;
            /**
             * shiftKey
             * @property shiftKey
             */
            self.shiftKey = undefined;
            /**
             * srcElement
             * @property srcElement
             */
            self.srcElement = undefined;

            /**
             * toElement
             * @property toElement
             */
            self.toElement = undefined;
            /**
             * view
             * @property view
             */
            self.view = undefined;
            /**
             * wheelDelta
             * @property wheelDelta
             */
            self.wheelDelta = undefined;
            /**
             * which
             * @property which
             */
            self.which = undefined;
            /**
             * changedTouches
             * @property changedTouches
             */
            self.changedTouches = undefined;
            /**
             * touches
             * @property touches
             */
            self.touches = undefined;
            /**
             * targetTouches
             * @property targetTouches
             */
            self.targetTouches = undefined;
            /**
             * rotation
             * @property rotation
             */
            self.rotation = undefined;
            /**
             * scale
             * @property scale
             */
            self.scale = undefined;
        }

        DOMEventObject.superclass.constructor.call(self);
        self.originalEvent = domEvent;
        // in case dom event has been mark as default prevented by lower dom node
        self.isDefaultPrevented = ( domEvent['defaultPrevented'] || domEvent.returnValue === FALSE ||
            domEvent['getPreventDefault'] && domEvent['getPreventDefault']() ) ? function () {
            return TRUE;
        } : function () {
            return FALSE;
        };
        fix(self);
        fixMouseWheel(self);
        /**
         * source html node of current event
         * @property target
         * @type {HTMLElement}
         */
        /**
         * current htm node which processes current event
         * @property currentTarget
         * @type {HTMLElement}
         */
    }

    function fix(self) {
        var originalEvent = self.originalEvent,
            l = props.length,
            prop,
            ct = originalEvent.currentTarget,
            ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe

        // clone properties of the original event object
        while (l) {
            prop = props[--l];
            self[prop] = originalEvent[prop];
        }

        // fix target property, if necessary
        if (!self.target) {
            self.target = self.srcElement || ownerDoc; // srcElement might not be defined either
        }

        // check if target is a text node (safari)
        if (self.target.nodeType === 3) {
            self.target = self.target.parentNode;
        }

        // add relatedTarget, if necessary
        if (!self.relatedTarget && self.fromElement) {
            self.relatedTarget = (self.fromElement === self.target) ? self.toElement : self.fromElement;
        }

        // calculate pageX/Y if missing and clientX/Y available
        if (self.pageX === undefined && self.clientX !== undefined) {
            var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
            self.pageX = self.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
            self.pageY = self.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
        }

        // add which for key events
        if (self.which === undefined) {
            self.which = (self.charCode === undefined) ? self.keyCode : self.charCode;
        }

        // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
        if (self.metaKey === undefined) {
            self.metaKey = self.ctrlKey;
        }

        // add which for click: 1 === left; 2 === middle; 3 === right
        // Note: button is not normalized, so don't use it
        if (!self.which && self.button !== undefined) {
            self.which = (self.button & 1 ? 1 : (self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0)));
        }
    }

    function fixMouseWheel(e) {
        var deltaX,
            deltaY,
            delta,
            detail = e.detail;

        // ie/webkit
        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }

        // gecko
        if (e.detail) {
            // press control e.detail == 1 else e.detail == 3
            delta = -(detail % 3 == 0 ? detail / 3 : detail);
        }

        // Gecko
        if (e.axis !== undefined) {
            if (e.axis === e['HORIZONTAL_AXIS']) {
                deltaY = 0;
                deltaX = -1 * delta;
            } else if (e.axis === e['VERTICAL_AXIS']) {
                deltaX = 0;
                deltaY = delta;
            }
        }

        // Webkit
        if (e['wheelDeltaY'] !== undefined) {
            deltaY = e['wheelDeltaY'] / 120;
        }
        if (e['wheelDeltaX'] !== undefined) {
            deltaX = -1 * e['wheelDeltaX'] / 120;
        }

        // 默认 deltaY (ie)
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        if (deltaX !== undefined ||
            deltaY !== undefined ||
            delta !== undefined) {
            S.mix(e, {
                /**
                 * deltaY of mousewheel event
                 * @property deltaY
                 */
                deltaY: deltaY,
                /**
                 * delta of mousewheel event
                 * @property delta
                 */
                delta: delta,
                /**
                 * deltaX of mousewheel event
                 * @property deltaX
                 */
                deltaX: deltaX
            });
        }
    }

    S.extend(DOMEventObject, Event._Object, {

        constructor: DOMEventObject,

        preventDefault: function () {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to FALSE (IE)
            else {
                e.returnValue = FALSE;
            }

            DOMEventObject.superclass.preventDefault.call(this);
        },

        stopPropagation: function () {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to TRUE (IE)
            else {
                e.cancelBubble = TRUE;
            }

            DOMEventObject.superclass.stopPropagation.call(this);
        }
    });

    // compatibility
    // Event.Object = S.EventObject = DOMEventObject;

    Event.DOMEventObject=DOMEventObject;

    return DOMEventObject;

}, {
    requires: ['event/base']
});

/*
 2012-10-30
 - consider touch properties

 2012-10-24
 - merge with mousewheel: not perfect in osx : accelerated scroll

 2010.04
 - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html

 - refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 */