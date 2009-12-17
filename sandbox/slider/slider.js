// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * KISSKY - Slider module
 *
 * @creator mingcheng<i.feelinglucky#gmail.com>
 * @since   2009-12-16
 * @link    http://www.gracecode.com/
 */

KISSY.add("slider", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;

    /**
     * 默认配置
     */
	var defaultConfig = {
		triggersClass: 'triggers', // triggers 的 className
        //triggers: null, // 如果指定，则不自动创建 triggers
        panelsClass: 'panels',
		currentClass: 'current',
		eventType: 'click', // mouse
        effect: 'none', // 'fade', 'scroll'
		delay: 5000,
		speed: 500,
		autoPlay: true,
        switchSize: false,
        //startAt: 0,
        //onSwitch: function() {},
        direction: 'vertical' // 'horizontal(h)' or 'vertical(v)'
	};

    var _effects = {
        'none': function() {
            var config = this.config, direction = this.direction;
            this.scroller[direction.x ? 'scrollLeft' : 'scrollTop'] = this.next * this.switchSize;
        },

        'fade': function() {
            // @TODO 
            var config = this.config, anim = this._anim, _self = this;
            var current = this.panels[this.current], next = this.panels[this.next];

            //if (anim) { anim.stop(); }
            Dom.setStyle(current, 'opacity', 1);
            Dom.setStyle(next, 'opacity', 0);
            anim = new YAHOO.util.Anim(current, {opacity: {from: 1, to: 0}}, config.speed/1000); 
            anim.onComplete.subscribe(function() {
                _effects['none'].call(_self);
                anim = new YAHOO.util.Anim(next, {opacity: {from: 0, to: 1}}, config.speed/1000); 
                anim.animate();
            });
            anim.animate();
        },

        'scroll': function() {
            var config = this.config, anim = this._anim;
            var attributes, 
                from = this.current * this.switchSize, to = this.next * this.switchSize;

            if (this.direction.x) {
                attributes = {
                    scroll: {
                        from: [from],
                        to:   [to]
                    }
                }; 
            } else {
                attributes = {
                    scroll: {
                        from: [, from],
                        to:   [, to]
                    }
                };
            }

            if (anim) { anim.stop(); }
            anim = new Y.Scroll(this.scroller, attributes, config.speed/1000, config.easing || Y.Easing.easeOutStrong);
            /*
            anim.onComplete.subscribe(function() {
                // ...
            });
            */
            anim.animate();
        }
    };

    var Slider = function(container, config) {
        this.config = Lang.merge(defaultConfig, config || {});
        this.container = Dom.get(container);

        this._init();
    };

    Lang.augmentObject(Slider.prototype, {
        _init: function() {
            // 
            var config = this.config, container = this.container, effect;

            // direction
            this.direction = {
                x: (config.direction == 'horizontal') || (config.direction == 'h'),
                y: (config.direction == 'vertical')   || (config.direction == 'v')       
            };

            // panels
            this.panels = this.config.panels || container.getElementsByTagName('li');

            // total
            this.total = this.panels.length;

            // switch
            this.switchSize = parseInt(this.config.switchSize, 10);
            if (!this.switchSize) {
                if (this.direction.x) {
                    this.switchSize = this.panels[0]['clientWidth'];
                } else {
                    this.switchSize = this.panels[0]['clientHeight'];
                }
            }

            this.scroller = config.scroller || this.panels[0].parentNode;

            // triggers
            this.triggers = config.triggers;
            if (!this.triggers) {
                var triggers = document.createElement('ul');
                Dom.addClass(triggers, config.triggersClass);
                for(var i = 0; i < this.total;) {
                    var t = document.createElement('li');
                    t.innerHTML = ++i;
                    triggers.appendChild(t);
                }
                this.container.appendChild(triggers);
                this.triggers = triggers.getElementsByTagName('li');
            }

            //
            this.current = config.startAt || 0;

            // switch effect
            if (Lang.isFunction(config.effect)) {
                effect = config.effect;
            } else if (Lang.isString(config.effect) && Lang.isFunction(_effects[config.effect])) {
                effect = _effects[config.effect];
            } else {
                effect = effect['none'];
            }
            this.effect = new Y.CustomEvent('effect', this, false, Y.CustomEvent.FLAT);
            this.effect.subscribe(effect);

            // callback
            if (Lang.isFunction(config.onSwitch)) {
                this.onSwitchEvent = new Y.CustomEvent('onSwitchEvent', this, false, Y.CustomEvent.FLAT);
                this.onSwitchEvent.subscribe(config.onSwitch);
            }

            // bind event
            Event.on(container, 'mouseover', function() {
                this.sleep();
            }, this, true);

            Event.on(container, 'mouseout', function() {
                if (config.autoPlay) {
                    this.wakeup();
                }
            }, this, true);

            for (var i = 0, len = this.triggers.length, _self = this, _timer; i < len; i++) {
                (function(index) {
                    switch(config.eventType.toLowerCase()) {
                        case 'mouse':
                            Event.on(_self.triggers[index], 'mouseover', function() {
                                if (_timer) _timer.cancel();
                                _timer = Lang.later(100, _self, function() {
                                    this.switchTo(index);                               
                                });
                            });

                            Event.on(_self.triggers[index], 'mouseout', function() {
                                _timer.cancel();
                                if (config.autoPlay) {
                                    _self.wakeup();
                                }
                            });
                            break;
                        default: 
                            Event.on(_self.triggers[index], 'click', function(e) {
                                Event.stopEvent(e);
                                if (_timer) _timer.cancel();
                                _timer = Lang.later(50, _self, function() {
                                    this.switchTo(index);                               
                                });
                            });
                    }
                })(i);
            }

            // init scroll size
            Dom.addClass(this.triggers[this.current], config.currentClass);
            this.scroller.scrollTop = 0; this.scroller.scrollLeft = 0;

            // autoPlay?
            if (config.autoPlay) {
                this.pause = false;
                Lang.later(config.delay, this, 
                    function() {
                        this.switchTo(this.current + 1);
                    }
                );
            }
        },

        switchTo: function(index) {
            var config = this.config;

            //
            if (this.pause && !Lang.isNumber(index)) {
                return;
            }

            //
            if (this.timer) this.timer.cancel();

            //
            this.next = Lang.isNumber(index) ? index : this.current + 1;
            if (this.next >= this.total) {
                this.next = 0;
            }

            //
            this.effect.fire();

            // 
            this.current = this.next;

            // run callback
            if (this.onSwitchEvent) {
                this.onSwitchEvent.fire();
            }

            // make current trigger class
            Dom.removeClass(this.triggers, config.currentClass);
            Dom.addClass(this.triggers[this.current], config.currentClass);

            // continue paly?
            if (config.autoPlay) {
                this.timer = Lang.later(config.delay, this, arguments.callee);
            }
        },

        sleep: function() {
            this.pause = true;
            if (this.timer) {
                this.timer.cancel();
            }
        },

        wakeup: function() {
            if (this.timer) {
                this.timer.cancel();
            }
            this.pause = false;
            this.timer = Lang.later(this.config.delay, this, function() {
                this.switchTo(++this.current);
            });
        }
    });

    S.Slider = Slider;
});
