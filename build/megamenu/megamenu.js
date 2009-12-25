/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-25 17:10:12
Revision: 359
*/
/**
 * 超级菜单组件
 * @module      megamenu
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yui-base, triggerable
 */
KISSY.add("megamenu", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        NONE = "none", BLOCK = "block",
        CLOSEBTN_TMPL = "<span class=\"{hook_cls}\"></span>",
        CLS_PREFIX = "ks-megamenu-",

        defaultConfig = {

            triggerType: "mouse", // or "click" 触发类型
            triggerDelay: 0.1, // 触发延迟
            hideDelay: .5,    // 隐藏延迟

            // 只支持适度灵活结构，view 可以自动生成
            triggerCls: CLS_PREFIX + "trigger",
            viewCls: CLS_PREFIX + "view",
            contentCls: CLS_PREFIX + "content",
            activeTriggerCls: CLS_PREFIX + "trigger-active",
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
        self.triggers = Dom.getElementsByClassName(cfg.triggerCls, "*", container);

        /**
         * 显示容器
         */
        //self.view

        /**
         * 显示容器里的数据元素
         */
        //self.viewContent

        /**
         * 内容
         */
        self.contents = [];
        Dom.getElementsByClassName(cfg.contentCls, "*", container, function(each) {
            self.contents.push(each.value || each.innerHTML);
        });
        self.panels = self.contents; // for Triggerable

        /**
         * 定时器
         */
        //self.showTimer = null;
        //self.hideTimer = null;

        /**
         * 当前激活项
         */
        self.activeIndex = -1;

        // init
        self._init();
    }

    S.mix(MegaMenu.prototype, {

        /**
         * 初始化操作
         * @protected
         */
        _init: function() {
            var self = this;

            self._initTriggers();
            self._initView();
            if(self.config.showCloseBtn) self._initCloseBtn();
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         * @protected
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // 重复点击
            if (self.showTimer) self.showTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            if(self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         * @protected
         */
        _onMouseEnterTrigger: function(index) {
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);
            var self = this;
            if(self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            self.showTimer = Lang.later(self.config.triggerDelay * 1000, self, function() {
                self.switchTo(index);
            });
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         * @protected
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.showTimer) self.showTimer.cancel();

            self.hideTimer = Lang.later(self.config.hideDelay * 1000, self, function() {
                self.hide();
            });
        },

        /**
         * 初始化显示容器
         * @protected
         */
        _initView: function() {
            var self = this, cfg = self.config,
                view = Dom.getElementsByClassName(cfg.viewCls, "*", self.container)[0];

            // 自动生成 view
            if(!view) {
                view = document.createElement("DIV");
                view.className = cfg.viewCls;
                self.container.appendChild(view);
            }

            // init events
            Event.on(view, "mouseenter", function() {
                if(self.hideTimer) self.hideTimer.cancel();
            });
            Event.on(view, "mouseleave", function() {
                self.hideTimer = Lang.later(cfg.hideDelay * 1000, self, "hide");
            });

            // viewContent 是放置数据的容器，无关闭按钮时，就是 view 本身
            self.viewContent = view;
            self.view = view;
        },

        /**
         * 初始化关闭按钮
         * @protected
         */
        _initCloseBtn: function() {
            var self = this, el, view = self.view;

            view.innerHTML = CLOSEBTN_TMPL.replace("{hook_cls}", self.config.closeBtnCls);
            Event.on(view.firstChild, "click", function() {
                self.hide();
            });

            // 更新 viewContent
            el = document.createElement("div");
            view.appendChild(el);
            self.viewContent = el;
        },

        /**
         * 切换内容
         * @protected
         */
        _switchContent: function(oldContent, newContent, index) {
            var self = this;

            // 显示 view
            self.view.style.display = BLOCK;

            // 加载新数据
            self.viewContent.innerHTML = newContent;

            // fire onSwitch
            self.fireEvent("onSwitch", index);
        },

        /**
         * 隐藏内容
         */
        hide: function() {
            var self = this;

            // hide current
            Dom.removeClass(self.triggers[self.activeIndex], self.config.activeTriggerCls);
            self.view.style.display = NONE;

            // update
            self.activeIndex = -1;
        }
    });

    S.augment(MegaMenu, S.Triggerable, false);
    S.MegaMenu = MegaMenu;
});
