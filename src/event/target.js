/**
 * @fileOverview 提供事件发布和订阅机制
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/target', function (S, Event, EventObject, Utils, handle, undefined) {
    var KS_PUBLISH = "__~ks_publish",
        trim = S.trim,
        splitAndRun = Utils.splitAndRun,
        KS_BUBBLE_TARGETS = "__~ks_bubble_targets",
        ALL_EVENT = "*";

    function getCustomEvent(self, type, eventData) {
        if (eventData instanceof EventObject) {
            // set currentTarget in the process of bubbling
            eventData.currentTarget = self;
            return eventData;
        }
        var customEvent = new EventObject(self, undefined, type);
        S.mix(customEvent, eventData);
        return customEvent
    }

    function getEventPublishObj(self) {
        self[KS_PUBLISH] = self[KS_PUBLISH] || {};
        return self[KS_PUBLISH];
    }

    function getBubbleTargetsObj(self) {
        self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || {};
        return self[KS_BUBBLE_TARGETS];
    }

    function isBubblable(self, eventType) {
        var publish = getEventPublishObj(self);
        return publish[eventType] && publish[eventType].bubbles || publish[ALL_EVENT] && publish[ALL_EVENT].bubbles
    }

    function attach(method) {
        return function (type, fn, scope) {
            var self = this;
            type = trim(type);
            splitAndRun(type, function (t) {
                Event["__" + method](false, self, t, fn, scope);
            });
            return self; // chain
        };
    }

    /**
     * 提供事件发布和订阅机制
     * @name Target
     * @constructor
     * @memberOf Event
     */
    var Target =
    /**
     * @lends Event.Target
     */
    {
        /**
         * 触发事件
         * @param {String} type 事件名
         * @param {Object} [eventData] 事件附加信息对象
         * @returns 如果一个 listener 返回false，则返回 false ，否则返回最后一个 listener 的值.
         */
        fire:function (type, eventData) {
            var self = this,
                ret = undefined,
                r2,
                customEvent;
            eventData = eventData || {};
            type = trim(type);
            if (type.indexOf(" ") > 0) {
                splitAndRun(type, function (t) {
                    r2 = self.fire(t, eventData);
                    if (ret !== false) {
                        ret = r2;
                    }
                });
                return ret;
            }
            var typedGroups = Utils.getTypedGroups(type), _ks_groups = typedGroups[1];
            type = typedGroups[0];
            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }
            S.mix(eventData, {
                // protect type
                type:type,
                _ks_groups:_ks_groups
            });
            customEvent = getCustomEvent(self, type, eventData);
            ret = handle(self, customEvent);
            if (!customEvent.isPropagationStopped &&
                isBubblable(self, type)) {
                r2 = self.bubble(type, customEvent);
                // false 优先返回
                if (ret !== false) {
                    ret = r2;
                }
            }
            return ret
        },

        /**
         * defined event config
         * @param type
         * @param cfg
         *        example { bubbles: true}
         *        default bubbles: false
         */
        publish:function (type, cfg) {
            var self = this,
                publish = getEventPublishObj(self);
            type = trim(type);
            if (type) {
                publish[type] = cfg;
            }
        },

        /**
         * bubble event to its targets
         * @param type
         * @param eventData
         */
        bubble:function (type, eventData) {
            var self = this,
                ret = undefined,
                targets = getBubbleTargetsObj(self);
            S.each(targets, function (t) {
                var r2 = t.fire(type, eventData);
                if (ret !== false) {
                    ret = r2;
                }
            });
            return ret;
        },

        /**
         * add target which bubblable event bubbles towards
         * @param target another EventTarget instance
         */
        addTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            targets[S.stamp(target)] = target;
        },

        removeTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            delete targets[S.stamp(target)];
        },

        /**
         * 监听事件
         * @param {String} type 事件名
         * @param {Function} fn 事件处理器
         * @param {Object} scope 事件处理器内的 this 值，默认当前实例
         * @returns 当前实例
         */
        on:attach("add")
    };

    /**
     * 取消监听事件
     * @param {String} type 事件名
     * @param {Function} fn 事件处理器
     * @param {Object} scope 事件处理器内的 this 值，默认当前实例
     * @returns 当前实例
     */
    Target.detach = attach("remove");

    return Target;
}, {
    /*
     实际上只需要 dom/data ，但是不要跨模块引用另一模块的子模块，
     否则会导致build打包文件 dom 和 dom-data 重复载入
     */
    requires:["./base", './object', './utils', './handle']
});
/**
 *  yiminghe:2011-10-17
 *   - implement bubble for custom event
 **/