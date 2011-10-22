/**
 * view for kissy mvc : event delegation,container generator
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/view", function(S, Node, Base) {

    var $ = Node.all;

    function normFn(self, f) {
        if (S.isString(f)) {
            return self[f];
        }
        return f;
    }

    function View() {
        View.superclass.constructor.apply(this, arguments);
        var events;
        if (events = this.get("events")) {
            this._afterEventsChange({
                newVal:events
            });
        }
    }

    View.ATTRS = {
        container:{
            valueFn:function() {
                return $("<div />");
            },
            setter:function(s) {
                if (S.isString(s)) {
                    s = $(s);
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


    S.extend(View, Base, {

        _afterEventsChange:function(e) {
            var prevVal = e.prevVal;
            if (prevVal) {
                this._removeEvents(prevVal);
            }
            this._addEvents(e.newVal);
        },

        _removeEvents:function(events) {
            var container = this.get("container");
            for (var selector in events) {
                var event = events[selector];
                for (var type in event) {
                    var callback = event[type];
                    container.undelegate(type, selector, callback, this);
                }
            }
        },

        _addEvents:function(events) {
            var container = this.get("container");
            for (var selector in events) {
                var event = events[selector];
                for (var type in event) {
                    var callback = event[type];
                    container.delegate(type, selector, callback, this);
                }
            }
        },
        /**
         * user need to override
         */
        render:function() {
            return this;
        },

        remove:function() {
            this.get("container").remove();
        }

    });

    return View;

}, {
    requires:['node','base']
});