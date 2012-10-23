/**
 * subscriber for dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/subscriber', function (S, special, Subscriber) {


    var KEYS = ['fn', 'selector', 'data', 'scope', 'originalType', 'groups', 'last'];

    function DOMSubscriber(cfg) {
        DOMSubscriber.superclass.constructor.apply(this, arguments);
    }

    S.extend(DOMSubscriber, Subscriber, {
        keys: ['fn', 'selector', 'data', 'scope', 'originalType', 'groups', 'last'],
        notifyInternal: function (event, ce) {
            var self = this, s, t, ret;
            // restore originalType if involving delegate/onFix handlers
            if (self.originalType) {
                event.type = self.originalType;
            }

            // scope undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
            if ((s = special[event.type]) && s.handle) {
                t = s.handle(event, self);
                // can handle
                if (t.length > 0) {
                    ret = t[0];
                    if (this.once) {
                        ce.removeSubscriber(this);
                    }
                }
            } else {
                ret = DOMSubscriber.superclass.notifyInternal.apply(this, arguments);
            }

            return ret;

        }
    });

    return DOMSubscriber;

}, {
    requires: ['./special', 'event/base/subscriber']
});