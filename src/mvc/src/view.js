/**
 * @fileOverview view for kissy mvc : event delegation,el generator
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/view", function (S, Node, Base) {

    var $ = Node.all;

    function normFn(self, f) {
        if (S.isString(f)) {
            return self[f];
        }
        return f;
    }

    /**
     * @class
     * @memberOf MVC
     */
    function View() {
        View.superclass.constructor.apply(this, arguments);
        var events;
        if (events = this.get("events")) {
            this._afterEventsChange({
                newVal:events
            });
        }
    }

    View.ATTRS =
    /**
     * @lends MVC.View#
     */
    {
        el:{
            value:"<div />",
            getter:function (s) {
                if (S.isString(s)) {
                    s = $(s);
                    this.__set("el", s);
                }
                return s;
            }
        },

        /**
         * events:{
         *   selector:{
         *     eventType:callback
         *   }
         * }
         */
        events:{

        }
    };


    S.extend(View, Base,
        /**
         * @lends MVC.View#
         */
        {

            _afterEventsChange:function (e) {
                var prevVal = e.prevVal;
                if (prevVal) {
                    this._removeEvents(prevVal);
                }
                this._addEvents(e.newVal);
            },

            _removeEvents:function (events) {
                var el = this.get("el");
                for (var selector in events) {
                    var event = events[selector];
                    for (var type in event) {
                        var callback = normFn(this, event[type]);
                        el.undelegate(type, selector, callback, this);
                    }
                }
            },

            _addEvents:function (events) {
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
             * user need to override
             */
            render:function () {
                return this;
            },

            destroy:function () {
                this.get("el").remove();
            }

        });

    return View;

}, {
    requires:['node', 'base']
});