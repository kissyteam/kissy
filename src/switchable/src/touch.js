/**
 * @fileOverview Touch support for switchable
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/touch", function (S, DOM, Event, Switchable, undefined) {

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

    Switchable.addPlugin({

        priority:5,

        name:'touch',

        init:function (self) {

            var cfg = self.config,
            // circular 会修改 cfg.effect
                effect = cfg.scrollType || cfg.effect;

            if (effect == 'scrolly' ||
                effect == 'scrollx') {

                var content = self.content,
                    container = self.container,
                    startX,
                    mouseAsTouch = cfg.mouseAsTouch,
                    startY,
                    realStarted = 0,
                    started = 0,
                    startContentOffset = {},
                    containerRegion = {},
                    prop = "left",
                    diff,
                    viewSize;

                if (effect == 'scrolly') {
                    prop = "top";
                }

                function start() {
                    if (// edge adjusting, wait
                    // 暂时不像 circular 那样处理
                    // resetPosition 瞬移会导致 startContentOffset 变化，复杂了
                        self.panels[self.activeIndex].style.position == 'relative') {
                        // S.log("edge adjusting, wait !");
                        return;
                    }

                    // 停止自动播放
                    if (self.stop) {
                        self.stop();
                    }

                    started = 1;

                    startContentOffset = DOM.offset(content);
                    containerRegion = getRegionFn(container);
                }

                function inRegionFn(n, l, r) {
                    return n >= l && n <= r;
                }

                function getRegionFn(n) {
                    var containerRegion = DOM.offset(n);
                    containerRegion.bottom = containerRegion.top +
                        container.offsetHeight;
                    containerRegion.right = containerRegion.left +
                        container.offsetWidth;
                    return containerRegion;
                }

                function move(e) {
                    // 拖出边界外就算结束，即使再回来也应该没响应
                    if (!started) {
                        return;
                    }

                    var touch = getXyObj(e),
                        currentOffset = {},
                        inRegion;

                    if (effect == 'scrolly') {
                        viewSize = self.viewSize[1];
                        diff = touch.pageY - startY;
                        currentOffset.top = startContentOffset.top + diff;
                        inRegion = inRegionFn(touch.pageY,
                            containerRegion.top,
                            containerRegion.bottom);
                    } else {
                        viewSize = self.viewSize[0];
                        diff = touch.pageX - startX;
                        currentOffset.left = startContentOffset.left + diff;
                        inRegion = inRegionFn(touch.pageX,
                            containerRegion.left,
                            containerRegion.right);
                    }

                    // 已经开始或者第一次拖动距离超过 5px
                    if (realStarted ||
                        Math.abs(diff) > PIXEL_THRESH) {
                        if (isTouchEvent(e)) {
                            // stop native page scrolling in ios
                            e.preventDefault();
                        }
                        // 正在进行的动画停止
                        if (self.anim) {
                            self.anim.stop();
                            self.anim = undefined;
                        }
                        if (!inRegion) {
                            end();
                        } else {
                            // 只有初始拖动距离超过 5px 才算开始拖动
                            // 防止和 click 混淆
                            if (!realStarted) {
                                realStarted = 1;
                                if (cfg.circular) {
                                    var activeIndex = self.activeIndex, threshold = self.length - 1;
                                    /*
                                     circular logic : only run once after mousedown/touchstart
                                     */
                                    if (activeIndex == threshold) {
                                        Switchable.adjustPosition
                                            .call(self, self.panels, 0, prop, viewSize);
                                    } else if (activeIndex == 0) {
                                        Switchable.adjustPosition
                                            .call(self, self.panels, threshold, prop, viewSize);
                                    }
                                }
                            }
                            // 跟随手指移动
                            DOM.offset(content, currentOffset);
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

                    if (!cfg.circular) {
                        // 不能循环且到了边界，恢复到原有位置
                        if (diff < 0 && activeIndex == lastIndex ||
                            diff > 0 && activeIndex == 0) {
                            // 强制动画恢复到初始位置
                            Switchable.Effects[effect]
                                .call(self, undefined, undefined, true);
                            return;
                        }
                    }

                    /*
                    if (diff < 0 && activeIndex == lastIndex) {
                        // 最后一个到第一个
                    } else if (diff > 0 && activeIndex == 0) {
                        // 第一个到最后一个
                    } else if (activeIndex == 0 || activeIndex == lastIndex) {
                        // 否则的话恢复位置
                        Switchable.resetPosition.call(self,
                            self.panels,
                            activeIndex == 0 ? lastIndex : 0,
                            prop,
                            viewSize);
                    }*/

                    self[diff < 0 ? 'next' : 'prev']();

                    // 开始自动播放
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