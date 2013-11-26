/**
 * Synthetic DOM events for Jasmine
 * @refer https://github.com/yui/yui3/raw/master/src/event-simulate/js/event-simulate.js
 */
(function () {
    'use strict';

    // shortcuts
    var toString = Object.prototype.toString,
        isFunction = function (o) {
            return toString.call(o) === '[object Function]'
        },
        isString = function (o) {
            return toString.call(o) === '[object String]'
        },
        isBoolean = function (o) {
            return toString.call(o) === '[object Boolean]'
        },
        isObject = function (o) {
            return toString.call(o) === '[object Object]'
        },
        isNumber = function (o) {
            return toString.call(o) === '[object Number]'
        },
        doc = document,

        mix = function (r, s) {
            for (var p in s) {
                r[p] = s[p];
            }
        },

    // mouse events supported
        mouseEvents = {
            MSPointerOver: 1,
            MSPointerOut: 1,
            MSPointerDown: 1,
            MSPointerUp: 1,
            MSPointerMove: 1,
            // must lower case
            pointerover: 1,
            pointerout: 1,
            pointerdown: 1,
            pointerup: 1,
            pointermove: 1,
            click: 1,
            dblclick: 1,
            mouseover: 1,
            mouseout: 1,
            mouseenter: 1,
            mouseleave: 1,
            mousedown: 1,
            mouseup: 1,
            mousemove: 1
        },

    // key events supported
        keyEvents = {
            keydown: 1,
            keyup: 1,
            keypress: 1
        },

    // HTML events supported
        uiEvents = {
            submit: 1,
            blur: 1,
            change: 1,
            focus: 1,
            resize: 1,
            scroll: 1,
            select: 1
        },

    //touch events supported
        touchEvents = {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,
            touchcancel: 1
        },

    // events that bubble by default
        bubbleEvents = {
            scroll: 1,
            resize: 1,
            //reset: 1,
            submit: 1,
            change: 1,
            select: 1
            //error: 1,
            //abort: 1
        };

    // all key and mouse events bubble
    mix(bubbleEvents, mouseEvents);
    mix(bubbleEvents, keyEvents);
    mix(bubbleEvents, touchEvents);

    /*
     * Simulates a key event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks. Note: keydown causes Safari 2.x to
     * crash.
     * @method simulateKeyEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: keyup, keydown, and keypress.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 3 specifies that all key events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 3 specifies that all
     *      key events can be cancelled. The default
     *      is true.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false.
     * @param {int} keyCode (Optional) The code for the key that is in use.
     *      The default is 0.
     * @param {int} charCode (Optional) The Unicode code for the character
     *      associated with the key being used. The default is 0.
     */
    function simulateKeyEvent(target /*:HTMLElement*/, type /*:String*/, bubbles /*:Boolean*/, cancelable /*:Boolean*/, view /*:Window*/, ctrlKey /*:Boolean*/, altKey /*:Boolean*/, shiftKey /*:Boolean*/, metaKey /*:Boolean*/, keyCode /*:int*/, charCode /*:int*/) /*:Void*/ {
        // check target
        if (!target) {
            throw "simulateKeyEvent(): Invalid target.";
        }

        // check event type
        if (isString(type)) {
            type = type.toLowerCase();
            switch (type) {
                case "textevent": // DOM Level 3
                    type = "keypress";
                    break;
                case "keyup":
                case "keydown":
                case "keypress":
                    break;
                default:
                    throw "simulateKeyEvent(): Event type '" + type + "' not supported.";
            }
        } else {
            throw "simulateKeyEvent(): Event type must be a string.";
        }

        // setup default values
        if (!isBoolean(bubbles)) {
            bubbles = true; // all key events bubble
        }
        if (!isBoolean(cancelable)) {
            cancelable = true; // all key events can be cancelled
        }
        if (!isObject(view)) {
            view = window; // view is typically window
        }
        if (!isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (!isBoolean(altKey)) {
            altKey = false;
        }
        if (!isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (!isBoolean(metaKey)) {
            metaKey = false;
        }
        if (!isNumber(keyCode)) {
            keyCode = 0;
        }
        if (!isNumber(charCode)) {
            charCode = 0;
        }

        // try to create a key event
        var customEvent /*:KeyEvent*/ = null;

        if (isFunction(doc.createEvent)) {

            try {

                //try to create key event
                customEvent = doc.createEvent("KeyEvents");

                /*
                 * Interesting problem: Firefox implemented a non-standard
                 * version of initKeyEvent() based on DOM Level 2 specs.
                 * Key event was removed from DOM Level 2 and re-introduced
                 * in DOM Level 3 with a different interface. Firefox is the
                 * only browser with any implementation of Key Events, so for
                 * now, assume it's Firefox if the above line doesn't error.
                 */
                // @TODO: Decipher between Firefox's implementation and a correct one.
                customEvent.initKeyEvent(type, bubbles, cancelable, view, ctrlKey,
                    altKey, shiftKey, metaKey, keyCode, charCode);

            } catch (ex /*:Error*/) {

                /*
                 * If it got here, that means key events aren't officially supported.
                 * Safari/WebKit is a real problem now. WebKit 522 won't let you
                 * set keyCode, charCode, or other properties if you use a
                 * UIEvent, so we first must try to create a generic event. The
                 * fun part is that this will throw an error on Safari 2.x. The
                 * end result is that we need another try...catch statement just to
                 * deal with this mess.
                 */
                try {

                    //try to create generic event - will fail in Safari 2.x
                    customEvent = doc.createEvent("Events");

                } catch (uierror /*:Error*/) {

                    //the above failed, so create a UIEvent for Safari 2.x
                    customEvent = doc.createEvent("UIEvents");

                } finally {

                    customEvent.initEvent(type, bubbles, cancelable);

                    //initialize
                    customEvent.view = view;
                    customEvent.altKey = altKey;
                    customEvent.ctrlKey = ctrlKey;
                    customEvent.shiftKey = shiftKey;
                    customEvent.metaKey = metaKey;
                    customEvent.keyCode = keyCode;
                    customEvent.charCode = charCode;

                }

            }

            //fire the event
            target.dispatchEvent(customEvent);

        } else if (isObject(doc.createEventObject)) { //IE

            // create an IE event object
            customEvent = doc.createEventObject();

            // assign available properties
            customEvent.bubbles = bubbles;
            customEvent.cancelable = cancelable;
            customEvent.view = view;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.shiftKey = shiftKey;
            customEvent.metaKey = metaKey;

            /*
             * IE doesn't support charCode explicitly. CharCode should
             * take precedence over any keyCode value for accurate
             * representation.
             */
            customEvent.keyCode = (charCode > 0) ? charCode : keyCode;

            // fire the event
            target.fireEvent("on" + type, customEvent);

        } else {
            throw "simulateKeyEvent(): No event simulation framework present.";
        }
    }

    /*
     * Simulates a mouse event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks.
     * @method simulateMouseEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: click, dblclick, mousedown, mouseup, mouseout,
     *      mouseover, and mousemove.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      mouse events except mousemove can be cancelled. The default
     *      is true for all events except mousemove, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) The number of times the mouse button has
     *      been used. The default value is 1.
     * @param {int} screenX (Optional) The x-coordinate on the screen at which
     *      point the event occurred. The default is 0.
     * @param {int} screenY (Optional) The y-coordinate on the screen at which
     *      point the event occurred. The default is 0.
     * @param {int} clientX (Optional) The x-coordinate on the client at which
     *      point the event occurred. The default is 0.
     * @param {int} clientY (Optional) The y-coordinate on the client at which
     *      point the event occurred. The default is 0.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false.
     * @param {int} button (Optional) The button being pressed while the event
     *      is executing. The value should be 0 for the primary mouse button
     *      (typically the left button), 1 for the terciary mouse button
     *      (typically the middle button), and 2 for the secondary mouse button
     *      (typically the right button). The default is 0.
     * @param {HTMLElement} relatedTarget (Optional) For mouseout events,
     *      this is the element that the mouse has moved to. For mouseover
     *      events, this is the element that the mouse has moved from. This
     *      argument is ignored for all other events. The default is null.
     */
    function simulateMouseEvent(target /*:HTMLElement*/, type /*:String*/, bubbles /*:Boolean*/, cancelable /*:Boolean*/, view /*:Window*/, detail /*:int*/, screenX /*:int*/, screenY /*:int*/, clientX /*:int*/, clientY /*:int*/, ctrlKey /*:Boolean*/, altKey /*:Boolean*/, shiftKey /*:Boolean*/, metaKey /*:Boolean*/, button /*:int*/, relatedTarget /*:HTMLElement*/) /*:Void*/ {
        // check target
        if (!target) {
            throw "simulateMouseEvent(): Invalid target.";
        }

        // check event type
        if (isString(type)) {
            // make sure it's a supported mouse event
            if (!mouseEvents[type]) {
                throw "simulateMouseEvent(): Event type '" + type + "' not supported.";
            }
        } else {
            throw "simulateMouseEvent(): Event type must be a string.";
        }

        // setup default values
        if (!isBoolean(bubbles)) {
            bubbles = true; // all mouse events bubble
        }
        if (!isBoolean(cancelable)) {
            cancelable = (type != "mousemove"); // mousemove is the only one that can't be cancelled
        }
        if (!isObject(view)) {
            view = window; // view is typically window
        }
        if (!isNumber(detail)) {
            detail = 1;  // number of mouse clicks must be at least one
        }
        if (!isNumber(screenX)) {
            screenX = 0;
        }
        if (!isNumber(screenY)) {
            screenY = 0;
        }
        if (!isNumber(clientX)) {
            clientX = 0;
        }
        if (!isNumber(clientY)) {
            clientY = 0;
        }
        if (!isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (!isBoolean(altKey)) {
            altKey = false;
        }
        if (!isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (!isBoolean(metaKey)) {
            metaKey = false;
        }
        if (!isNumber(button)) {
            button = 0;
        }

        relatedTarget = relatedTarget || null;

        // try to create a mouse event
        var customEvent /*:MouseEvent*/ = null;

        if (isFunction(doc.createEvent)) {

            customEvent = doc.createEvent("MouseEvent");

            customEvent.initMouseEvent(type, bubbles, cancelable, view, detail,
                screenX, screenY, clientX, clientY,
                ctrlKey, altKey, shiftKey, metaKey,
                button, relatedTarget);

            /*
             * Check to see if relatedTarget has been assigned. Firefox
             * versions less than 2.0 don't allow it to be assigned via
             * initMouseEvent() and the property is readonly after event
             * creation, so in order to .relatedTarget
             * working, assign to the IE proprietary toElement property
             * for mouseout event and fromElement property for mouseover
             * event.
             */
            if (relatedTarget && !customEvent.relatedTarget) {
                if (type == "mouseout") {
                    customEvent.toElement = relatedTarget;
                } else if (type == "mouseover") {
                    customEvent.fromElement = relatedTarget;
                }
            }

            // fire the event
            target.dispatchEvent(customEvent);
        } else if (doc.createEventObject) { // IE

            // create an IE event object
            customEvent = doc.createEventObject();

            // assign available properties
            customEvent.bubbles = bubbles;
            customEvent.cancelable = cancelable;
            customEvent.view = view;
            customEvent.detail = detail;
            customEvent.screenX = screenX;
            customEvent.screenY = screenY;
            customEvent.clientX = clientX;
            customEvent.clientY = clientY;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.metaKey = metaKey;
            customEvent.shiftKey = shiftKey;

            // fix button property for IE's wacky implementation
            switch (button) {
                case 0:
                    customEvent.button = 1;
                    break;
                case 1:
                    customEvent.button = 4;
                    break;
                case 2:
                    //leave as is
                    break;
                default:
                    customEvent.button = 0;
            }

            /*
             * Have to use relatedTarget because IE won't allow assignment
             * to toElement or fromElement on generic events. This keeps
             * .relatedTarget functional.
             */
            customEvent.relatedTarget = relatedTarget;

            // fire the event
            target.fireEvent("on" + type, customEvent);

        } else {
            throw "simulateMouseEvent(): No event simulation framework present.";
        }
    }

    /*
     * Simulates a UI event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks.
     * @method simulateHTMLEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: click, dblclick, mousedown, mouseup, mouseout,
     *      mouseover, and mousemove.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      mouse events except mousemove can be cancelled. The default
     *      is true for all events except mousemove, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) The number of times the mouse button has
     *      been used. The default value is 1.
     */
    function simulateUIEvent(target /*:HTMLElement*/, type /*:String*/, bubbles /*:Boolean*/, cancelable /*:Boolean*/, view /*:Window*/, detail /*:int*/) /*:Void*/ {

        // check target
        if (!target) {
            throw "simulateUIEvent(): Invalid target.";
        }

        // check event type
        if (isString(type)) {
            type = type.toLowerCase();

            // make sure it's a supported mouse event
            if (!uiEvents[type]) {
                throw "simulateUIEvent(): Event type '" + type + "' not supported.";
            }
        } else {
            throw "simulateUIEvent(): Event type must be a string.";
        }

        // try to create a mouse event
        var customEvent = null;


        // setup default values
        if (!isBoolean(bubbles)) {
            bubbles = (type in bubbleEvents);  // not all events bubble
        }
        if (!isBoolean(cancelable)) {
            cancelable = (type == "submit"); // submit is the only one that can be cancelled
        }
        if (!isObject(view)) {
            view = window; // view is typically window
        }
        if (!isNumber(detail)) {
            detail = 1;  // usually not used but defaulted to this
        }

        if (isFunction(doc.createEvent)) {

            // just a generic UI Event object is needed
            customEvent = doc.createEvent("UIEvent");
            customEvent.initUIEvent(type, bubbles, cancelable, view, detail);

            // fire the event
            target.dispatchEvent(customEvent);

        } else if (isObject(doc.createEventObject)) { // IE

            // create an IE event object
            customEvent = doc.createEventObject();

            // assign available properties
            customEvent.bubbles = bubbles;
            customEvent.cancelable = cancelable;
            customEvent.view = view;
            customEvent.detail = detail;

            // fire the event
            target.fireEvent("on" + type, customEvent);

        } else {
            throw "simulateUIEvent(): No event simulation framework present.";
        }
    }


    /*
     * @method simulateTouchEvent
     * @private
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: touchstart, touchmove, touchend, touchcancel.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      touch events except touchcancel can be cancelled. The default
     *      is true for all events except touchcancel, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) Specifies some detail information about
     *      the event depending on the type of event.
     * @param {int} screenX (Optional) The x-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} screenY (Optional) The y-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} clientX (Optional) The x-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {int} clientY (Optional) The y-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false.
     * @param {TouchList} touches A collection of Touch objects representing
     *      all touches associated with this event.
     * @param {TouchList} targetTouches A collection of Touch objects
     *      representing all touches associated with this target.
     * @param {TouchList} changedTouches A collection of Touch objects
     *      representing all touches that changed in this event.
     * @param {float} scale (iOS v2+ only) The distance between two fingers
     *      since the start of an event as a multiplier of the initial distance.
     *      The default value is 1.0.
     * @param {float} rotation (iOS v2+ only) The delta rotation since the start
     *      of an event, in degrees, where clockwise is positive and
     *      counter-clockwise is negative. The default value is 0.0.
     */
    function simulateTouchEvent(target, type, bubbles,            // boolean
                                cancelable,         // boolean
                                view,               // DOMWindow
                                detail,             // long
                                screenX, screenY,   // long
                                clientX, clientY,   // long
                                ctrlKey, altKey, shiftKey, metaKey, // boolean
                                touches,            // TouchList
                                targetTouches,      // TouchList
                                changedTouches,     // TouchList
                                scale,              // float
                                rotation            // float
        ) {

        if (touches) {
            touches = createTouchList(target, touches);
        }

        if (changedTouches) {
            changedTouches = createTouchList(target, changedTouches);
        }

        if (targetTouches) {
            targetTouches = createTouchList(target, targetTouches);
        }

        var UA = KISSY.UA;

        var customEvent;

        // check target
        if (!target) {
            throw new Error("simulateTouchEvent(): Invalid target.");
        }

        //check event type
        if (typeof type == 'string') {
            type = type.toLowerCase();

            //make sure it's a supported touch event
            if (!touchEvents[type]) {
                throw new Error("simulateTouchEvent(): Event type '" + type + "' not supported.");
            }
        } else {
            throw new Error("simulateTouchEvent(): Event type must be a string.");
        }

        // note that the caller is responsible to pass appropriate touch objects.
        // check touch objects
        // Android(even 4.0) doesn't define TouchList yet
        /*if(type === 'touchstart' || type === 'touchmove') {
         if(!touches instanceof TouchList) {
         S.error('simulateTouchEvent(): Invalid touches. It must be a TouchList');
         } else {
         if(touches.length === 0) {
         S.error('simulateTouchEvent(): No touch object found.');
         }
         }
         } else if(type === 'touchend') {
         if(!changedTouches instanceof TouchList) {
         S.error('simulateTouchEvent(): Invalid touches. It must be a TouchList');
         } else {
         if(changedTouches.length === 0) {
         S.error('simulateTouchEvent(): No touch object found.');
         }
         }
         }*/

        if (type === 'touchstart' || type === 'touchmove') {
            if (touches.length === 0) {
                throw new Error('simulateTouchEvent(): No touch object in touches');
            }
        } else if (type === 'touchend') {
            if (changedTouches.length === 0) {
                throw new Error('simulateTouchEvent(): No touch object in changedTouches');
            }
        }

        // setup default values
        if (!isBoolean(bubbles)) {
            bubbles = true;
        } // bubble by default.
        if (!isBoolean(cancelable)) {
            cancelable = (type !== "touchcancel"); // touchcancel is not cancelled
        }
        if (!isObject(view)) {
            view = window;
        }
        if (!isNumber(detail)) {
            detail = 1;
        } // usually not used. defaulted to # of touch objects.
        if (!isNumber(screenX)) {
            screenX = 0;
        }
        if (!isNumber(screenY)) {
            screenY = 0;
        }
        if (!isNumber(clientX)) {
            clientX = 0;
        }
        if (!isNumber(clientY)) {
            clientY = 0;
        }
        if (!isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (!isBoolean(altKey)) {
            altKey = false;
        }
        if (!isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (!isBoolean(metaKey)) {
            metaKey = false;
        }
        if (!isNumber(scale)) {
            scale = 1.0;
        }
        if (!isNumber(rotation)) {
            rotation = 0.0;
        }


        //check for DOM-compliant browsers first
        if (isFunction(document.createEvent)) {
            if (UA.android || UA.chrome) {
                /**
                 * Couldn't find android start version that supports touch event.
                 * Assumed supported(btw APIs broken till icecream sandwitch)
                 * from the beginning.
                 */
                if (UA.android < 4.0 ||
                    // emulate touch events
                    UA.chrome) {
                    /**
                     * Touch APIs are broken in androids older than 4.0.
                     * We will use
                     * simulated touch apis for these versions.
                     * App developer still can listen for touch events.
                     * This events
                     * will be dispatched with touch event types.
                     *
                     * (Note) Used target for the relatedTarget.
                     * Need to verify if
                     * it has a side effect.
                     */
                    customEvent = document.createEvent("MouseEvent");
                    customEvent.initMouseEvent(type, bubbles, cancelable, view, detail,
                        screenX, screenY, clientX, clientY,
                        ctrlKey, altKey, shiftKey, metaKey,
                        0, target);

                    customEvent.touches = touches;
                    customEvent.targetTouches = targetTouches;
                    customEvent.changedTouches = changedTouches;
                } else {
                    customEvent = document.createEvent("TouchEvent");

                    // Andoroid isn't compliant W3C initTouchEvent method signature.
                    customEvent.initTouchEvent(touches, targetTouches, changedTouches,
                        type, view,
                        screenX, screenY, clientX, clientY,
                        ctrlKey, altKey, shiftKey, metaKey);
                }
            } else if (UA.ios) {
                if (UA.ios >= 2.0) {
                    customEvent = document.createEvent("TouchEvent");

                    // Available iOS 2.0 and later
                    customEvent.initTouchEvent(type, bubbles, cancelable, view, detail,
                        screenX, screenY, clientX, clientY,
                        ctrlKey, altKey, shiftKey, metaKey,
                        touches, targetTouches, changedTouches,
                        scale, rotation);
                } else {
                    throw new Error('simulateTouchEvent(): No touch event simulation framework present for iOS, ' + UA.ios + '.');
                }
            } else {
                throw new Error('simulateTouchEvent(): Not supported agent yet, ' + navigator.userAgent);
            }

            //fire the event
            target.dispatchEvent(customEvent);
            //} else if (S.isObject(doc.createEventObject)){ // Windows Mobile/IE, support later
        } else {
            throw new Error('simulateTouchEvent(): No event simulation framework present.');
        }
    }


    // http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/DocumentAdditionsReference/DocumentAdditions/DocumentAdditions.html
    /**
     * Helper method to convert an array with touch points to TouchList object as
     * defined in http://www.w3.org/TR/touch-events/
     * @param {Array} touchPoints
     * @return {TouchList | Array} If underlying platform support creating touch list
     *      a TouchList object will be returned otherwise a fake Array object
     *      will be returned.
     */
    function createTouchList(target, touchPoints) {
        /*
         * Android 4.0.3 emulator:
         * Native touch api supported starting in version 4.0 (Ice Cream Sandwich).
         * However the support seems limited. In Android 4.0.3 emulator, I got
         * "TouchList is not defined".
         */
        var touches = [],
            S = KISSY,
            UA = S.UA,
            DOM = S.DOM,
            touchList,
            self = this;

        if (!!touchPoints && S.isArray(touchPoints)) {
            if (UA.android && UA.android >= 4.0 || UA.ios && UA.ios >= 2.0) {
                S.each(touchPoints, function (point) {
                    if (!point.identifier) {
                        point.identifier = 0;
                    }
                    if (!point.pageX) {
                        point.pageX = 0;
                    }
                    if (!point.pageX && point.clientX) {
                        point.pageX = point.clientX + DOM.scrollLeft();
                    }
                    if (!point.pageY) {
                        point.pageY = 0;
                    }
                    if (!point.pageY && point.clientY) {
                        point.pageY = point.clientY + DOM.scrollTop();
                    }
                    if (!point.screenX) {
                        point.screenX = 0;
                    }
                    if (!point.screenY) {
                        point.screenY = 0;
                    }

                    touches.push(document.createTouch(window,
                        point.target || target,
                        point.identifier,
                        point.pageX, point.pageY,
                        point.screenX, point.screenY));
                });

                touchList = document.createTouchList.apply(document, touches);
            } else if (UA.ios && UA.ios < 2.0) {
                throw new Error(': No touch event simulation framework present.');
            } else {
                // this will include android(UA.android && UA.android < 4.0)
                // and desktops among all others.

                /**
                 * Touch APIs are broken in androids older than 4.0. We will use
                 * simulated touch apis for these versions.
                 */
                touchList = [];
                S.each(touchPoints, function (point) {
                    if (!point.identifier) {
                        point.identifier = 0;
                    }
                    if (!point.clientX) {
                        point.clientX = 0;
                    }
                    if (!point.clientY) {
                        point.clientY = 0;
                    }
                    if (!point.pageX) {
                        point.pageX = 0;
                    }
                    if (!point.pageX && point.clientX) {
                        point.pageX = point.clientX + DOM.scrollLeft();
                    }
                    if (!point.pageY) {
                        point.pageY = 0;
                    }
                    if (!point.pageY && point.clientY) {
                        point.pageY = point.clientY + DOM.scrollTop();
                    }
                    if (!point.screenX) {
                        point.screenX = 0;
                    }
                    if (!point.screenY) {
                        point.screenY = 0;
                    }

                    touchList.push({
                        target: point.target || target,
                        identifier: point.identifier,
                        clientX: point.clientX,
                        clientY: point.clientY,
                        pageX: point.pageX,
                        pageY: point.pageY,
                        screenX: point.screenX,
                        screenY: point.screenY
                    });
                });

                touchList.item = function (i) {
                    return touchList[i];
                };
            }
        } else {
            throw new Error('Invalid touchPoints passed');
        }

        return touchList;
    }

    function simulateDeviceMotionEvent(target, option) {
        if (document.createEvent && window.DeviceMotionEvent) {
            var customEvent = document.createEvent('DeviceMotionEvent');

            customEvent.initDeviceMotionEvent('devicemotion',
                false, false,
                option.acceleration,
                option.accelerationIncludingGravity || option.acceleration,
                option.rotationRate || {
                    alpha: 0,
                    beta: 0,
                    gamma: 0
                }, option.interval || 100);

            window.dispatchEvent(customEvent);
        }
    }


    /**
     * Simulates the event with the given name on a target.
     * @param {HTMLElement} target The DOM element that's the target of the event.
     * @param {String} type The type of event to simulate (i.e., "click").
     * @param {Object} options (Optional) Extra options to copy onto the event object.
     * @return {void}
     * @for Event
     * @method simulate
     * @static
     */
    jasmine.simulate = function (target, type, options) {
        var UA = window.KISSY && window.KISSY.UA || {};
        options = options || {};
        if (type == 'click') {
            jasmine.simulate(target, 'mousedown', options);
            jasmine.simulate(target, 'mouseup', options);
        }
        if (KISSY.Features.isPointerSupported()) {
            if (type == 'mousedown') {
                jasmine.simulate(target, 'pointerdown', options);
            } else if (type == 'mouseup') {
                jasmine.simulate(target, 'pointerup', options);
            } else if (type == 'mousemove') {
                jasmine.simulate(target, 'pointermove', options);
            }
        } else if (KISSY.Features.isMsPointerSupported()) {
            if (type == 'mousedown') {
                jasmine.simulate(target, 'MSPointerDown', options);
            } else if (type == 'mouseup') {
                jasmine.simulate(target, 'MSPointerUp', options);
            } else if (type == 'mousemove') {
                jasmine.simulate(target, 'MSPointerMove', options);
            }
        }
        if (mouseEvents[type]) {
            simulateMouseEvent(target, type, options.bubbles,
                options.cancelable, options.view, options.detail, options.screenX,
                options.screenY, options.clientX, options.clientY, options.ctrlKey,
                options.altKey, options.shiftKey, options.metaKey, options.button,
                options.relatedTarget);
        } else if (keyEvents[type]) {
            simulateKeyEvent(target, type, options.bubbles,
                options.cancelable, options.view, options.ctrlKey,
                options.altKey, options.shiftKey, options.metaKey,
                options.keyCode, options.charCode);
        } else if (uiEvents[type]) {
            simulateUIEvent(target, type, options.bubbles,
                options.cancelable, options.view, options.detail);
        } else if (touchEvents[type]) {
            if ((window && ("ontouchstart" in window)) && !(UA.phantomjs) && !(UA.chrome && UA.chrome < 6)) {
                simulateTouchEvent(target, type,
                    options.bubbles, options.cancelable, options.view, options.detail,
                    options.screenX, options.screenY, options.clientX, options.clientY,
                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                    options.touches, options.targetTouches, options.changedTouches,
                    options.scale, options.rotation);
            } else {
                throw new Error("simulate(): Event '" + type + "' can't be simulated.");
            }
        } else if (type == 'devicemotion') {
            simulateDeviceMotionEvent(target, options);
        } else {
            throw "simulate(): Event '" + type + "' can't be simulated.";
        }
    };
})();

/**
 * 2012-12-12 yiminghe@gmail.com
 *  - simplify from yui3
 *  - we only support latest browsers
 *  - normalize drag
 */
