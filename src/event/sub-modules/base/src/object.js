/**
 * @ignore
 * base event object for custom and dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/object', function (S, undefined) {

    var FALSE_FN = function f_f() {
        return false;
    }, TRUE_FN = function t_f() {
        return true;
    };

    /**
     * @class KISSY.Event.Object
     * @private
     * KISSY 's base event object for custom and dom event.
     */
    function EventObject() {

        var self = this;

        self.timeStamp = S.now();
        /**
         * target
         * @property target
         * @member KISSY.Event.Object
         */
        self.target = undefined;
        /**
         * currentTarget
         * @property currentTarget
         * @member KISSY.Event.Object
         */
        self.currentTarget = undefined;
        /**
         * current event type
         * @property type
         * @type {String}
         * @member KISSY.Event.Object
         */
    }

    EventObject.prototype = {
        constructor: EventObject,
        /**
         * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
         * @method
         * @member KISSY.Event.Object
         */
        isDefaultPrevented: FALSE_FN,
        /**
         * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
         * @method
         * @member KISSY.Event.Object
         */
        isPropagationStopped: FALSE_FN,
        /**
         * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
         * @method
         * @member KISSY.Event.Object
         */
        isImmediatePropagationStopped: FALSE_FN,

        /**
         * Prevents the event's default behavior
         * @member KISSY.Event.Object
         */
        preventDefault: function () {
            this.isDefaultPrevented = TRUE_FN;
        },

        /**
         * Stops the propagation to the next bubble target
         * @member KISSY.Event.Object
         */
        stopPropagation: function () {
            this.isPropagationStopped = TRUE_FN;
        },

        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being executed
         * on the current target.
         * @member KISSY.Event.Object
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
         * @member KISSY.Event.Object
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