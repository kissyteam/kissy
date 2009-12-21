// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * KISSY - Carousel Module
 *
 * @module      carousel
 * @creator     mingcheng<i.feelinglucky#gmail.com>
 * @depends     kissy-core, yahoo-dom-event, yahoo-animate
 */

KISSY.add("carousel", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;
    var defaultConfig = {
        delay: 2000,
        speed: 1000,
        startDelay: 2000,
        autoStart: true,
        direction: 'vertical', // 'horizontal(h)' or 'vertical(v)'
        scrollWidth: false,
        //easing: function() {},
        //onScroll: function() {},
        //onBeforeScroll: function() {},
        //onPause: function() {},
        //onWakeup: function() {},
        scrollSize: 1 // the number of horse scrolls, default is 1
    };


    //http://www.gtalbot.org/BrowserBugsSection/MSIE6Bugs/
    function getRealOffset(o) {
        var elem = Dom.get(o), leftOffset = elem.offsetLeft,
            topOffset = elem.offsetTop, parent = elem.offsetParent;

        // fix ie offsetLeft bug
        while(parent) {
            leftOffset += parent.offsetLeft;
            topOffset += parent.offsetTop;
            parent = parent.offsetParent;
        }

        return { top: topOffset, left: leftOffset };
    }
        

    // find the next element which to scroll
    var findNextHorse = function(ref, size, direction) {
        var func = Dom[(direction == 'prev') ? 'getPreviousSibling' : 'getNextSibling'];
        for(var i = 0; i < size; i++) {
            ref = func(ref);
            if (!ref) return false;
        }
        return ref;
    }

    // queue the 'houses' for smooth scroll
    var queueHorses = function(container, size, direction) {
        direction = (direction == 'prev') ? 'prev' : 'next';
        switch(direction) {
            case 'prev':
                for (var i = 0; i < size; i++) {
                    Dom.insertBefore(Dom.getLastChild(container), Dom.getFirstChild(container))
                }
                break;
            default: 
                for (var i = 0; i < size; i++) {
                    Dom.insertAfter(Dom.getFirstChild(container), Dom.getLastChild(container))
                }
        }
    }

    // NOTICE: the container must be scrollable
    var Carousel = function(container, config) {
        this.config = Lang.merge(defaultConfig, config || {});

        // carousel's elements
        this.container = Dom.get(container);
        this.horses = this.container.getElementsByTagName('li');

        // move pointer to first
        this.pointer = this.horses[0];

        // number of horses
        this.total = this.horses.length;
        if (this.total < this.config.scrollSize) {
            return;
        }
        this.current = Dom.getAttribute(this.pointer, 'carousel:index');

        // mark index
        for(var i = 0, len = this.total; i < len;) {
            Dom.setAttribute(this.horses[i], 'carousel:index', i++);
        }

        // default direction value is vertical
        this.direction = {
            x: (this.config.direction == 'horizontal') || (this.config.direction == 'h'),
            y: (this.config.direction == 'vertical')   || (this.config.direction == 'v')       
        };

        // initialize
        this._init(); 
    }

    S.mix(Carousel.prototype, {
        _init: function() {
            var config = this.config, container = this.container;

            // bind custom event
            var events = ['onScroll', 'onPause', 'onBeforeScroll', 'onPause', 'onWakeup'];
            for(var i = 0,  len = events.length; i < len; i++) {
                var flag = events[i];
                if (Lang.isFunction(config[flag])) {
                    this[flag + 'Event'] = new Y.CustomEvent(flag, this, false, Y.CustomEvent.FLAT);
                    this[flag + 'Event'].subscribe(config[flag]);
                }
            }

            // stop scroll when mouseover the container
            Event.on(container, 'mouseover', function() {
                if (config.autoStart) this.pause();
            }, this, true);
            Event.on(container, 'mouseout',  function() {
                if (config.autoStart) this.wakeup();
            }, this, true);

            // autoStart?
            if (config.autoStart) {
                Lang.later(config.startDelay, this, function() {
                    this.play();
                });
            }
        },


        play: function(direction) {
            var _self = this, container = this.container, pointer = this.pointer,
                config = this.config, callee = arguments.callee, attributes;
            direction = (direction == 'prev') ? 'prev' : 'next';

            // is scrolling?
            if (this._scrolling || this.paused) {
                return;
            }

            // find the destination
            var destination = findNextHorse(pointer, config.scrollSize, direction);

            // at the border? queue the 'horses' and refind the destination
            if (!destination) {
                queueHorses(pointer.parentNode, config.scrollSize, direction);
                destination = findNextHorse(pointer, config.scrollSize, direction);
            }

            if (Lang.isNumber(config.scrollWidth)) {
                var offset = config.scrollWidth * config.scrollSize;
            }

            var pointerOffset = getRealOffset(pointer),
                containerOffset = getRealOffset(container),
                destinationOffset = getRealOffset(destination);
            // sucks IE, need more code to fix its bug
            if (this.direction.y) {

                var from = pointerOffset.top - containerOffset.top;
                attributes = {scroll: { from: [, from] }};
                if (offset) {
                    attributes.scroll.to = [, from + (offset * (direction == 'next' ? 1 : -1))];
                } else {
                    attributes.scroll.to = [, destination['offsetTop'] - container['offsetTop']];
                }
            } else {
                var from = pointerOffset.left - containerOffset.left;
                attributes = { scroll: { from: [from] } };
                if (offset) {
                    attributes.scroll.to = [from + (offset * (direction == 'next' ? 1 : -1))];
                } else {
                    attributes.scroll.to = [destinationOffset.left - containerOffset.left];
                }


                /*
                if (YAHOO.env.ua.ie) {
                    var ieOffset = parseInt(Dom.getStyle(container.parentNode, 
                                   direction == 'next' ? 'padding-left' : 'padding-right'), 10);
                    attributes.scroll.to[0] += ieOffset * (direction == 'next' ? 1 : -1);
                }
                */
            }

            // move pointer to next Item
            this.pointer = destination;

            // mark current horses index
            this.current = Dom.getAttribute(this.pointer, 'carousel:index');

            if(Lang.isObject(this.onBeforeScrollEvent)) {
                this.onBeforeScrollEvent.fire();
            }

            // start scroll
            this._scrolling = true;
            if (this.anim) {
                this.anim.stop();
            }
            this.anim = new Y.Scroll(container, attributes, config.speed/1000,
                config.easing || Y.Easing.easeOut); 
            this.anim.onComplete.subscribe(function() {
                this._scrolling = false;

                // run the callback
                if(Lang.isObject(this.onScrollEvent)) {
                    this.onScrollEvent.fire();
                }

                // set next move time
                if (!this.paused && config.autoStart) {
                    this.timer = Lang.later(config.delay, _self, callee);
                }
            }, this, true);
            this.anim.animate();
        },

        pause: function() {
            this.paused = true;
            // skip wakeup
            if (this._wakeupTimer) {
                this._wakeupTimer.cancel();
            }

            // run the callback
            if(Lang.isObject(this.onPauseEvent)) {
                this.onPauseEvent.fire();
            }
        },

        wakeup: function() {
            this.paused = false;

            // skip wakeup for previous set
            if (this._wakeupTimer) {
                this._wakeupTimer.cancel();
            }

            // run the callback
            if(Lang.isObject(this.onWakeupEvent)) {
                this.onWakeupEvent.fire();
            }

            this._wakeupTimer = Lang.later(0, this, function() {
                this.timer = Lang.later(this.config.delay, this, this.play);
            });
        },

        jumpTo: function(index, direction) {
            var _self = this, pointer = this.pointer, config = this.config;

            if (Lang.isUndefined(direction) && Lang.isNumber(this._prevIndex)) {
                direction = index > this._prevIndex ? 'next' : 'prev';
            }
            direction = (direction == 'prev') ? 'prev' : 'next';
            var opponent = (direction == 'prev') ? 'next' : 'prev';

            if (index > this.total) {
                return;
            }

            // find direction element
            for(var i = 0, len = this.total, current = false; i < len; i++) {
                var tmp = Dom.getAttribute(this.horses[i], 'carousel:index');
                if (tmp == index) {
                    current = this.horses[i];
                    break;
                }
            }
            if (!current) return;

            // find opponent element
            this.pointer = findNextHorse(current, config.scrollSize, opponent);
            if (!this.pointer) {
                queueHorses(pointer.parentNode, config.scrollSize, direction);
                this.pointer = findNextHorse(current, config.scrollSize, opponent);
            }

            //
            this._prevIndex = index;

            // start scroll
            this.play(direction);
        },

        next: function() {
            this.play('next');
        },

        prev: function() {
            this.play('prev');
        }
    });

    S.Carousel = Carousel;
});
