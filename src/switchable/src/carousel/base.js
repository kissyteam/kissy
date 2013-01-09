/**
 *  Carousel Widget
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('switchable/carousel/base', function (S, DOM, Event, Switchable) {

    var CLS_PREFIX = 'ks-switchable-',
        DOT = '.',
        EVENT_ADDED = 'added',
        EVENT_REMOVED = 'removed',
        PREV_BTN = 'prevBtn',
        NEXT_BTN = 'nextBtn',
        DOM_EVENT = {originalEvent:{target:1}};

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {

        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        // call super
        Carousel.superclass.constructor.apply(self, arguments);
    }

    Carousel.Config = {
        circular:true,
        prevBtnCls:CLS_PREFIX + 'prev-btn',
        nextBtnCls:CLS_PREFIX + 'next-btn',
        disableBtnCls:CLS_PREFIX + 'disable-btn'

    };

    S.extend(Carousel, Switchable, {
        /**
         * 插入 carousel 的初始化逻辑
         *
         * Carousel 的初始化逻辑
         * 增加了:
         *   self.prevBtn
         *   self.nextBtn
         */
        _init:function () {
            var self = this;
            Carousel.superclass._init.call(self);
            var cfg = self.config,
                disableCls = cfg.disableBtnCls;

            // 获取 prev/next 按钮，并添加事件
            S.each(['prev', 'next'], function (d) {
                var btn = self[d + 'Btn'] = DOM.get(DOT + cfg[d + 'BtnCls'],
                    self.container);

                Event.on(btn, 'mousedown', function (ev) {
                    ev.preventDefault();

                    var activeIndex = self.activeIndex;

                    if (d == "prev" && (activeIndex != 0 || cfg.circular)) {
                        self[d](DOM_EVENT);
                    }
                    if (d == "next" && (activeIndex != self.length - 1 || cfg.circular)) {
                        self[d](DOM_EVENT);
                    }
                });
            });

            function updateBtnStatus(current) {
                DOM.removeClass([self[PREV_BTN], self[NEXT_BTN]], disableCls);

                if (current == 0) {
                    DOM.addClass(self[PREV_BTN], disableCls);
                }

                if (current == self.length - 1) {
                    DOM.addClass(self[NEXT_BTN], disableCls);
                }
            }


            // 注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
            // circular = true 时，无需处理
            if (!cfg.circular) {
                // 先动画再 remove
                // switch 事件先于 removed
                self.on(EVENT_ADDED + " " + EVENT_REMOVED, function () {
                    updateBtnStatus(self.activeIndex);
                });

                self.on('switch', function (ev) {
                    updateBtnStatus(ev.currentIndex);
                });
            }
            // 触发 itemSelected 事件
            Event.delegate(self.content, 'click', DOT + self._panelInternalCls, function (e) {
                var item = e.currentTarget;
                self.fire('itemSelected', { item:item });
            });
        }
    });


    return Carousel;

}, { requires:["dom", "event", "../base"]});


/**
 * NOTES:
 *
 * yiminghe@gmail.com：2012.03.08
 *  - 修复快速点击上页/下页，动画没完时 disabled class 没设导致的翻页超出
 *
 * yiminghe@gmail.com：2011.06.02 review switchable
 *
 * yiminghe@gmail.com：2011.05
 *  - 内部组件 init 覆盖父类而不是监听事件
 *
 * 2010.07
 *  - 添加对 prevBtn/nextBtn 的支持
 *  - 添加 itemSelected 事件
 * 2012-3-7 董晓庆
 *  - itemSelected 事件 改为委托
 * TODO:
 *  - itemSelected 时，自动居中的特性
 */
