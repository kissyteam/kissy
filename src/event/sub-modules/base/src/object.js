/**
 * @ignore
 * base event object for custom and dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/object', function (S) {

    var FALSE_FN = function () {
        return false;
    }, TRUE_FN = function () {
        return true;
    };

    /**
     * @class KISSY.Event.Object
     * @private
     * KISSY 's base event object for custom and dom event.
     */
    function EventObject() {
        this.timeStamp = S.now();
        /**
         * current event type
         * @property type
         * @type {String}
         */
    }

    EventObject.prototype = {
        constructor: EventObject,
        /**
         * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
         * @method
         */
        isDefaultPrevented: FALSE_FN,
        /**
         * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
         * @method
         */
        isPropagationStopped: FALSE_FN,
        /**
         * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
         * @method
         */
        isImmediatePropagationStopped: FALSE_FN,

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function () {
            this.isDefaultPrevented = TRUE_FN;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function () {
            this.isPropagationStopped = TRUE_FN;
        },

        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being executed
         * on the current target.
         */
        stopImmediatePropagation: function () {
            var self = this;
            self.isImmediatePropagationStopped = TRUE_FN;
            // fixed 1.2
            // call stopPropagation implicitly
            self.stopPropagation();
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param  {Boolean} [immediate] if true additional listeners on the current target will not be executed
         */
        halt: function (immediate) {
            var self = this;
            if (immediate) {
                self.stopImmediatePropagation();
            } else {
                self.stopPropagation();
            }
            self.preventDefault();
        }
    };

    return EventObject;

});