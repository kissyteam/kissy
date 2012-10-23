/**
 * subscriber for event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/subscriber', function (S) {

    function Subscriber(cfg) {

        S.mix(this, cfg);

    }

    Subscriber.prototype = {

        constructor: Subscriber,

        keys: [],

        equals: function (s2) {
            var s1 = this;
            return S.reduce(this.keys, function (v, k) {
                return v && (s1[k] === s2[k]);
            }, 1);
        },

        notifyInternal: function (event, ce) {
            var ret, self = this;
            ret = self.fn.call(
                self.scope || ce.currentTarget,
                event, self.data
            );
            if (this.once) {
                ce.removeSubscriber(this);
            }
            return ret;
        },

        notify: function (event, ce) {

            var ret,
                self = this,
                _ks_groups = event._ks_groups,
                eventType = event.type;

            // handler's group does not match specified groups (at fire step)
            if (_ks_groups && (!self.groups || !(self.groups.match(_ks_groups)))) {
                return;
            }

            ret = self.notifyInternal(event,ce);

            // return false 等价 preventDefault + stopPropagation
            if (ret === false) {
                event.halt();
            }

            event.type = eventType;
        }

    };

    return Subscriber;

});