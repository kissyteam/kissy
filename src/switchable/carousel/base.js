/**
 * Carousel Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/carousel/base', function(S, DOM, Event, Switchable, undefined) {

    var CLS_PREFIX = 'ks-switchable-',
        DOT = '.',
        PREV_BTN = 'prevBtn',
        NEXT_BTN = 'nextBtn';


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
        return 0;
    }

    Carousel.Config = {
        circular: true,
        prevBtnCls: CLS_PREFIX + 'prev-btn',
        nextBtnCls: CLS_PREFIX + 'next-btn',
        disableBtnCls: CLS_PREFIX + 'disable-btn'
    };

    Carousel.Plugins = [];

    S.extend(Carousel, Switchable, {
        /**
         * 插入 carousel 的初始化逻辑
         *
         * Carousel 的初始化逻辑
         * 增加了:
         *   self.prevBtn
         *   self.nextBtn
         */
        _init:function() {
            var self = this;
            Carousel.superclass._init.call(self);
            var cfg = self.config, disableCls = cfg.disableBtnCls,
                switching = false;

            // 获取 prev/next 按钮，并添加事件
            S.each(['prev', 'next'], function(d) {
                var btn = self[d + 'Btn'] = DOM.get(DOT + cfg[d + 'BtnCls'], self.container);

                Event.on(btn, 'click', function(ev) {
                    ev.preventDefault();
                    if (switching) return;
                    if (!DOM.hasClass(btn, disableCls)) self[d]();
                });
            });

            // 注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
            // circular = true 时，无需处理
            if (!cfg.circular) {
                self.on('beforeSwitch', function() {
                    switching = true;
                });
                self.on('switch', function(ev) {
                    var i = ev.currentIndex,
                        disableBtn = (i === 0) ? self[PREV_BTN]
                            : (i === self.length - 1) ? self[NEXT_BTN]
                            : undefined;

                    DOM.removeClass([self[PREV_BTN], self[NEXT_BTN]], disableCls);
                    if (disableBtn) DOM.addClass(disableBtn, disableCls);

                    switching = false;
                });
            }

            // 触发 itemSelected 事件
            Event.on(self.panels, 'click', function() {
                self.fire('itemSelected', { item: this });
            });
        }
    });


    return Carousel;

}, { requires:["dom","event","../base"]});


/**
 * NOTES:
 * 承玉：2011.05
 *  - 内部组件 init 覆盖父类而不是监听事件
 *
 * 2010.07
 *  - 添加对 prevBtn/nextBtn 的支持
 *  - 添加 itemSelected 事件
 *
 * TODO:
 *  - itemSelected 时，自动居中的特性
 */
