/**
 * @ignore
 * custom event mechanism for kissy.
 * refer: http://www.w3.org/TR/domcore/#interface-customevent
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/observable', function (S, api, CustomEventObserver, CustomEventObject, Event) {

    var _Utils = Event._Utils;

    /**
     * custom event for registering and un-registering observer for specified event on normal object.
     * @class KISSY.Event.ObservableCustomEvent
     * @extends KISSY.Event.ObservableEvent
     * @private
     */
    function ObservableCustomEvent() {
        var self = this;
        ObservableCustomEvent.superclass.constructor.apply(self, arguments);
        self.defaultFn = null;
        self.defaultTargetOnly = false;

        /**
         * whether this event can bubble.
         * Defaults to: true
         * @cfg {Boolean} bubbles
         */
        self.bubbles = true;
        /**
         * event target which binds current custom event
         * @cfg {KISSY.Event.Target} currentTarget
         */
    }

    S.extend(ObservableCustomEvent, Event._ObservableEvent, {

        constructor: ObservableCustomEvent,

        /**
         * add a observer to custom event's observers
         * @param {Object} cfg {@link KISSY.Event.CustomEventObserver} 's config
         */
        on: function (cfg) {
            var observer = new CustomEventObserver(cfg);
            if (this.findObserver(observer) == -1) {
                this.observers.push(observer);
            }
        },

        checkMemory: function () {
            var self = this,
                currentTarget = self.currentTarget,
                events = ObservableCustomEvent.getCustomEvents(currentTarget);
            if (events) {
                if (!self.hasObserver()) {
                    delete events[self.type];
                }
                if (S.isEmptyObject(events)) {
                    delete currentTarget[KS_CUSTOM_EVENTS];
                }
            }
        },

        /**
         * notify current custom event 's observers and then bubble up if this event can bubble.
         * @param {KISSY.Event.CustomEventObject} eventData
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fire: function (eventData) {

            if (!this.hasObserver() && !this.bubbles) {
                return;
            }

            eventData = eventData || {};

            var self = this,
                type = self.type,
                defaultFn = self.defaultFn,
                i,
                parents,
                len,
                currentTarget = self.currentTarget,
                customEvent = eventData,
                gRet, ret;

            eventData.type = type;

            if (!(customEvent instanceof  CustomEventObject)) {
                customEvent.target = currentTarget;
                customEvent = new CustomEventObject(customEvent);
            }

            customEvent.currentTarget = currentTarget;

            ret = self.notify(customEvent);

            if (gRet !== false) {
                gRet = ret;
            }

            if (self.bubbles) {
                parents = api.getTargets(currentTarget);
                len = parents && parents.length || 0;

                for (i = 0; i < len && !customEvent.isPropagationStopped(); i++) {

                    ret = api.fire(parents[i], type, customEvent);

                    // false 优先返回
                    if (gRet !== false) {
                        gRet = ret;
                    }

                }
            }

            if (defaultFn && !customEvent.isDefaultPrevented()) {
                var lowestCustomEvent = ObservableCustomEvent.getCustomEvent(customEvent.target, customEvent.type);
                if ((!self.defaultTargetOnly && !lowestCustomEvent.defaultTargetOnly) ||
                    self == customEvent.target) {
                    defaultFn.call(self);
                }
            }

            return gRet;

        },

        /**
         * notify current event 's observers
         * @param {KISSY.Event.CustomEventObject} event
         * @return {*} return false if one of custom event 's observers  else
         * return last value of custom event 's observers 's return value.
         */
        notify: function (event) {
            var observers = this.observers,
                ret,
                gRet,
                len = observers.length, i;

            for (i = 0; i < len && !event.isImmediatePropagationStopped(); i++) {
                ret = observers[i].notify(event, this);
                if (gRet !== false) {
                    gRet = ret;
                }
                if (ret === false) {
                    event.halt();
                }
            }

            return gRet;
        },

        /**
         * remove some observers from current event 's observers by observer config param
         * @param {Object} cfg {@link KISSY.Event.CustomEventObserver} 's config
         */
        detach: function (cfg) {
            var groupsRe,
                self = this,
                fn = cfg.fn,
                context = cfg.context,
                currentTarget = self.currentTarget,
                observers = self.observers,
                groups = cfg.groups;

            if (!observers.length) {
                return;
            }

            if (groups) {
                groupsRe = _Utils.getGroupsRe(groups);
            }

            var i, j, t, observer, observerContext, len = observers.length;

            // 移除 fn
            if (fn || groupsRe) {
                context = context || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    observer = observers[i];
                    observerContext = observer.context || currentTarget;
                    if (
                        (context != observerContext) ||
                            // 指定了函数，函数不相等，保留
                            (fn && fn != observer.fn) ||
                            // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                            (groupsRe && !observer.groups.match(groupsRe))
                        ) {
                        t[j++] = observer;
                    }
                }

                self.observers = t;
            } else {
                // 全部删除
                self.reset();
            }

            self.checkMemory();
        }
    });

    var KS_CUSTOM_EVENTS = '__~ks_custom_events';

    /**
     * Get custom event for specified event
     * @static
     * @private
     * @member KISSY.Event.ObservableCustomEvent
     * @param {HTMLElement} target
     * @param {String} type event type
     * @param {Boolean} [create] whether create custom event on fly
     * @return {KISSY.Event.ObservableCustomEvent}
     */
    ObservableCustomEvent.getCustomEvent = function (target, type, create) {
        var self = this,
            customEvent,
            customEvents = ObservableCustomEvent.getCustomEvents(target, create);
        customEvent = customEvents && customEvents[type];
        if (!customEvent && create) {
            customEvent = customEvents[type] = new ObservableCustomEvent({
                currentTarget: target,
                type: type
            });
        }
        return customEvent;
    };

    /**
     * Get custom events holder
     * @private
     * @static
     * @param {HTMLElement} target
     * @param {Boolean} [create] whether create custom event container on fly
     * @return {Object}
     */
    ObservableCustomEvent.getCustomEvents = function (target, create) {
        if (!target[KS_CUSTOM_EVENTS] && create) {
            target[KS_CUSTOM_EVENTS] = {};
        }
        return target[KS_CUSTOM_EVENTS];
    };

    return ObservableCustomEvent;

}, {
    requires: ['./api', './observer', './object', 'event/base']
});
/**
 * @ignore
 * 2012-10-26 yiminghe@gmail.com
 *  - custom event can bubble by default!
 */