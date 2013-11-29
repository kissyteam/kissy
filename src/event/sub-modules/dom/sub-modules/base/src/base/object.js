/**
 * @ignore
 * event object for dom
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var BaseEvent = require('event/base');

    var DOCUMENT = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        commonProps = [
            'altKey', 'bubbles', 'cancelable',
            'ctrlKey', 'currentTarget', 'eventPhase',
            'metaKey', 'shiftKey', 'target',
            'timeStamp', 'view', 'type'
        ],
        eventNormalizers = [
            {
                reg: /^key/,
                props: ['char', 'charCode', 'key', 'keyCode', 'which'],
                fix: function (event, originalEvent) {
                    if (event.which == null) {
                        event.which = originalEvent.charCode != null ? originalEvent.charCode : originalEvent.keyCode;
                    }

                    // add metaKey to non-Mac browsers (use ctrl for PC 's and Meta for Macs)
                    if (event.metaKey === undefined) {
                        event.metaKey = event.ctrlKey;
                    }
                }
            },
            {
                reg: /^touch/,
                props: ['touches', 'changedTouches', 'targetTouches']
            },
            {
                reg: /^gesturechange$/i,
                props: ['rotation', 'scale']
            },
            {
                reg: /^(mousewheel|DOMMouseScroll)$/,
                props: [],
                fix: function (event, originalEvent) {
                    var deltaX,
                        deltaY,
                        delta,
                        wheelDelta = originalEvent.wheelDelta,
                        axis = originalEvent.axis,
                        wheelDeltaY = originalEvent.wheelDeltaY,
                        wheelDeltaX = originalEvent.wheelDeltaX,
                        detail = originalEvent.detail;

                    // ie/webkit
                    if (wheelDelta) {
                        delta = wheelDelta / 120;
                    }

                    // gecko
                    if (detail) {
                        // press control e.detail == 1 else e.detail == 3
                        delta = -(detail % 3 === 0 ? detail / 3 : detail);
                    }

                    // Gecko
                    if (axis !== undefined) {
                        if (axis === event.HORIZONTAL_AXIS) {
                            deltaY = 0;
                            deltaX = -1 * delta;
                        } else if (axis === event.VERTICAL_AXIS) {
                            deltaX = 0;
                            deltaY = delta;
                        }
                    }

                    // Webkit
                    if (wheelDeltaY !== undefined) {
                        deltaY = wheelDeltaY / 120;
                    }
                    if (wheelDeltaX !== undefined) {
                        deltaX = -1 * wheelDeltaX / 120;
                    }

                    // 默认 deltaY (ie)
                    if (!deltaX && !deltaY) {
                        deltaY = delta;
                    }

                    if (deltaX !== undefined) {
                        /**
                         * deltaX of mousewheel event
                         * @property deltaX
                         * @member KISSY.Event.DomEvent.Object
                         */
                        event.deltaX = deltaX;
                    }

                    if (deltaY !== undefined) {
                        /**
                         * deltaY of mousewheel event
                         * @property deltaY
                         * @member KISSY.Event.DomEvent.Object
                         */
                        event.deltaY = deltaY;
                    }

                    if (delta !== undefined) {
                        /**
                         * delta of mousewheel event
                         * @property delta
                         * @member KISSY.Event.DomEvent.Object
                         */
                        event.delta = delta;
                    }
                }
            },
            {
                reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i,
                props: [
                    'buttons', 'clientX', 'clientY', 'button',
                    'offsetX', 'relatedTarget', 'which',
                    'fromElement', 'toElement', 'offsetY',
                    'pageX', 'pageY', 'screenX', 'screenY'
                ],
                fix: function (event, originalEvent) {
                    var eventDoc, doc, body,
                        target = event.target,
                        button = originalEvent.button;

                    // Calculate pageX/Y if missing and clientX/Y available
                    if (event.pageX == null && originalEvent.clientX != null) {
                        eventDoc = target.ownerDocument || DOCUMENT;
                        doc = eventDoc.documentElement;
                        body = eventDoc.body;
                        event.pageX = originalEvent.clientX +
                            ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                            ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                        event.pageY = originalEvent.clientY +
                            ( doc && doc.scrollTop || body && body.scrollTop || 0 ) -
                            ( doc && doc.clientTop || body && body.clientTop || 0 );
                    }

                    // which for click: 1 === left; 2 === middle; 3 === right
                    // do not use button
                    if (!event.which && button !== undefined) {
                        event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
                    }

                    // add relatedTarget, if necessary
                    if (!event.relatedTarget && event.fromElement) {
                        event.relatedTarget = (event.fromElement === target) ? event.toElement : event.fromElement;
                    }

                    return event;
                }
            }
        ];

    function retTrue() {
        return TRUE;
    }

    function retFalse() {
        return FALSE;
    }

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
     * @class KISSY.Event.DomEvent.Object
     * @extends KISSY.Event.Object
     * @private
     * @param originalEvent native dom event
     */
    function DomEventObject(originalEvent) {
        var self = this,
            type = originalEvent.type;

        /**
         * altKey
         * @property altKey
         */

        /**
         * attrChange
         * @property attrChange
         */

        /**
         * attrName
         * @property attrName
         */

        /**
         * bubbles
         * @property bubbles
         */

        /**
         * button
         * @property button
         */

        /**
         * cancelable
         * @property cancelable
         */

        /**
         * charCode
         * @property charCode
         */

        /**
         * clientX
         * @property clientX
         */

        /**
         * clientY
         * @property clientY
         */

        /**
         * ctrlKey
         * @property ctrlKey
         */

        /**
         * data
         * @property data
         */

        /**
         * detail
         * @property detail
         */

        /**
         * eventPhase
         * @property eventPhase
         */

        /**
         * fromElement
         * @property fromElement
         */

        /**
         * handler
         * @property handler
         */

        /**
         * keyCode
         * @property keyCode
         */

        /**
         * metaKey
         * @property metaKey
         */

        /**
         * newValue
         * @property newValue
         */

        /**
         * offsetX
         * @property offsetX
         */

        /**
         * offsetY
         * @property offsetY
         */

        /**
         * pageX
         * @property pageX
         */

        /**
         * pageY
         * @property pageY
         */

        /**
         * prevValue
         * @property prevValue
         */

        /**
         * relatedNode
         * @property relatedNode
         */

        /**
         * relatedTarget
         * @property relatedTarget
         */

        /**
         * screenX
         * @property screenX
         */

        /**
         * screenY
         * @property screenY
         */

        /**
         * shiftKey
         * @property shiftKey
         */

        /**
         * srcElement
         * @property srcElement
         */

        /**
         * toElement
         * @property toElement
         */

        /**
         * view
         * @property view
         */

        /**
         * wheelDelta
         * @property wheelDelta
         */

        /**
         * which
         * @property which
         */

        /**
         * changedTouches
         * @property changedTouches
         */

        /**
         * touches
         * @property touches
         */

        /**
         * targetTouches
         * @property targetTouches
         */

        /**
         * rotation
         * @property rotation
         */

        /**
         * scale
         * @property scale
         */

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

        DomEventObject.superclass.constructor.call(self);

        self.originalEvent = originalEvent;

        // in case dom event has been mark as default prevented by lower dom node
        var isDefaultPrevented = retFalse;
        if ('defaultPrevented' in originalEvent) {
            isDefaultPrevented = originalEvent.defaultPrevented ? retTrue : retFalse;
        } else if ('getPreventDefault' in originalEvent) {
            // https://bugzilla.mozilla.org/show_bug.cgi?id=691151
            isDefaultPrevented = originalEvent.getPreventDefault() ? retTrue : retFalse;
        } else if ('returnValue' in originalEvent) {
            isDefaultPrevented = originalEvent.returnValue === FALSE ? retTrue : retFalse;
        }

        self.isDefaultPrevented = isDefaultPrevented;

        var fixFns = [],
            fixFn,
            l,
            prop,
            props = commonProps.concat();

        S.each(eventNormalizers, function (normalizer) {
            if (type.match(normalizer.reg)) {
                props = props.concat(normalizer.props);
                if (normalizer.fix){
                    fixFns.push(normalizer.fix);
                }
            }
            return undefined;
        });

        l = props.length;

        // clone properties of the original event object
        while (l) {
            prop = props[--l];
            self[prop] = originalEvent[prop];
        }

        // fix target property, if necessary
        if (!self.target) {
            self.target = originalEvent.srcElement || DOCUMENT; // srcElement might not be defined either
        }

        // check if target is a text node (safari)
        if (self.target.nodeType === 3) {
            self.target = self.target.parentNode;
        }

        l = fixFns.length;

        while (l) {
            fixFn = fixFns[--l];
            fixFn(self, originalEvent);
        }
    }

    S.extend(DomEventObject, BaseEvent.Object, {

        constructor: DomEventObject,

        preventDefault: function () {
            var self = this,
                e = self.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to FALSE (IE)
            else {
                e.returnValue = FALSE;
            }

            DomEventObject.superclass.preventDefault.call(self);
        },

        stopPropagation: function () {
            var self = this,
                e = self.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to TRUE (IE)
            else {
                e.cancelBubble = TRUE;
            }

            DomEventObject.superclass.stopPropagation.call(self);
        }
    });

    return DomEventObject;
});

/*
 2012-10-30
 - consider touch properties

 2012-10-24
 - merge with mousewheel: not perfect in osx : accelerated scroll

 2010.04
 - http://www.w3.org/TR/2003/WD-Dom-Level-3-Events-20030331/ecma-script-binding.html

 - refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/Dom-Level-3-Events/#events-mousewheelevents
 */