/**
 * @ignore
 * simple event target for loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    // in case current code runs on nodejs
    S.namespace("Loader");

    var time = S.now(),
        p = '__events__' + time;

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

    /**
     * @class KISSY.Loader.Target
     * Event Target For KISSY Loader.
     * @private
     * @singleton
     */
    KISSY.Loader.Target = {
        /**
         * register callback for specified eventName from loader
         * @param {String} eventName event name from kissy loader
         * @param {Function} callback function to be executed when event of eventName is fired
         */
        on: function (eventName, callback) {
            getEventHolder(this, eventName, 1).push(callback);
        },

        /**
         * remove callback for specified eventName from loader
         * @param {String} [eventName] eventName from kissy loader.
         * if undefined remove all callbacks for all events
         * @param {Function } [callback] function to be executed when event of eventName is fired.
         * if undefined remove all callbacks fro this event
         */
        detach: function (eventName, callback) {
            var self = this, fns, index;
            if (!eventName) {
                delete self[p];
                return;
            }
            fns = getEventHolder(self, eventName);
            if (fns) {
                if (callback) {
                    index = S.indexOf(callback, fns);
                    if (index != -1) {
                        fns.splice(index, 1);
                    }
                }
                if (!callback || !fns.length) {
                    delete getHolder(self)[eventName];
                }
            }
        },

        /**
         * Fire specified event.
         * @param eventName
         * @param obj
         */
        fire: function (eventName, obj) {
            var fns = getEventHolder(this, eventName) || [],
                i,
                l = fns.length;
            for (i = 0; i < l; i++) {
                fns[i].call(null, obj);
            }
        }
    };
})(KISSY);