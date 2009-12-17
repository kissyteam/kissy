// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * KISSKY - Slider module
 *
 * @creator mingcheng<i.feelinglucky#gmail.com>
 * @since   2009-12-16
 * @link    http://www.gracecode.com/
 */

KISSY.add("carousel", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;

	var defaultConfig = {
		triggersClass: 'slider-triggers',
        //triggers: null,
		currentClass: 'current',
		eventType: 'click',
        effect: 'none', // opacity, scroll
		delay: 2000,
		speed: 500,
		autoPlay: true,
        switchSize: false,
        //onSwitch: function() {},
        direction: 'vertical' // 'horizontal(h)' or 'vertical(v)'
	};

    // 
    var effect = {
        'none': function() {
        
        },

        'opacity': function() {
        
        },

        'scroll': function() {
        
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
            var config = this.config, effect;

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
            this.switchSize = this.config.switchSize;
            if (!this.switchSize) {
                if (this.direction.x) {
                    this.switchSize = this.panels[0]['clientWidth'];
                } else {
                    this.switchSize = this.panels[0]['clientHeight'];
                }
            }

            // triggers
            this.triggers = config.triggers;
            if (!this.triggers) {
                var triggers = document.createElement('ul');
                Dom.addClass(triggers, config.triggersClass);
                for(var i = 0; i < total;) {
                    var t = createElement('li');
                    t.innerHTML = ++i;
                    triggers.appendChild(li);
                }
                this.container.appendChild(triggers);
                this.triggers = triggers.getElementsByTagName('li');
            }


            //
            this.current = config.startAt || 0;

            // switch effect
            if (Lang.isFunction(config.effect)) {
                effect = config.effect;
            } else if (Lang.isString(config.effect) && Lang.isFunction(effect[config.effect]) {
                effect = effect[config.effect];
            } else {
                effect = effect['none'];
            }

            this.effect = new Y.CustomEvent('effect', this, false, Y.CustomEvent.FLAT);
            this.effect.subscribe(effect);

            // callback
            if (Lang.isFunction(config.onSwitch)) {
                this.onSwitchEvent = new Y.CustomEvent('onSwitchEvent', this, false, Y.CustomEvent.FLAT);
            }

            // event
            Event.on(this.panels, 'mouseover', function() {
            
            });

            Event.on(this.panels, 'mouseout', function() {
            
            });

            Event.on(this.triggers, 'mouseover', function() {
            
            });

            Event.on(this.triggers, 'mouseout', function() {
            
            });

            // autoStart?
            if (config.autoStart) {
                Lang.later(config.delay, this, this.switchTo(this.current));
            }
        },

        switchTo: function(index) {
            var config = this.config;

            this.next = index || ++this.current;
            if (index > this.total) {
                this.next = 0;
            }

            this.onSwitchEvent.fire();

            this.effect.fire();

            this.current = this.next;

            if (!this.pause || config.autoStart) {
                this.timer = Lang.later(config.delay, this, arguments.callee);
            }
        },

        pause: function() {
            this.pause = true;
            if (this.timer) {
                this.timer.cancel();
            }
        },

        wakeup: function() {
            this.pause = false;

            if (this.timer) {
                this.timer.cancel();
            }
            this.switchTo(++this.current);
        }
    });

    S.Slider = Slider;
});
