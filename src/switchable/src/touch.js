/**
 * Touch support for switchable
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/touch", function (S, DOM, Event, Switchable) {

    S.mix(Switchable.Config, {
        mouseAsTouch:false
    });

    var PIXEL_THRESH = 3;

    function isTouchEvent(e) {
        return e.type.indexOf('touch') != -1;
    }

    function getXyObj(e) {
        var touch;
        if (isTouchEvent(e)) {
            // touches is 0 when touchend
            touch = e.originalEvent['changedTouches'][0];
        } else {
            touch = e;
        }
        return touch;
    }

    Switchable.Plugins.push({

        name:'touch',

        init:function (self) {

            var cfg = self.config,
                effect = cfg.effect;
            if (effect == 'scrolly' ||
                effect == 'scrollx') {

                var content = self.content,
                    container = self.container,
                    startX,
                    mouseAsTouch = cfg.mouseAsTouch,
                    startY,
                    realStarted = 0,
                    started = 0,
                    startElOffset,
                    prop = "left",
                    diff,
                    viewSize;


                if (effect == 'scrolly') {
                    prop = "top";
                }


                function start() {
                    // edge adjusting , wait
                    if (self.panels[self.activeIndex].style.position == 'relative') {
                        // S.log("edge adjusting , wait !");
                        return;
                    }

                    if (self.stop) {
                        self.stop();
                    }

                    startElOffset = DOM.offset(content);
                    started = 1;
                }

                function move(e) {

                    if (!started) {
                        return;
                    }

                    var touch = getXyObj(e),
                        currentOffset = {},
                        inRegion,
                        containerOffset = DOM.offset(container);

                    containerOffset.bottom = containerOffset.top + container.offsetHeight;
                    containerOffset.right = containerOffset.left + container.offsetWidth;

                    if (effect == 'scrolly') {
                        viewSize = self.viewSize[1];
                        diff = touch.pageY - startY;
                        currentOffset.top = diff + startElOffset.top;
                        inRegion = (touch.pageY >= containerOffset.top) &&
                            (touch.pageY <= containerOffset.bottom);
                    } else {
                        viewSize = self.viewSize[0];
                        diff = touch.pageX - startX;
                        currentOffset.left = diff + startElOffset.left;
                        inRegion = (touch.pageX >= containerOffset.left) &&
                            (touch.pageX <= containerOffset.right);
                    }

                    if (Math.abs(diff) > PIXEL_THRESH) {
                        if (isTouchEvent(e)) {
                            // stop native page scrolling in ios
                            e.preventDefault();
                        }
                        if (!inRegion) {
                            end();
                        } else {
                            var activeIndex = self.activeIndex;
                            if (!realStarted) {
                                realStarted = 1;
                                if (cfg.circular) {
                                    /*
                                     circular logic : only run once after mousedown/touchstart
                                     */
                                    if (activeIndex == self.length - 1) {
                                        Switchable.adjustPosition
                                            .call(self, self.panels, false, prop, viewSize);
                                    } else if (activeIndex == 0) {
                                        Switchable.adjustPosition
                                            .call(self, self.panels, true, prop, viewSize);
                                    }
                                }

                            }

                            if (!cfg.circular) {

                                if (diff > 0 && activeIndex == 0) {

                                } else if (diff < 0 && activeIndex == self.length - 1) {

                                } else {
                                    DOM.offset(content, currentOffset);
                                }
                            } else {
                                DOM.offset(content, currentOffset);
                            }


                        }
                    }
                }

                function end() {

                    if (!realStarted) {
                        return;
                    }

                    realStarted = 0;
                    started = 0;

                    /*
                     circular logic
                     */
                    var activeIndex = self.activeIndex,
                        lastIndex = self.length - 1;

                    if (diff < 0 && activeIndex == lastIndex) {
                        // not allowed to circular
                        if (!cfg.circular) {
                            return;
                        }
                    } else if (diff > 0 && activeIndex == 0) {
                        if (!cfg.circular) {
                            return;
                        }
                    } else if (activeIndex == 0 || activeIndex == lastIndex) {

                        Switchable.resetPosition.call(self, self.panels,
                            activeIndex == 0, prop, viewSize);


                    }

                    self[diff < 0 ? 'next' : 'prev']();

                    if (self.start) {
                        self.start();
                    }
                }

                Event.on(content, 'touchstart', function (e) {
                    start();
                    startX = e.pageX;
                    startY = e.pageY;
                });

                Event.on(content, 'touchmove', move);

                Event.on(content, 'touchend', end);

                if (mouseAsTouch && !('ontouchstart' in S.Env.host.document.documentElement)) {
                    S.use("dd", function (S, DD) {
                        var contentDD = new DD.Draggable({
                            node:content
                        });
                        contentDD.on("dragstart", function () {
                            start();
                            startX = contentDD.startMousePos.left;
                            startY = contentDD.startMousePos.top;
                        });
                        contentDD.on("drag", move);
                        contentDD.on("dragend", end);
                        self.__touchDD = contentDD;
                    });
                }
            }
        },

        destroy:function (self) {
            var d;
            if (d = self.__touchDD) {
                d.destroy();
            }
        }
    });
}, {
    requires:['dom', 'event', './base']
});

/**
 * !TODO consider when circular is set false!
 *
 * known issus:
 * When too fast empty content occurs between first changed to last one
 * or last changed to first
 **/