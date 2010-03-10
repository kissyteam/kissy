/**
 * 超级菜单组件
 * @module      megamenu
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yui-base, switchable
 */
KISSY.add('megamenu', function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        NONE = 'none', BLOCK = 'block',
        CLOSEBTN_TMPL = '<span class=\'{hook_cls}\'></span>',
        CLS_PREFIX = 'ks-megamenu-',

        /**
         * 默认配置，和 Switchable 相同的配置此处未列出
         */
        defaultConfig = {
            hideDelay: .5,    // 隐藏延迟

            viewCls: CLS_PREFIX + 'view',
            closeBtnCls: CLS_PREFIX + 'closebtn',

            showCloseBtn: true, // 是否显示关闭按钮

            activeIndex: -1 // 默认没有激活项
        };

    /**
     * @class MegaMenu
     * @constructor
     */
    function MegaMenu(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof MegaMenu)) {
            return new MegaMenu(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        MegaMenu.superclass.constructor.call(self, container, config);

        /**
         * 显示容器
         */
        //self.view

        /**
         * 显示容器里的数据元素
         */
        //self.viewContent

        /**
         * 定时器
         */
        //self.hideTimer

        // init
        self._initView();
        if (self.config.showCloseBtn) self._initCloseBtn();

    }

    S.extend(MegaMenu, S.Switchable);

    S.mix(MegaMenu.prototype, {

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // 重复点击
            if (self.switchTimer) self.switchTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            if (self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index) {
            //S.log('Triggerable._onMouseEnterTrigger: index = ' + index);
            var self = this;
            if (self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            self.switchTimer = Lang.later(self.config.delay * 1000, self, function() {
                self.switchTo(index);
            });
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.switchTimer) self.switchTimer.cancel();

            self.hideTimer = Lang.later(self.config.hideDelay * 1000, self, function() {
                self.hide();
            });
        },

        /**
         * 初始化显示容器
         */
        _initView: function() {
            var self = this, cfg = self.config,
                view = Dom.getElementsByClassName(cfg.viewCls, '*', self.container)[0];

            // 自动生成 view
            if (!view) {
                view = document.createElement('DIV');
                view.className = cfg.viewCls;
                self.container.appendChild(view);
            }

            // init events
            Event.on(view, 'mouseenter', function() {
                if (self.hideTimer) self.hideTimer.cancel();
            });
            Event.on(view, 'mouseleave', function() {
                self.hideTimer = Lang.later(cfg.hideDelay * 1000, self, 'hide');
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

            view.innerHTML = CLOSEBTN_TMPL.replace('{hook_cls}', self.config.closeBtnCls);
            Event.on(view.firstChild, 'click', function() {
                self.hide();
            });

            // 更新 viewContent
            el = document.createElement('div');
            view.appendChild(el);
            self.viewContent = el;
        },

        /**
         * 切换视图内的内容
         * @override
         */
        _switchView: function(oldContents, newContents, index) {
            var self = this;

            // 显示 view
            self.view.style.display = BLOCK;

            // 加载新数据
            self.viewContent.innerHTML = newContents[0].innerHTML;

            // fire onSwitch
            self.fireEvent('onSwitch', index);
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

    S.MegaMenu = MegaMenu;
});

/**
 * TODO:
 *   - 类 YAHOO 首页，内容显示层的位置自适应
 */