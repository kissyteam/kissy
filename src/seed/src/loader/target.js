/**
 * simple event target for loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

    var time = S.now(),
        p = "__events__" + time;

    function getHolder(self) {
        return self[p] || (self[p] = {});
    }

    function getEventHolder(self, name, create) {
        var holder = getHolder(self);
        if (create) {
            holder[name] = holder[name] || [];
        }
        return holder[name];
    }

    S.Loader.Target =
    /**
     * @lends KISSY.Loader#
     */
    {
        /**
         * register callback for specified eventName from loader
         * @param {String} eventName event name from kissy loader
         * @param {Function} callback function to be executed when event of eventName is fired
         */
        on:function (eventName, callback) {
            getEventHolder(this, eventName, 1).push(callback);
        },

        /**
         * remove callback for specified eventName from loader
         * @param {String} [eventName] eventName from kissy loader.
         * if undefined remove all callbacks for all events
         * @param {Function } [callback] function to be executed when event of eventName is fired.
         * if undefined remove all callbacks fro this event
         */
        detach:function (eventName, callback) {
            if (!eventName) {
                delete this[p];
                return;
            }
            var fns = getEventHolder(this, eventName);
            if (fns) {
                if (callback) {
                    var index = S.indexOf(callback, fns);
                    if (index != -1) {
                        fns.splice(index, 1);
                    }
                }
                if (!callback || !fns.length) {
                    delete getHolder(this)[eventName];
                }
            }
        },

        /**
         * @private
         */
        fire:function (eventName, obj) {
            var fns = getEventHolder(this, eventName);
            S.each(fns, function (f) {
                f.call(null, obj);
            });
        }
    };
})(KISSY);