/**
 *  view for kissy mvc : event delegation,el generator
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/view", function (S, Node, Base) {

    var $ = Node.all;

    function normFn(self, f) {
        if (typeof f == 'string') {
            return self[f];
        }
        return f;
    }

    /**
     * @name View
     * @class
     * View for delegating event on root element.
     * @memberOf MVC
     * @extends KISSY.Base
     */
    function View() {
        View.superclass.constructor.apply(this, arguments);
        var events;
        if (events = this.get("events")) {
            this._afterEventsChange({
                newVal: events
            });
        }
    }

    View.ATTRS =
    /**
     * @lends MVC.View#
     */
    {
        /**
         * Get root element for current view instance.
         * @type {String}
         * @example
         * <code>
         * //  selector :
         * .xx
         * // or html string
         * <div>my</div>
         * </code>
         */
        el: {
            value: "<div />",
            getter: function (s) {
                if (typeof s == 'string') {
                    s = $(s);
                    this.setInternal("el", s);
                }
                return s;
            }
        },

        /**
         * Delegate event on root element.
         * @type {Object}
         * @example
         * <code>
         * events:{
         *   selector:{
         *     eventType:callback
         *   }
         * }
         * </code>
         */
        events: {

        }
    };


    S.extend(View, Base,
        /**
         * @lends MVC.View#
         */
        {

            _afterEventsChange: function (e) {
                var prevVal = e.prevVal;
                if (prevVal) {
                    this._removeEvents(prevVal);
                }
                this._addEvents(e.newVal);
            },

            _removeEvents: function (events) {
                var el = this.get("el");
                for (var selector in events) {
                    var event = events[selector];
                    for (var type in event) {
                        var callback = normFn(this, event[type]);
                        el.undelegate(type, selector, callback, this);
                    }
                }
            },

            _addEvents: function (events) {
                var el = this.get("el");
                for (var selector in events) {
                    var event = events[selector];
                    for (var type in event) {
                        var callback = normFn(this, event[type]);
                        el.delegate(type, selector, callback, this);
                    }
                }
            },

            /**
             * @chainable
             */
            render: function () {
                return this;
            },

            /**
             * Remove root element.
             */
            destroy: function () {
                this.get("el").remove();
            }

        });

    return View;

}, {
    requires: ['node', 'base']
});