/**
 * @ignore
 * event object for dom
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/object', function (S, Event, undefined) {

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
                reg: /^mousewheel$/,
                fix: function (event, originalEvent) {
                    var deltaX,
                        deltaY,
                        delta,
                        wheelDelta = originalEvent.wheelDelta,
                        axis = originalEvent.axis,
                        wheelDeltaY = originalEvent['wheelDeltaY'],
                        wheelDeltaX = originalEvent['wheelDeltaX'],
                        detail = originalEvent.detail;

                    // ie/webkit
                    if (wheelDelta) {
                        delta = wheelDelta / 120;
                    }

                    // gecko
                    if (detail) {
                        // press control e.detail == 1 else e.detail == 3
                        delta = -(detail % 3 == 0 ? detail / 3 : detail);
                    }

                    // Gecko
                    if (axis !== undefined) {
                        if (axis === e['HORIZONTAL_AXIS']) {
                            deltaY = 0;
                            deltaX = -1 * delta;
                        } else if (axis === e['VERTICAL_AXIS']) {
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
                         */
                        event.deltaX = deltaX;
                    }

                    if (deltaY !== undefined) {
                        /**
                         * deltaY of mousewheel event
                         * @property deltaY
                         */
                        event.deltaY = deltaY;
                    }

                    if (delta !== undefined) {
                        /**
                         * delta of mousewheel event
                         * @property delta
                         */
                        event.delta = delta;
                    }
                }
            },
            {
                reg: /^(?:mouse|contextmenu)|click/,
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
     * @class KISSY.Event.DOMEventObject
     * @extends KISSY.Event.Object
     * @param originalEvent native dom event
     */
    function DOMEventObject(originalEvent) {
        var self = this,
            type = originalEvent.type;

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

            /**
             * source html node of current event
             * @property target
             * @type {HTMLElement}
             */
            self.target = null;

            /**
             * current htm node which processes current event
             * @property currentTarget
             * @type {HTMLElement}
             */
            self.currentTarget = null;
        }

        DOMEventObject.superclass.constructor.call(self);

        self.originalEvent = originalEvent;

        // in case dom event has been mark as default prevented by lower dom node
        self.isDefaultPrevented = (
            originalEvent['defaultPrevented'] || originalEvent.returnValue === FALSE ||
                originalEvent['getPreventDefault'] && originalEvent['getPreventDefault']()
            ) ? retTrue : retFalse;

        var fixFn = null,
            l,
            prop,
            props = commonProps.concat();

        S.each(eventNormalizers, function (normalizer) {
            if (type.match(normalizer.reg)) {
                props = props.concat(normalizer.props);
                fixFn = normalizer.fix;
            }
        });

        l = props.length;

        // clone properties of the original event object
        while (l) {
            prop = props[--l];
            self[prop] = originalEvent[prop];
        }

        // fix target property, if necessary
        if (!self.target) {
            self.target = self.srcElement || DOCUMENT; // srcElement might not be defined either
        }

        // check if target is a text node (safari)
        if (self.target.nodeType === 3) {
            self.target = self.target.parentNode;
        }

        if (fixFn) {
            fixFn(self, originalEvent);
        }

    }

    S.extend(DOMEventObject, Event._Object, {

        constructor: DOMEventObject,

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

            DOMEventObject.superclass.preventDefault.call(self);
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

            DOMEventObject.superclass.stopPropagation.call(self);
        }
    });

    Event.DOMEventObject = DOMEventObject;

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