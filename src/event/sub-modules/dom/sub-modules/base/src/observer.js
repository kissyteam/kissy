/**
 * @ignore
 * observer for dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/observer', function (S, special, Event) {

    /**
     * observer for dom event
     * @class KISSY.Event.DOMEventObserver
     * @extends KISSY.Event.Observer
     * @private
     */
    function DOMEventObserver(cfg) {
        DOMEventObserver.superclass.constructor.apply(this, arguments);
        /**
         * filter selector string or function to find right element
         * @cfg {String} selector
         */
        /**
         * extra data as second parameter of listener
         * @cfg {*} data
         */
    }

    S.extend(DOMEventObserver, Event._Observer, {

        keys: ['fn', 'selector', 'data', 'context', 'originalType', 'groups', 'last'],

        notifyInternal: function (event, ce) {
            var self = this,
                s, t, ret,
                type = event.type;

            // restore originalType if involving delegate/onFix handlers
            if (self.originalType) {
                event.type = self.originalType;
            }

            // context undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
            if ((s = special[event.type]) && s.handle) {
                t = s.handle(event, self, ce);
                // can handle
                if (t && t.length > 0) {
                    ret = t[0];
                }
            } else {
                ret = self.simpleNotify(event, ce);
            }

            event.type = type;

            return ret;
        }

    });

    return DOMEventObserver;

}, {
    requires: ['./special', 'event/base']
});