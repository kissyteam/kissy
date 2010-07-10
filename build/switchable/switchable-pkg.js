/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 846 Jul 11 00:10
*/
/**
 * Switchable
 * @creator     ��<lifesinger@gmail.com>
 * @depends     kissy-core, yui2-animation
 */
KISSY.add('switchable', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        doc = document,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        FORWARD = 'forward', BACKWARD = 'backward',
        DOT = '.',
        EVENT_BEFORE_SWITCH = 'beforeSwitch', EVENT_SWITCH = 'switch',
        CLS_PREFIX = 'ks-switchable-',
        SP = Switchable.prototype;

    /**
     * Switchable Widget
     * attached members��
     *   - this.container
     *   - this.config
     *   - this.triggers  ����Ϊ��ֵ []
     *   - this.panels    �϶���ֵ���� length > 1
     *   - this.content
     *   - this.length
     *   - this.activeIndex
     *   - this.switchTimer
     */
    function Switchable(container, config) {
        var self = this;

        // ����������Ϣ
        config = config || {};
        if (!('markupType' in config)) {
            if (config.panelCls) {
                config.markupType = 1;
            } else if (config.panels) {
                config.markupType = 2;
            }
        }
        config = S.merge(Switchable.Config, config);

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = S.get(container);

        /**
         * ���ò���
         * @type Object
         */
        self.config = config;

        /**
         * triggers
         * @type Array of HTMLElement
         */
        self.triggers = self.triggers || [];

        /**
         * panels
         * @type Array of HTMLElement
         */
        self.panels = self.panels || [];

        /**
         * length = panels.length / steps
         * @type number
         */
        //self.length

        /**
         * the parentNode of panels
         * @type HTMLElement
         */
        //self.content

        /**
         * ��ǰ����� index
         * @type number
         */
        if (self.activeIndex === undefined) {
            self.activeIndex = config.activeIndex;
        }

        self._init();
    }

    // Ĭ������
    Switchable.Config = {
        markupType: 0, // markup �����ͣ�ȡֵ���£�

        // 0 - Ĭ�Ͻṹ��ͨ�� nav �� content ����ȡ triggers �� panels
        navCls: CLS_PREFIX + 'nav',
        contentCls: CLS_PREFIX + 'content',

        // 1 - �ʶ���ͨ�� cls ����ȡ triggers �� panels
        triggerCls: CLS_PREFIX + 'trigger',
        panelCls: CLS_PREFIX + 'panel',

        // 2 - ��ȫ���ɣ�ֱ�Ӵ��� triggers �� panels
        triggers: [],
        panels: [],

        // �Ƿ��д���
        hasTriggers: true,

        // ��������
        triggerType: 'mouse', // or 'click'
        // �����ӳ�
        delay: .1, // 100ms

        activeIndex: 0, // markup ��Ĭ�ϼ����Ӧ����� index һ��
        activeTriggerCls: 'active',

        // �ɼ���ͼ���ж��ٸ� panels
        steps: 1,

        // �ɼ���ͼ����Ĵ�С��һ�㲻��Ҫ�趨��ֵ��������ȡֵ����ȷʱ�������ֹ�ָ����С
        viewSize: []
    };

    // ���
    Switchable.Plugins = [];

    S.mix(SP, {

        /**
         * init switchable
         */
        _init: function() {
            var self = this, cfg = self.config;

            // parse markup
            if (self.panels.length === 0) {
                self._parseMarkup();
            }

            // bind triggers
            if (cfg.hasTriggers) {
                self._bindTriggers();
            }

            // init plugins
            S.each(Switchable.Plugins, function(plugin) {
                if(plugin.init) {
                    plugin.init(self);
                }
            });
        },

        /**
         * ���� markup, ��ȡ triggers, panels, content
         */
        _parseMarkup: function() {
            var self = this, container = self.container,
                cfg = self.config,
                hasTriggers = cfg.hasTriggers,
                nav, content, triggers = [], panels = [], i, n, m;

            switch (cfg.markupType) {
                case 0: // Ĭ�Ͻṹ
                    nav = S.get(DOT + cfg.navCls, container);
                    if (nav) {
                        triggers = DOM.children(nav);
                    }
                    content = S.get(DOT + cfg.contentCls, container);
                    panels = DOM.children(content);
                    break;
                case 1: // �ʶ����
                    triggers = S.query(DOT + cfg.triggerCls, container);
                    panels = S.query(DOT + cfg.panelCls, container);
                    break;
                case 2: // ��ȫ����
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }


            // get length
            n = panels.length;
            self.length = n / cfg.steps;

            // �Զ���� triggers
            if (hasTriggers && n > 0 && triggers.length === 0) {
                triggers = self._generateTriggersMarkup(self.length);
            }

            // �� triggers �� panels ת��Ϊ��ͨ����
            self.triggers = S.makeArray(triggers);
            self.panels = S.makeArray(panels);

            // get content
            self.content = content || panels[0].parentNode;
        },

        /**
         * �Զ���� triggers �� markup
         */
        _generateTriggersMarkup: function(len) {
            var self = this, cfg = self.config,
                ul = doc.createElement('UL'), li, i;

            ul.className = cfg.navCls;
            for (i = 0; i < len; i++) {
                li = doc.createElement('LI');
                if (i === self.activeIndex) {
                    li.className = cfg.activeTriggerCls;
                }
                li.innerHTML = i + 1;
                ul.appendChild(li);
            }

            self.container.appendChild(ul);
            return DOM.children(ul);
        },

        /**
         * �� triggers ����¼�
         */
        _bindTriggers: function() {
            var self = this, cfg = self.config,
                triggers = self.triggers, trigger,
                i, len = triggers.length;

            for (i = 0; i < len; i++) {
                (function(index) {
                    trigger = triggers[index];

                    // ��Ӧ����� Tab ��
                    Event.on(trigger, 'click focus', function() {
                        self._onFocusTrigger(index);
                    });

                    // ��Ӧ�����
                    if (cfg.triggerType === 'mouse') {
                        Event.on(trigger, 'mouseenter', function() {
                            self._onMouseEnterTrigger(index);
                        });
                        Event.on(trigger, 'mouseleave', function() {
                            self._onMouseLeaveTrigger(index);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab ��� trigger ʱ�������¼�
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // �ظ����
            if (self.switchTimer) self.switchTimer.cancel(); // ���磺��������̵������ʱ���¼�����ȡ���
            self.switchTo(index);
        },

        /**
         * ������� trigger ��ʱ�������¼�
         */
        _onMouseEnterTrigger: function(index) {
            var self = this;
            //S.log('Triggerable._onMouseEnterTrigger: index = ' + index);

            // ���ظ����������磺����ʾ����ʱ���������ٻ����ٻ����������ش���
            if (self.activeIndex !== index) {
                self.switchTimer = S.later(function() {
                    self.switchTo(index);
                }, self.config.delay * 1000);
            }
        },

        /**
         * ����Ƴ� trigger ʱ�������¼�
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.switchTimer) self.switchTimer.cancel();
        },

        /**
         * �л�����
         */
        switchTo: function(index, direction) {
            var self = this, cfg = self.config,
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex,
                steps = cfg.steps,
                fromIndex = activeIndex * steps, toIndex = index * steps;
            //S.log('Triggerable.switchTo: index = ' + index);

            if (index === activeIndex) return self;
            if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) return self;

            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers[activeIndex] : null, triggers[index]);
            }

            // switch active panels
            if (direction === undefined) {
                direction = index > activeIndex ? FORWARD : BACKWARD;
            }

            self._switchView(
                panels.slice(fromIndex, fromIndex + steps),
                panels.slice(toIndex, toIndex + steps),
                index,
                direction);

            // update activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * �л���ǰ����
         */
        _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
            var activeTriggerCls = this.config.activeTriggerCls;

            if (fromTrigger) DOM.removeClass(fromTrigger, activeTriggerCls);
            DOM.addClass(toTrigger, activeTriggerCls);
        },

        /**
         * �л���ͼ
         */
        _switchView: function(fromPanels, toPanels/*, index, direction*/) {
            // ��򵥵��л�Ч��ֱ������/��ʾ
            DOM.css(fromPanels, DISPLAY, NONE);
            DOM.css(toPanels, DISPLAY, BLOCK);

            // fire onSwitch
            this.fire(EVENT_SWITCH);
        },

        /**
         * �л�����һ��ͼ
         */
        prev: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex > 0 ? activeIndex - 1 : self.length - 1, BACKWARD);
        },

        /**
         * �л�����һ��ͼ
         */
        next: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex < self.length - 1 ? activeIndex + 1 : 0, FORWARD);
        }
    });

    S.mix(SP, S.EventTarget);
    
    S.Switchable = Switchable;
});

/**
 * NOTES:
 *
 * 2010.04
 *  - �ع�������� yahoo-dom-event ������
 *
 * 2010.03
 *  - �ع���ȥ�� Widget, ���ִ���ֱ�Ӳ��� kissy ���
 *  - ������ƴ� weave ֯�뷨�ĳ� hook ���ӷ�
 *
 * TODO:
 *  - http://malsup.com/jquery/cycle/
 *  - http://www.mall.taobao.com/go/chn/mall_chl/flagship.php
 * 
 * References:
 *  - jQuery Scrollable http://flowplayer.org/tools/scrollable.html
 *
 */
/**
 * Switchable Autoplay Plugin
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('switchable-autoplay', function(S) {

    var Event = S.Event,
        Switchable = S.Switchable;

    /**
     * ���Ĭ������
     */
    S.mix(Switchable.Config, {
        autoplay: false,
        interval: 5, // �Զ����ż��ʱ��
        pauseOnHover: true  // triggerType Ϊ mouse ʱ�������ͣ�� slide ���Ƿ���ͣ�Զ�����
    });

    /**
     * ��Ӳ��
     * attached members:
     *   - this.paused
     *   - this.autoplayTimer
     */
    Switchable.Plugins.push({
        name: 'autoplay',

        init: function(host) {
            var cfg = host.config;
            if (!cfg.autoplay) return;

            // �����ͣ��ֹͣ�Զ�����
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', function() {
                    host.paused = true;
                });
                Event.on(host.container, 'mouseleave', function() {
                    // ���� interval Ϊ 10s
                    // �� 8s ʱ��ͨ�� focus ���������л���ͣ�� 1s ������Ƴ�
                    // ��ʱ��� setTimeout, �ٹ� 1s ������������ panel �����滻��
                    // Ϊ�˱�֤ÿ�� panel ����ʾʱ�䶼��С�� interval, �˴����� setTimeout
                    setTimeout(function() {
                        host.paused = false;
                    }, cfg.interval * 1000);
                });
            }

            // �����Զ�����
            host.autoplayTimer = S.later(function() {
                if (host.paused) return;
                host.switchTo(host.activeIndex < host.length - 1 ? host.activeIndex + 1 : 0);
            }, cfg.interval * 1000, true);
        }
    });
});

/**
 * TODO:
 *  - �Ƿ���Ҫ�ṩ play / pause / stop API ?
 *  - autoplayTimer �� switchTimer �Ĺ�����
 */
/**
 * Switchable Effect Plugin
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('switchable-effect', function(S) {

    var Y = YAHOO.util, DOM = S.DOM, YDOM = Y.Dom,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        OPACITY = 'opacity', Z_INDEX = 'z-index',
        RELATIVE = 'relative', ABSOLUTE = 'absolute',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly', FADE = 'fade',
        Switchable = S.Switchable, Effects;

    /**
     * ���Ĭ������
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' ����ֱ�Ӵ��� custom effect fn
        duration: .5, // ������ʱ��
        easing: Y.Easing.easeNone // easing method
    });

    /**
     * ����Ч��
     */
    Switchable.Effects = {

        // �����ص���ʾ/����Ч��
        none: function(fromEls, toEls, callback) {
            DOM.css(fromEls, DISPLAY, NONE);
            DOM.css(toEls, DISPLAY, BLOCK);
            callback();
        },

        // ��������Ч��
        fade: function(fromEls, toEls, callback) {
            if(fromEls.length !== 1) {
                S.error('fade effect only supports steps == 1.');
            }
            var self = this, cfg = self.config,
                fromEl = fromEls[0], toEl = toEls[0];
            if (self.anim) self.anim.stop();

            // ������ʾ��һ��
            YDOM.setStyle(toEl, OPACITY, 1);

            // �����л�
            self.anim = new Y.Anim(fromEl, {opacity: {to: 0}}, cfg.duration, cfg.easing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free

                // �л� z-index
                YDOM.setStyle(toEl, Z_INDEX, 9);
                YDOM.setStyle(fromEl, Z_INDEX, 1);

                callback();
            });
            self.anim.animate();
        },

        // ˮƽ/��ֱ����Ч��
        scroll: function(fromEls, toEls, callback, index) {
            var self = this, cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * index,
                attributes = {};

            attributes[isX ? 'left' : 'top'] = { to: -diff };

            if (self.anim) self.anim.stop();
            self.anim = new Y.Anim(self.content, attributes, cfg.duration, cfg.easing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free
                callback();
            });
            self.anim.animate();
        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * ��Ӳ��
     * attached members:
     *   - this.viewSize
     */
    Switchable.Plugins.push({
        name: 'effect',

        /**
         * ��� effect, �����ʼ״̬
         */
        init: function(host) {
            var cfg = host.config,
                effect = cfg.effect,
                panels = host.panels,
                steps = cfg.steps,
                activeIndex = host.activeIndex,
                fromIndex = activeIndex * steps,
                toIndex = fromIndex + steps - 1,
                i, len = panels.length;

            // 1. ��ȡ�߿�
            host.viewSize = [
                cfg.viewSize[0] || panels[0].offsetWidth * steps,
                cfg.viewSize[0] || panels[0].offsetHeight * steps
            ];
            // ע������ panel �ĳߴ�Ӧ����ͬ
            //    ���ָ����һ�� panel �� width �� height����Ϊ Safari �£�ͼƬδ����ʱ����ȡ�� offsetHeight ��ֵ�᲻��

            // 2. ��ʼ�� panels ��ʽ
            if (effect !== NONE) { // effect = scrollx, scrolly, fade
                // ��Щ��Ч��Ҫ�� panels ����ʾ����
                for (i = 0; i < len; i++) {
                    panels[i].style.display = BLOCK;
                }

                switch (effect) {
                    // ����ǹ���Ч��
                    case SCROLLX:
                    case SCROLLY:
                        // ���ö�λ��Ϣ��Ϊ����Ч�����̵�
                        host.content.style.position = ABSOLUTE;
                        host.content.parentNode.style.position = RELATIVE; // ע��content �ĸ�����һ���� container

                        // ˮƽ����
                        if (effect === SCROLLX) {
                            YDOM.setStyle(panels, 'float', 'left');

                            // ��������ȣ��Ա�֤�пռ��� panels ˮƽ�Ų�
                            host.content.style.width = host.viewSize[0] * (len / steps) + 'px';
                        }
                        break;

                    // �����͸��Ч�����ʼ��͸��
                    case FADE:
                        for (i = 0; i < len; i++) {
                            YDOM.setStyle(panels[i], OPACITY, (i >= fromIndex && i <= toIndex) ? 1 : 0);
                            panels[i].style.position = ABSOLUTE;
                            panels[i].style.zIndex = (i >= fromIndex && i <= toIndex) ? 9 : 1;
                        }
                        break;
                }
            }

            // 3. �� CSS ���Ҫ�� container �趨�߿�� overflow: hidden
            //    nav �� cls �� CSS ָ��
        }
    });

    /**
     * �����л�����
     */
    S.mix(Switchable.prototype, {
        /**
         * �л���ͼ
         */
        _switchView: function(fromEls, toEls, index, direction) {
            var self = this, cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, fromEls, toEls, function() {
                self.fire('switch');
            }, index, direction);
        }
    });
});

/**
 * TODO:
 *  - apple ��ҳЧ��
 */
/**
 * Switchable Circular Plugin
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('switchable-circular', function(S) {

    var RELATIVE = 'relative',
        LEFT = 'left', TOP = 'top',
        PX = 'px', EMPTY = '',
        FORWARD = 'forward', BACKWARD = 'backward',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly',
        Switchable = S.Switchable;

    /**
     * ���Ĭ������
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    /**
     * ѭ������Ч����
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this, cfg = self.config,
            len = self.length,
            activeIndex = self.activeIndex,
            isX = cfg.scrollType === SCROLLX,
            prop = isX ? LEFT : TOP,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            attributes = {},
            isCritical,
            isBackward = direction === BACKWARD;

        // �ӵ�һ��������������һ�� or �����һ�������������һ��
        isCritical = (isBackward && activeIndex === 0 && index === len - 1)
                     || (direction === FORWARD && activeIndex === len - 1 && index === 0);

        if(isCritical) {
            // ����λ�ò���ȡ diff
            diff = adjustPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
        }
        attributes[prop] = { to: diff };

        // ��ʼ����
        if (self.anim) self.anim.stop();
        self.anim = new YAHOO.util.Anim(self.content, attributes, cfg.duration, cfg.easing);
        self.anim.onComplete.subscribe(function() {
            if(isCritical) {
                // ��ԭλ��
                resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
            }
            // free
            self.anim = null;
            callback();
        });
        self.anim.animate();
    }

    /**
     * ����λ��
     */
    function adjustPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // ���� panels ����һ����ͼ��
        for (i = from; i < to; i++) {
            panels[i].style.position = RELATIVE;
            panels[i].style[prop] = (isBackward ? '-' : EMPTY) + viewDiff * len + PX;
        }

        // ƫ����
        return isBackward ? viewDiff : -viewDiff * len;
    }

    /**
     * ��ԭλ��
     */
    function resetPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // ������ɺ󣬸�λ����״̬
        for (i = from; i < to; i++) {
            panels[i].style.position = EMPTY;
            panels[i].style[prop] = EMPTY;
        }

        // ˲�Ƶ���λ��
        self.content.style[prop] = isBackward ? -viewDiff * (len - 1) + PX : EMPTY;
    }

    /**
     * ��Ӳ��
     */
    Switchable.Plugins.push({
        name: 'circular',

        /**
         * ��� effect, �����ʼ״̬
         */
        init: function(host) {
            var cfg = host.config;

            // ���й���Ч����Ҫ����ĵ���
            if (cfg.circular && (cfg.effect === SCROLLX || cfg.effect === SCROLLY)) {
                // ���ǹ���Ч����
                cfg.scrollType = cfg.effect; // ���浽 scrollType ��
                cfg.effect = circularScroll;
            }
        }
    });
});

/**
 * TODO:
 *   - �Ƿ���Ҫ���Ǵ� 0 �� 2�������һ���� �� backward ��������Ҫ�����
 */
/**
 * Switchable Lazyload Plugin
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('switchable-lazyload', function(S) {

    var DOM = S.DOM,
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img-src',
        TEXTAREA_DATA = 'textarea-data',
        FLAGS = { },
        Switchable = S.Switchable,
        DataLazyload = S.DataLazyload;

    FLAGS[IMG_SRC] = 'data-lazyload-src-custom';
    FLAGS[TEXTAREA_DATA] = 'ks-datalazyload-custom';

    /**
     * ���Ĭ������
     */
    S.mix(Switchable.Config, {
        lazyDataType: '', // 'img-src' or 'textarea-data'
        lazyDataFlag: ''  // 'data-lazyload-src-custom' or 'ks-datalazyload-custom'
    });

    /**
     * ֯���ʼ������
     */
    Switchable.Plugins.push({
        name: 'autoplay',

        init: function(host) {
            var cfg = host.config,
                type = cfg.lazyDataType, flag = cfg.lazyDataFlag || FLAGS[type];
            if (!DataLazyload || !type || !flag) return; // û���ӳ���

            host.on(EVENT_BEFORE_SWITCH, loadLazyData);

            /**
             * �����ӳ����
             */
            function loadLazyData(ev) {
                var steps = cfg.steps,
                    from = ev.toIndex * steps ,
                    to = from + steps;

                DataLazyload.loadCustomLazyData(host.panels.slice(from, to), type, flag);
                if (isAllDone()) {
                    host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }

            /**
             * �Ƿ��Ѽ������
             */
            function isAllDone() {
                var imgs, textareas, i, len;

                if (type === IMG_SRC) {
                    imgs = S.query('img', host.container);
                    for (i = 0,len = imgs.length; i < len; i++) {
                        if (DOM.attr(imgs[i], flag)) return false;
                    }
                } else if (type === TEXTAREA_DATA) {
                    textareas = S.query('textarea', host.container);
                    for (i = 0,len = textareas.length; i < len; i++) {
                        if (DOM.hasClass(textareas[i], flag)) return false;
                    }
                }

                return true;
            }

        }
    });
});
/**
 * Tabs Widget
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('tabs', function(S) {

    /**
     * Tabs Class
     * @constructor
     */
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
    }

    S.extend(Tabs, S.Switchable);
    S.Tabs = Tabs;
});
/**
 * Tabs Widget
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('slide', function(S) {

    /**
     * Ĭ�����ã��� Switchable ��ͬ�Ĳ��ִ˴�δ�г�
     */
    var defaultConfig = {
        autoplay: true,
        circular: true
    };

    /**
     * Slide Class
     * @constructor
     */
    function Slide(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Slide)) {
            return new Slide(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Slide.superclass.constructor.call(self, container, config);
    }

    S.extend(Slide, S.Switchable);
    S.Slide = Slide;
});
/**
 * Carousel Widget
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('carousel', function(S) {

        /**
         * Ĭ�����ã��� Switchable ��ͬ�Ĳ��ִ˴�δ�г�
         */
        var defaultConfig = {
            circular: true
        };

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

        config = S.merge(defaultConfig, config || { });
        Carousel.superclass.constructor.call(self, container, config);
    }

    S.extend(Carousel, S.Switchable);
    S.Carousel = Carousel;
});
