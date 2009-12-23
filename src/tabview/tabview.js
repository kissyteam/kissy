/**
 * TabView
 * @module      tabview
 * @creator     淘宝前端架构研发组
 * @depends     yahoo-dom-event, kissy-core, triggerable
 */
KISSY.add("tabview", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        CLS_PREFIX = "ks-tabview-",

        defaultConfig = {
            mackupType: 0, // mackup 的类型，取值如下：

            // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
            navCls: CLS_PREFIX + "nav",
            contentCls: CLS_PREFIX + "content",

            // 1 - 适度灵活结构：通过 cls 来获取 triggers 和 panels
            triggerCls: CLS_PREFIX + "trigger",
            panelCls: CLS_PREFIX + "panel",

            // 2 - 完全自由结构：直接传入 triggers 和 panels
            triggers: [],
            panels: [],

            // 触发类型
            triggerType: "mouse", // or "click"
            // 触发延迟
            triggerDelay: 0.1, // 100ms

            activeIndex: 0, // 为了避免闪烁，mackup的默认激活项，应该与此 index 一致
            activeTriggerCls: CLS_PREFIX + "trigger-active"
        };

    /**
     * TabView
     * @constructor
     */
    function TabView(container, config) {
        // 使 container 支持数组
        if (Lang.isArray(container)) {
            for (var rets = [], i = 0, len = container.length; i < len; i++) {
                rets[rets.length] = new arguments.callee(container[i], config);
            }
            return rets;
        }

        // factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        /**
         * 容器
         * @type HTMLElement
         */
        this.container = Dom.get(container);

        // 根据配置信息，自动调整默认配置
        if(config.triggerCls) {
            defaultConfig.mackupType = 1;
        } else if(config.triggers) {
            defaultConfig.mackupType = 2;
        }

        /**
         * 配置参数
         * @type Object
         */
        this.config = S.merge(defaultConfig, config || {});

        /**
         * triggers
         * @type Array of HTMLElement
         */
        this.triggers = [];

        /**
         * panels
         * @type Array of HTMLElement
         */
        this.panels = [];

        /**
         * 当前激活的 index
         * @type number
         */
        this.activeIndex = this.config.activeIndex;

        // init
        this._init();
    }
    S.augment(TabView, S.Triggerable);

    S.mix(TabView.prototype, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            this._parseMackup();
            this._initTriggers();
        },

        /**
         * 解析 mackup, 获取 triggers 和 panels
         * @protected
         */
        _parseMackup: function() {
            var self = this,
                container = self.container, cfg = self.config,
                nav, content, triggers = [], panels = [], n, m, i, len,
                getElementsByClassName = Dom.getElementsByClassName;

            switch (cfg.mackupType) {
                case 0: // 默认结构
                    nav = getElementsByClassName(cfg.navCls, "*", container)[0];
                    content = getElementsByClassName(cfg.contentCls, "*", container)[0];
                    triggers = Dom.getChildren(nav);
                    panels = Dom.getChildren(content);
                    break;
                case 1: // 适度灵活
                    triggers = getElementsByClassName(cfg.triggerCls, "*", container);
                    panels = getElementsByClassName(cfg.panelCls, "*", container);
                    break;
                case 2: // 完全自由
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }

            // 让 triggers 和 panels 数量匹配
            n = triggers.length;
            m = panels.length;
            for(i = 0, len = n > m ? m : n; i < len; i++) {
                self.triggers.push(triggers[i]);
                self.panels.push(panels[i]);
            }
        }
    });

    S.TabView = TabView;
});
