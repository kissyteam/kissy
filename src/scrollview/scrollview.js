// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * KISSY - Carousel Module
 *
 * @module      carousel
 * @creator     mingcheng<i.feelinglucky#gmail.com>
 * @depends     kissy-core, yahoo-dom-event, yahoo-animate
 */

KISSY.add("scrollview", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        getFirstChild = Dom.getFirstChild, getLastChild  = Dom.getLastChild,
        insertBefore = Dom.insertBefore, insertAfter = Dom.insertAfter,
        getAttribute = Dom.getAttribute, setAttribute = Dom.setAttribute;

    var PREV = 'prev', NEXT = 'next', INDEX_FLAG = 'carousel:index',
        HORIZONTAL = 'horizontal', VERTICAL = 'vertical';

    var defaultConfig = {
        delay: 2000,
        speed: 500,
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


    /**
     * Get Element's real offset
     *
     * @param Object Elements
     * @private
     */
    function getRealOffset(elem) {
        var elem = Dom.get(elem),
            leftOffset = elem.offsetLeft,
            topOffset  = elem.offsetTop,
            parent     = elem.offsetParent;

        // fix IE offsetLeft bug, see
        // http://www.gtalbot.org/BrowserBugsSection/MSIE6Bugs/
        while(parent) {
            leftOffset += parent.offsetLeft;
            topOffset  += parent.offsetTop;
            parent      = parent.offsetParent;
        }

        return { top: topOffset, left: leftOffset };
    }
        

    /**
     * 找到下个节点的位置
     *
     * @private
     */
    var findNextPanel = function(ref, size, direction) {
        var func = Dom[(direction == 'prev') ? 'getPreviousSibling' : 'getNextSibling'];
        for(var i = 0; i < size; i++) {
            ref = func(ref);
            if (!ref) return false;
        }
        return ref;
    }


    /**
     * 基于平滑滚动，重新排列元素位置
     *
     * @private
     */
    var rebuildSeq = function(container, size, direction) {
        direction = (direction == PREV) ? PREV : NEXT;
        switch(direction) {
            case PREV:
                for (var i = 0; i < size; i++) {
                    insertBefore(getLastChild(container), getFirstChild(container));
                }
                break;
            default: 
                for (var i = 0; i < size; i++) {
                    insertAfter(getFirstChild(container), getLastChild(container));
                }
        }
    }




    // NOTICE: the container must be scrollable
    var ScrollView = function(container, config) {
        var self = this, config = Lang.merge(defaultConfig, config || {}),
        container, panels, currentPanel, current, total, i, len, direction;

        // carousel's elements
        container = Dom.get(container), panels = container.getElementsByTagName('li');

        // move current to first
        currentPanel = panels[0] || [], total = panels.length;
        if (total < config.scrollSize) {
            return;
        }

        // mark index
        for(i = 0, len = total; i < len; i++) {
            setAttribute(panels[i], INDEX_FLAG, i);
        }

        // mark current index
        current = getAttribute(currentPanel, INDEX_FLAG);

        // default direction value is vertical
        direction = {
            x: (config.direction == HORIZONTAL) || (config.direction == 'h'),
            y: (config.direction == VERTICAL)   || (config.direction == 'v')       
        };

        // 重新绑到实例化中
        self.config    = config,
        self.container = container, 
        self.panels    = panels,
        self.currentPanel = currentPanel,
        self.current = current,
        self.total     = total,
        self.direction = direction;

        // initialize
        self._init(); 
    }

    S.mix(ScrollView.prototype, {
        _init: function() {
            var self = this, config = self.config, container = self.container, 
                panels = self.panels,
                i, len, flag;

            // bind custom event
            var events = ['onScroll', 'onPause', 'onBeforeScroll', 'onPause', 'onWakeup'];
            for(i = 0,  len = events.length; i < len; i++) {
                flag = events[i];
                if (Lang.isFunction(config[flag])) {
                    self[flag + 'Event'] = new Y.CustomEvent(flag, self, false, Y.CustomEvent.FLAT);
                    self[flag + 'Event'].subscribe(config[flag]);
                }
            }

            // stop scroll when mouseover the container
            Event.on(container, 'mouseenter', function() {
                if (config.autoStart) self.pause();
            });

            Event.on(container, 'mouseleave',  function() {
                if (config.autoStart) self.wakeup();
            });

            // autoStart?
            if (config.autoStart) {
                Lang.later(config.startDelay, self, function() {
                    self.play();
                });
            }
        },


        play: function(direction) {
            var self = this, container = self.container, currentPanel = self.currentPanel,
                current = self.current,
                config = self.config, callee = arguments.callee, attributes,
                destination;

            direction = (direction == PREV) ? PREV : NEXT;

            // is scrolling?
            if (self._scrolling || self.paused) {
                return;
            }

            // find the destination
            do {
                destination = findNextPanel(currentPanel, config.scrollSize, direction);
                // 如果往下没找到，则重新排序
                if (!destination) {
                    rebuildSeq(currentPanel.parentNode, config.scrollSize, direction);
                }
            } while(!destination);


            // 如果指定滚动距离，记录
            if (Lang.isNumber(config.scrollWidth)) {
                var offset = config.scrollWidth * config.scrollSize;
            }

            // 元素相对位置
            var currentOffset     = getRealOffset(self.currentPanel),
                containerOffset   = getRealOffset(container),
                destinationOffset = getRealOffset(destination);

            // 滚动属性
            if (self.direction.y) {
                // 垂直滚动
                var from = currentOffset.top - containerOffset.top;
                attributes = {scroll: { from: [, from] }};
                attributes.scroll.to = offset ?
                    [, from + (offset * (direction == NEXT ? 1 : -1))] : [, destinationOffset.top - containerOffset.top];
            } else {
                // 水平滚动
                var from = currentOffset.left - containerOffset.left;
                attributes = { scroll: { from: [from] } };
                // 如果手动设定了滚动距离
                attributes.scroll.to = offset ? 
                    [from + (offset * (direction == NEXT ? 1 : -1))] : [destinationOffset.left - containerOffset.left];
            }

            // move current to next Item
            self.currentPanel = destination;

            // mark current horses index
            self.current = getAttribute(destination, INDEX_FLAG);

            if(Lang.isObject(self.onBeforeScrollEvent)) self.onBeforeScrollEvent.fire();

            // start scroll
            self._scrolling = true;
            if (self.anim) self.anim.stop();
            self.anim = new Y.Scroll(container, attributes, config.speed/1000, 
                                                            config.easing || Y.Easing.easeOut); 
            self.anim.onComplete.subscribe(function() {
                self._scrolling = false;

                // run the callback
                if(Lang.isObject(self.onScrollEvent)) {
                    self.onScrollEvent.fire();
                }

                // set next move time
                if (!self.paused && config.autoStart) {
                    self.timer = Lang.later(config.delay, self, callee);
                }
            });
            self.anim.animate();
        },

        pause: function() {
            var self = this;
            self.paused = true;
            // skip wakeup
            if (self._wakeupTimer) self._wakeupTimer.cancel();

            // run the callback
            if(Lang.isObject(self.onPauseEvent)) self.onPauseEvent.fire();
        },

        wakeup: function() {
            var self = this;
            self.paused = false;

            // skip wakeup for previous set
            if (self._wakeupTimer) {
                self._wakeupTimer.cancel();
            }

            // run the callback
            if(Lang.isObject(this.onWakeupEvent)) {
                self.onWakeupEvent.fire();
            }

            self._wakeupTimer = Lang.later(0, self, function() {
                self.timer = Lang.later(self.config.delay, self, self.play);
            });
        },


        jumpTo: function(index, direction) {
            var self = this, config = self.config, currentPanel = self.currentPanel, 
                total = self.total, 
                current, opponent, i, tmp, len;

            if (Lang.isUndefined(direction) && Lang.isNumber(this._prevIndex)) {
                direction = index > self._prevIndex ? NEXT : PREV;
            }
            direction = (direction == PREV) ? PREV : NEXT;
            opponent = (direction == PREV) ? NEXT : PREV;

            if (index > self.total) {
                return;
            }

            // find direction element
            for(i = 0, len = total; i < len; i++) {
                tmp = getAttribute(self.panels[i], INDEX_FLAG);
                if (tmp == index) {
                    current = self.panels[i];
                    break;
                }
            }
            if (!current) return;

            do {
                self.currentPanel = findNextPanel(current, config.scrollSize, opponent);
                // find opponent element
                if (!self.currentPanel) {
                    rebuildSeq(current.parentNode, config.scrollSize, direction);
                }
            } while(!self.currentPanel);

            //
            self._prevIndex = index;

            // start scroll
            self.play(direction);
        },

        next: function() {
            this.play('next');
        },

        prev: function() {
            this.play('prev');
        }
    });

    S.ScrollView = ScrollView;
});
