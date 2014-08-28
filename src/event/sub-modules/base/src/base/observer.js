/**
 * @ignore
 * observer for event.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    /**
     * KISSY 's base observer for handle user-specified function
     * @private
     * @class KISSY.Event.Observer
     * @param {Object} cfg
     */
    function Observer(cfg) {
        S.mix(this, cfg);

        /**
         * context in which observer's fn runs
         * @cfg {Object} context
         */
        /**
         * current observer's user-defined function
         * @cfg {Function} fn
         */
        /**
         * whether un-observer current observer once after running observer's user-defined function
         * @cfg {Boolean} once
         */
        /**
         * groups separated by '.' which current observer belongs
         * @cfg {String} groups
         */
    }

    Observer.prototype = {

        constructor: Observer,

        /**
         * whether current observer equals s2
         * @param {KISSY.Event.Observer} s2 another observer
         * @return {Boolean}
         */
        equals: function (s2) {
            var s1 = this;
            return !!S.reduce(s1.keys, function (v, k) {
                return v && (s1[k] === s2[k]);
            }, 1);
        },

        /**
         * simple run current observer's user-defined function
         * @param {KISSY.Event.Object} event
         * @param {KISSY.Event.Observable} ce
         * @return {*} return value of current observer's user-defined function
         */
        simpleNotify: function (event, ce) {
            var ret,
                self = this;
            ret = self.fn.call(self.context || ce.currentTarget, event, self.data);
            if (self.once) {
                //noinspection JSUnresolvedFunction
                ce.removeObserver(self);
            }
            return ret;
        },

        /**
         * current observer's notification.
         * @protected
         * @param {KISSY.Event.Object} event
         * @param {KISSY.Event.Observable} ce
         */
        notifyInternal: function (event, ce) {
            var ret = this.simpleNotify(event, ce);
            // return false 等价 preventDefault + stopPropagation
            if (ret === false) {
                event.halt();
            }
            return ret;
        },

        /**
         * run current observer's user-defined function
         * @param event
         * @param ce
         */
        notify: function (event, ce) {
            var self = this,
                _ksGroups = event._ksGroups;

            // handler's group does not match specified groups (at fire step)
            if (_ksGroups && (!self.groups || !(self.groups.match(_ksGroups)))) {
                return undefined;
            }

            return self.notifyInternal(event, ce);
        }

    };

    return Observer;

});