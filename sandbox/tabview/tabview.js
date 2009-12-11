/**
 * Tab 切换组件
 * @module      tabview
 * @creator     云谦<yunqian@taobao.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("tabview", function(S) {

    if (!Array.prototype.indexOf) {
        /**
         * 获取元素在数组中的位置
         *
         * @param {Object} obj 元素
         * @param {Number} fromIndex 起始位置
         * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
         * @return Intger
         */
        Array.prototype.indexOf = function (obj, fromIndex) {
            if (fromIndex == null) {
                fromIndex = 0;
            } else if (fromIndex < 0) {
                fromIndex = Math.max(0, this.length + fromIndex);
            }
            for (var i = fromIndex; i < this.length; i++) {
                if (this[i] === obj)
                    return i;
            }
            return -1;
        };
    }

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,

        /**
         * 默认配置
         */
        defaultConfig = {
            eventType:      'click',        // 事件类型，还可设为mouse
            holderClass:    'tab-holder',   // tab holder的classname
            holderTagname:  'ul',           // tab holder的tagname
            triggerTagname: 'li',           // trigger的tagname
            panelClass:     'tab-panel',    // tab panel的classname
            autoTabIdx:     0,              // 自动选中的tab序号，null为不选
            stopEvent:      true,           // 停止事件传播
            onSwitch:       null,           // 切换tab时执行的自定义事件
            delay:          0.1             // 延时切换，单位：秒，仅在eventType为mouse时有效
        },

        /**
         * 延时切换定时器
         */
        timer = null;

    var Tab = function(container, config) {
        // 使container支持数组
        if (Lang.isArray(container)) {
            var rets = [], i = 0, len = container.length;
            for (; i < len; i++) {
                rets[rets.length] = new arguments.callee(container[i], config);
            }
            return rets;
        }

        // Factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        /**
         * 所在容器
         */
        this.container = Dom.get(container);

        /**
         * 配置参数
         * @type Object
         */
        this.config = Lang.merge(defaultConfig, config || {});

        this.init();
    };

    /**
     * 载入延时加载panel里的图片
     * @param container
     */
    function loadImgs(container) {
        var imgs = container.getElementsByTagName('img'),
                i = 0,
                len = imgs.length;

        for (; i < len; i++) {
            imgs[i].src = imgs[i].getAttribute('data-lazyload-src');
            imgs[i].removeAttribute('data-lazyload-src');
        }
    }

    S.mix(Tab.prototype, {
        /**
         * 初始化
         * @protected
         */
        init: function() {
            var t = this,
                    c = t.config,
                    holder, triggerBoxes, triggers, panels;

            // 获取元素
            holder = Dom.getElementsByClassName(c.holderClass, c.holderTagname, t.container)[0];
            triggerBoxes = holder.getElementsByTagName('li');
            triggers = c.triggerTagname === 'li' ? triggerBoxes : holder.getElementsByTagName('a');
            panels = Dom.getElementsByClassName(c.panelClass, 'div', t.container);

            // 创建自定义事件
            t.createEvent('switch');
            c.onSwitch && t.subscribe('switch', c.onSwitch);

            // 绑定事件
            if (c.eventType === 'mouse') {
                Event.on(triggers, 'focus', t['focusHandler'], {scope: t});
                Event.on(triggers, 'mouseover', t['mouseoverHandler'], {scope: t});
                Event.on(triggers, 'mouseout', t['mouseoutHandler']);
            }
            Event.on(triggers, 'click', t['focusHandler'], {scope: t});

            // hook to class
            t.triggerBoxes = triggerBoxes;
            t.triggers = triggers;
            t.panels = panels;

            // 自动选择
            if (c.autoTabIdx !== null) {
                t.switchTo(c.autoTabIdx);
            }
        },

        /**
         * focus 事件处理器
         * @param {Event} e
         * @param {Object} o
         * @protected
         */
        focusHandler: function(e, o) {
            var t = o.scope,
                    c = t.config,
                    idx = Array.prototype.indexOf.call(t.triggers, this);

            timer && timer.cancel();
            t.switchTo(idx);

            // ie下不是"第一手"的e，typeof e.type为unknown
            if (c.stopEvent && typeof e.type !== 'unknown' && e.type === 'click') {
                Event.stopEvent(e);
            }
        },

        /**
         * mouseover 事件处理器
         * @param {Event} e
         * @param {Object} o
         * @protected
         */
        mouseoverHandler: function(e, o) {
            var t = o.scope,
                    c = t.config,
                    rt = Event.getRelatedTarget(e);

            if (rt !== this && !Dom.isAncestor(this, rt)) {
                t[c.delay ? 'delayHandler' : 'focusHandler'].call(this, e, o);
            }
        },

        /**
         * delay 事件处理器
         * @param {Event} e
         * @param {Object} o
         * @protected
         */
        delayHandler: function(e, o) {
            var t = o.scope;

            timer = Lang.later(t.config.delay * 1000, this, t['focusHandler'], [e, o]);
        },

        /**
         * mouseout 事件处理器
         * @param {Event} e
         * @protected
         */
        mouseoutHandler: function(e) {
            var rt = Event.getRelatedTarget(e);

            if (rt !== this && !Dom.isAncestor(this, rt)) {
                timer && timer.cancel();
            }
        },

        /**
         * 切换到某个Tab
         * @param {Number} idx
         * @public
         */
        switchTo: function(idx) {
            var t = this,
                    r = Dom.removeClass,
                    a = Dom.addClass;

            a(t.panels, 'hidden');
            r(t.panels[idx], 'hidden');
            r(t.triggerBoxes, 'selected');
            a(t.triggerBoxes[idx], 'selected');

            if (t.triggerBoxes[idx].getAttribute('data-lazyload')) {
                loadImgs(t.panels[idx]);
                t.triggerBoxes[idx].removeAttribute('data-lazyload');
            }

            t.fireEvent('switch');
        }
    });

    S.mix(Tab.prototype, Y.EventProvider.prototype);

    S.TabView = Tab;
});
