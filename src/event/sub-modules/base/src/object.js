/**
 * base event object for custom and dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/object', function () {

    var FALSE = function () {
        return false;
    }, TRUE = function () {
        return true;
    };

    function EventObject() {
    }

    EventObject.prototype = {
        constructor: EventObject,
        /**
         * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
         * @type {Boolean}
         */
        isDefaultPrevented: FALSE,
        /**
         * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
         * @type {Boolean}
         */
        isPropagationStopped: FALSE,
        /**
         * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
         * @type {Boolean}
         */
        isImmediatePropagationStopped: FALSE,

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function () {
            this.isDefaultPrevented = TRUE;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function () {
            this.isPropagationStopped = TRUE;
        },


        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being executed
         * on the current target.
         */
        stopImmediatePropagation: function () {
            var self = this;
            self.isImmediatePropagationStopped = TRUE;
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