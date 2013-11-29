/**
 * @ignore
 * observer for dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var BaseEvent = require('event/base');
    var Special = require('./special');

    /**
     * observer for dom event
     * @class KISSY.Event.DomEvent.Observer
     * @extends KISSY.Event.Observer
     * @private
     */
    function DomEventObserver(cfg) {
        DomEventObserver.superclass.constructor.call(this, cfg);
        /**
         * filter selector string or function to find right element
         * @cfg {String} filter
         */
        /**
         * extra data as second parameter of listener
         * @cfg {*} data
         */
    }

    S.extend(DomEventObserver, BaseEvent.Observer, {
        keys: ['fn', 'filter', 'data', 'context', 'originalType', 'groups', 'last'],

        notifyInternal: function (event, ce) {
            var self = this,
                s, t, ret,
                type = event.type,
                originalType;

            if ((originalType = self.originalType)) {
                event.type = originalType;
            } else {
                originalType = type;
            }

            // context undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
            if ((s = Special[originalType]) && s.handle) {
                t = s.handle(event, self, ce);
                // can handle
                if (t && t.length > 0) {
                    ret = t[0];
                }
            } else {
                ret = self.simpleNotify(event, ce);
            }

            if (ret === false) {
                event.halt();
            }

            // notify other mousemove listener
            event.type = type;

            return ret;
        }
    });

    return DomEventObserver;
});