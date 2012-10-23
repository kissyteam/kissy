/**
 * setup event/dom module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom', function (S, Event, DOM, special, Utils, DOMCustomEvent, KeyCodes) {
    var simpleAdd = Utils.simpleAdd,
        simpleRemove = Utils.simpleRemove,
        _Utils = Event._Utils;

    function addInternal(currentTarget, type, cfg) {
        var typedGroups = _Utils.getTypedGroups(type);

        type = typedGroups[0];

        var eventDesc,
            DOMCustomEvent,
            subscriber,
            s = special[type] || {};

        cfg.groups = typedGroups[1];

        // in case overwrite by delegateFix/onFix in special events
        // (mouseenter/leave,focusin/out)
        if (cfg.selector && !cfg.originalType) {
            if (s['delegateFix']) {
                cfg.originalType = type;
                type = s['delegateFix'];
            }
        }

        if (!cfg.selector && !cfg.originalType) {
            // when on mouseenter , it's actually on mouseover , and subscribers is saved with mouseover!
            // TODO need evaluate!
            if (s['onFix']) {
                cfg.originalType = type;
                type = s['onFix'];
            }
        }

        // 获取事件描述
        eventDesc = Utils.data(currentTarget, undefined);

        if (!eventDesc) {
            Utils.data(currentTarget, eventDesc = {});
        }

        //事件 listeners , similar to eventListeners in DOM3 Events
        DOMCustomEvent = eventDesc[type];

        if (!DOMCustomEvent) {
            DOMCustomEvent = eventDesc[type] = new DOMCustomEvent({
                type: type,
                currentTarget: currentTarget
            });

            // 第一次注册该事件，dom 节点才需要注册 dom 事件
            if (!s.setup || s.setup.call(currentTarget) === false) {
                simpleAdd(currentTarget, type, DOMCustomEvent.fn)
            }
        }

        subscriber = DOMCustomEvent.on(cfg);

        if (subscriber && special.add) {
            special.add.call(currentTarget, subscriber);
        }

    }


    function removeInternal(currentTarget, type, cfg) {
        cfg = cfg || {};

        var typedGroups = Utils.getTypedGroups(type);

        type = typedGroups[0];

        var groups = typedGroups[1],
            selector,
            s = special[type];

        if (cfg.selector) {
            if (s && s['delegateFix']) {
                type = s['delegateFix'];
            }
        }

        cfg.groups = groups;

        if (!selector) {
            if (s && s['onFix']) {
                type = s['onFix'];
            }
        }

        var eventDesc = _Utils._data(currentTarget, undefined);

        if (!eventDesc) {
            return;
        }

        // remove all types of event
        if (!type) {
            for (type in eventDesc) {
                eventDesc[type].detach(cfg);
            }
            return;
        }

        var DOMCustomEvent = eventDesc[type];

        DOMCustomEvent.detach(cfg);

        if (!DOMCustomEvent.hasSubscriber()) {
            // remove(el, type) or fn 已移除光
            // dom node need to detach handler from dom node
            if ((!special['tearDown'] ||
                special['tearDown'].call(currentTarget) === false)) {
                simpleRemove(currentTarget, type, DOMCustomEvent.fn);
            }
            // remove currentTarget's single event description
            delete eventDesc[type];
        }


        // remove currentTarget's  all events description
        if (S.isEmptyObject(eventDesc)) {
            _Utils._removeData(currentTarget);
        }
    }

    S.mix(Event, {
        KeyCodes: KeyCodes,
        /**
         * Adds an event listener.similar to addEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param type {String} The type of event to append.use space to separate multiple event types.
         * @param fn {Function} The event handler/listener.
         * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
         */
        add: function (targets, type, fn, scope) {
            type = S.trim(type);
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
            targets = DOM.query(targets);
            if (_Utils.batchForType(Event.add, targets, type, fn, scope)) {
                return targets;
            }
            var cfg = fn;

            if (S.isFunction(fn)) {
                cfg = {
                    fn: fn,
                    scope: scope
                };
            }

            for (var i = targets.length - 1; i >= 0; i--) {
                addInternal(targets[i], type, cfg);
            }
            return targets;
        },

        /**
         * Detach an event or set of events from an element. similar to removeEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param {String} [type] The type of event to remove.
         * use space to separate multiple event types.
         * @param {Function} [fn] The event handler/listener.
         * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
         */
        remove: function (targets, type, fn, scope) {

            type = S.trim(type);

            targets = DOM.query(targets);

            if (Utils.batchForType(Event.remove, targets, type, fn, scope)) {
                return targets;
            }

            var cfg = fn;

            if (S.isFunction(fn)) {
                cfg = {
                    fn: fn,
                    scope: scope
                };
            }

            for (var i = targets.length - 1; i >= 0; i--) {
                removeInternal(targets[i], type, cfg);
            }

            return targets;

        },

        /**
         * Delegate event.
         * @param targets KISSY selector
         * @param {String|Function} selector filter selector string or function to find right element
         * @param {String} [eventType] The type of event to delegate.
         * use space to separate multiple event types.
         * @param {Function} [fn] The event handler/listener.
         * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        delegate: function (targets, eventType, selector, fn, scope) {
            return Event.add(targets, eventType, {
                fn: fn,
                scope: scope,
                selector: selector
            });
        },
        /**
         * undelegate event.
         * @param targets KISSY selector
         * @param {String} [eventType] The type of event to undelegate.
         * use space to separate multiple event types.
         * @param {String|Function} [selector] filter selector string or function to find right element
         * @param {Function} [fn] The event handler/listener.
         * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        undelegate: function (targets, eventType, selector, fn, scope) {
            return Event.remove(targets, eventType, {
                fn: fn,
                scope: scope,
                selector: selector
            });
        },

        /**
         * fire event,simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @param targets html nodes
         * @param {String|KISSY.Event.Object} eventType event type
         * @param [eventData] additional event data
         * @param {Boolean} [onlyHandlers] only fire handlers
         * @return {Boolean} The return value of fire/dispatchEvent indicates
         * whether any of the listeners which handled the event called preventDefault.
         * If preventDefault was called the value is false, else the value is true.
         */
        fire: function (targets, eventType, eventData, onlyHandlers/*internal usage*/) {
            var ret = true, r;
            // custom event firing moved to target.js
            eventData = eventData || {};
            eventType = S.trim(eventType);

            if (eventType.indexOf(' ') > -1) {
                _Utils.splitAndRun(eventType, function (t) {
                    r = Event.fire(targets, t, eventData, onlyHandlers);
                    if (ret !== false) {
                        ret = r;
                    }
                });
                return ret;
            }

            // protect event type
            eventData.type = eventType;

            var typedGroups = Utils.getTypedGroups(eventType),
                _ks_groups = typedGroups[1];

            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }

            eventType = typedGroups[0];

            S.mix(eventData, {
                type: eventType,
                _ks_groups: _ks_groups
            });

            targets = DOM.query(targets);

            for (var i = targets.length - 1; i >= 0; i--) {
                var DOMCustomEvents = _Utils.data(targets),
                    DOMCustomEvent = DOMCustomEvents && DOMCustomEvents[eventType];
                if (DOMCustomEvent) {
                    r = DOMCustomEvent.fire(eventData,onlyHandlers);
                    if (ret !== false) {
                        ret = r;
                    }
                }
            }
            return ret;
        },

        /**
         * same with fire but:
         * does not cause default behavior to occur.
         * does not bubble up the DOM hierarchy.
         * @param targets
         * @param {KISSY.Event.Object | String} eventType
         * @param [eventData]
         */
        fireHandler: function (targets, eventType, eventData) {
            return Event.fire(targets, eventType, eventData, 1);
        }
    });

    /**
     * Same with {@link KISSY.Event#add}
     * @method
     * @member KISSY.Event
     */
    Event.on = Event.all;
    /**
     * Same with {@link KISSY.Event#remove}
     * @method
     * @member KISSY.Event
     */
    Event.detach = Event.remove;

    return Event;
}, {
    requires: ['./base', 'dom', './dom/special', './dom/utils', './dom/custom-event', './dom/key-codes']
});