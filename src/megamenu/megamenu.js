/**
 * 超级菜单组件
 * @module      megamenu
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("megamenu", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        NONE = "none",
        BLOCK = "block",
        CLOSEBTN_TMPL = '<span class="{hook_cls}"></span>',
        BEFORE_SHOW = "beforeShow",
        ON_HIDE = "onHide",

        defaultConfig = {

            /**
             * 延迟时间
             *  [x,y] - x 表示显示时的延迟，y 表示隐藏时的延迟
             *  x     - 表示上面的 y 和 x 一样
             */
            delay: [0.1, 0.5],

            // class
            itemCls: "ks-megamenu-item",
            viewCls: "ks-megamenu-view",
            contentCls: "ks-megamenu-content",
            currentItemCls: "ks-megamenu-item-current",
            closeBtnCls: "ks-megamenu-closebtn",

            /**
             * 是否显示关闭按钮
             */
            showCloseBtn: true
        };

    /**
     * @class MegaMenu
     * @constructor
     */
    function MegaMenu(container, config) {
        // factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        /**
         * 菜单容器
         * @type HTMLElement
         */
        this.container = Dom.get(container);

        /**
         * 配置参数
         * @type Object
         */
        var cfg = S.merge(defaultConfig, config || {});
        cfg.delay[0] *= 1000;
        cfg.delay[1] *= 1000;
        this.config = cfg;

        /**
         * 菜单项
         */
        this.items = Dom.getElementsByClassName(cfg.itemCls, "*", container);

        /**
         * 显示容器
         */
        this.view = Dom.getElementsByClassName(cfg.viewCls, "*", container)[0];
        this.view.contentEl = this.view; // dataEl 是放置数据的容器，无关闭按钮时，就是 view 本身。

        /**
         * 内容
         */
        this.contents = [];
        Dom.getElementsByClassName(cfg.contentCls, "*", container, function(each) {
            this.contents.push(each.value || each.innerHTML);
        }, this, true);

        /**
         * 定时器
         */
        this.showTimer = null;
        this.hideTimer = null;

        /**
         * 当前激活项
         */
        this.activeIndex = -1;

        // go
        this._init();
    }

    S.mix(MegaMenu.prototype, {

        _init: function() {
            var o = this;

            if(o.config.showCloseBtn){
                o._initCloseBtn();
            }

            o._bindUI();
        },

        _initCloseBtn: function() {
            var o = this, el, view = o.view;

            view.innerHTML = CLOSEBTN_TMPL.replace("{hook_cls}", o.config.closeBtnCls);
            Event.on(view.firstChild, "click", function() {
                o.hide();
            });

            el = document.createElement("div");
            view.appendChild(el);
            view.contentEl = el;
        },

        _bindUI: function() {
            var o = this, items = o.items, view = o.view,
                delay = o.config.delay, i, len = o.items.length;

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
                curCls = o.config.currentItemCls;

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
                Dom.removeClass(o.items[activeIndex], curCls);
            }
            Dom.addClass(o.items[index], curCls);

            // load new content
            o.updateContent(index);

            // update
            o.activeIndex = index;
        },

        hide: function() {
            var o = this;

            // hide current
            Dom.removeClass(o.items[o.activeIndex], o.config.currentItemCls);
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
