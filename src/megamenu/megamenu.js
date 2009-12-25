/**
 * 超级菜单组件
 * @module      megamenu
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yui-base
 */
KISSY.add("megamenu", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        NONE = "none", BLOCK = "block",
        CLOSEBTN_TMPL = "<span class=\"{hook_cls}\"></span>",
        BEFORE_SHOW = "beforeShow",
        ON_HIDE = "onHide",
        CLS_PREFIX = "ks-megamenu-",

        defaultConfig = {

            triggerType: "mouse", // or "click" 触发类型
            triggerDelay: 0.1, // 触发延迟
            hideDelay: .5,    // 隐藏延迟

            // 只支持适度灵活结构，view 可以自动生成
            itemCls: CLS_PREFIX + "item",
            viewCls: CLS_PREFIX + "view",
            contentCls: CLS_PREFIX + "content",
            activeItemCls: CLS_PREFIX + "item-active",
            closeBtnCls: CLS_PREFIX + "closebtn",

            showCloseBtn: true // 是否显示关闭按钮
        };

    /**
     * @class MegaMenu
     * @constructor
     */
    function MegaMenu(container, config) {
        var self = this,
            cfg = S.merge(defaultConfig, config || {});
        
        // factory or constructor
        if (!(self instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        /**
         * 菜单容器
         * @type HTMLElement
         */
        self.container = Dom.get(container);

        /**
         * 配置参数
         * @type Object
         */
        self.config = cfg;

        /**
         * 菜单项
         */
        self.triggers = Dom.getElementsByClassName(cfg.itemCls, "*", container);

        /**
         * 显示容器
         */
        self.view = Dom.getElementsByClassName(cfg.viewCls, "*", container)[0];
        self.view.contentEl = self.view; // contentEl 是放置数据的容器，无关闭按钮时，就是 view 本身。

        /**
         * 内容
         */
        self.contents = [];
        Dom.getElementsByClassName(cfg.contentCls, "*", container, function(each) {
            self.contents.push(each.value || each.innerHTML);
        });

        /**
         * 定时器
         */
        self.showTimer = null;
        self.hideTimer = null;

        /**
         * 当前激活项
         */
        self.activeIndex = -1;

        // init
        self._init();
    }

    S.mix(MegaMenu.prototype, {

        _init: function() {
            var self = this;

            if(self.config.showCloseBtn){
                self._initCloseBtn();
            }

            self._bindUI();
        },

        _initCloseBtn: function() {
            var self = this, el, view = self.view;

            view.innerHTML = CLOSEBTN_TMPL.replace("{hook_cls}", self.config.closeBtnCls);
            Event.on(view.firstChild, "click", function() {
                self.hide();
            });

            el = document.createElement("div");
            view.appendChild(el);
            view.contentEl = el;
        },

        _bindUI: function() {
            var o = this, items = o.triggers, view = o.view,
                delay = o.config.delay, i, len = o.triggers.length;

            for (i = 0; i < len; i++) {
                (function(index) {
                    Event.on(items[index], "mouseover", function() {
                        if(o.hideTimer) o.hideTimer.cancel();

                        // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次显示。
                        if(o.activeIndex !== index) {
                            o.showTimer = Lang.later(delay[0], o, "show", index);
                        }
                    });

                    Event.on(items[index], "mouseout", function() {
                        if(o.showTimer) o.showTimer.cancel();
                        o.hideTimer = Lang.later(delay[1], o, "hide");
                    });
                })(i);
            }

            Event.on(view, "mouseover", function() {
                if (o.hideTimer) o.hideTimer.cancel();
            });

            Event.on(view, "mouseout", function() {
                o.hideTimer = Lang.later(delay[1], o, "hide");
            });
        },

        updateContent: function(index) {
            this.view.contentEl.innerHTML = this.contents[index];
        },

        show: function(index) {
            var o = this, view = o.view,
                activeIndex = o.activeIndex,
                curCls = o.config.activeItemCls;

            // bugfix: YAHOO.lang.later 里的 d = d || [];
            index = index || 0;

            if(activeIndex === index) return; // 重复触发

            // fire event
            o.fireEvent(BEFORE_SHOW, o);

            // show view
            if(view.style.display !== BLOCK) {
                view.style.display = BLOCK;
            }

            // toggle current item
            if(activeIndex >= 0) {
                Dom.removeClass(o.triggers[activeIndex], curCls);
            }
            Dom.addClass(o.triggers[index], curCls);

            // load new content
            o.updateContent(index);

            // update
            o.activeIndex = index;
        },

        hide: function() {
            var o = this;

            // hide current
            Dom.removeClass(o.triggers[o.activeIndex], o.config.activeItemCls);
            o.view.style.display = NONE;

            // update
            o.activeIndex = -1;

            // fire event
            o.fireEvent(ON_HIDE, o);
        }
    });

    S.mix(MegaMenu.prototype, Y.EventProvider.prototype);

    S.MegaMenu = MegaMenu;
});
