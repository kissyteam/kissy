/**
 * @fileOverview   EventObject
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/object', function (S, undefined) {

    var doc = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        props = ('altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis').split(' ');

    /**
     * @class KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     * @name Object
     * @memberOf Event
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.originalEvent = domEvent || { };
        self.currentTarget = currentTarget;
        if (domEvent) { // html element
            self.type = domEvent.type;
            // incase dom event has been mark as default prevented by lower dom node
            self.isDefaultPrevented = ( domEvent['defaultPrevented'] || domEvent.returnValue === FALSE ||
                domEvent['getPreventDefault'] && domEvent['getPreventDefault']() ) ? TRUE : FALSE;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }
        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = TRUE;
    }

    S.augment(EventObject,
        /**
         * @lends Event.Object#
         */
        {

            /**
             * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
             * @type Boolean
             */
            isDefaultPrevented:FALSE,
            /**
             * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
             * @type Boolean
             */
            isPropagationStopped:FALSE,
            /**
             * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
             * @type Boolean
             */
            isImmediatePropagationStopped:FALSE,

            _fix:function () {
                var self = this,
                    originalEvent = self.originalEvent,
                    l = props.length, prop,
                    ct = self.currentTarget,
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

                // check if target is a textnode (safari)
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
            },

            /**
             * Prevents the event's default behavior
             */
            preventDefault:function () {
                var e = this.originalEvent;

                // if preventDefault exists run it on the original event
                if (e.preventDefault) {
                    e.preventDefault();
                }
                // otherwise set the returnValue property of the original event to FALSE (IE)
                else {
                    e.returnValue = FALSE;
                }

                this.isDefaultPrevented = TRUE;
            },

            /**
             * Stops the propagation to the next bubble target
             */
            stopPropagation:function () {
                var e = this.originalEvent;

                // if stopPropagation exists run it on the original event
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                // otherwise set the cancelBubble property of the original event to TRUE (IE)
                else {
                    e.cancelBubble = TRUE;
                }

                this.isPropagationStopped = TRUE;
            },


            /**
             * Stops the propagation to the next bubble target and
             * prevents any additional listeners from being exectued
             * on the current target.
             */
            stopImmediatePropagation:function () {
                var self = this;
                self.isImmediatePropagationStopped = TRUE;
                // fixed 1.2
                // call stopPropagation implicitly
                self.stopPropagation();
            },

            /**
             * Stops the event propagation and prevents the default
             * event behavior.
             * @param  {boolean} [immediate] if true additional listeners on the current target will not be executed
             */
            halt:function (immediate) {
                var self = this;
                if (immediate) {
                    self.stopImmediatePropagation();
                } else {
                    self.stopPropagation();
                }
                self.preventDefault();
            }
        });

    return EventObject;

});

/**
 * NOTES:
 *
 *  2010.04
 *   - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
 *
 * TODO:
 *   - pageX, clientX, scrollLeft, clientLeft 的详细测试
 */
