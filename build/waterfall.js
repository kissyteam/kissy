/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
/**
 * @fileOverview intervein elements dynamically
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/base", function (S, Node, Base) {

    var $ = Node.all,
        win = S.Env.host,
        RESIZE_DURATION = 50;

    /**
     * @class
     * @namespace
     * @name Waterfall
     */
    function Waterfall() {
        Waterfall.superclass.constructor.apply(this, arguments);
        this._init();
    }


    function timedChunk(items, process, context, callback) {
        var todo = [].concat(S.makeArray(items)),
            stopper = {},
            timer;
        if (todo.length > 0) {
            timer = setTimeout(function () {
                var start = +new Date();
                do {
                    var item = todo.shift();
                    process.call(context, item);
                } while (todo.length > 0 && (+new Date() - start < 50));

                if (todo.length > 0) {
                    timer = setTimeout(arguments.callee, 25);
                } else {
                    callback && callback.call(context, items);
                }
            }, 25);
        } else {
            callback && S.later(callback, 0, false, context, [items]);
        }

        stopper.stop = function () {
            if (timer) {
                clearTimeout(timer);
                todo = [];
                items.each(function (item) {
                    item.stop();
                });
            }
        };

        return stopper;
    }


    Waterfall.ATTRS =
    /**
     * @lends Waterfall
     */
    {
        /**
         * 错乱节点容器
         * @type Node
         */
        container:{
            setter:function (v) {
                return $(v);
            }
        },

        /**
         * @private
         */
        curColHeights:{
            value:[]
        },


        minColCount:{
            value:1
        },

        effect:{
            value:{
                effect:"fadeIn",
                duration:1
            }
        },

        colWidth:{},

        colItems:{
            value:[]
        },

        /**
         * 调整时的特效
         * @since 1.3
         * @example
         * {
         *   duration:1,
         *   easing:"none"
         * }
         */
        adjustEffect:{}
    };

    function doResize() {
        var self = this,
            containerRegion = self._containerRegion;
        // 宽度没变就没必要调整
        if (containerRegion &&
            self.get("container").width() === containerRegion.width) {
            return
        }
        self.adjust();
    }

    function recalculate() {
        var self = this,
            container = self.get("container"),
            containerWidth = container.width(),
            curColHeights = self.get("curColHeights");
        curColHeights.length = Math.max(parseInt(containerWidth / self.get("colWidth")),
            self.get("minColCount"));
        self._containerRegion = {
            width:containerWidth
        };
        S.each(curColHeights, function (v, i) {
            curColHeights[i] = 0;
        });
        self.set("colItems", []);
    }

    function adjustItemAction(self, add, itemRaw, callback) {
        var effect = self.get("effect"),
            item = $(itemRaw),
            curColHeights = self.get("curColHeights"),
            container = self.get("container"),
            curColCount = curColHeights.length,
            dest = 0,
            containerRegion = self._containerRegion,
            guard = Number.MAX_VALUE;

        for (var i = 0; i < curColCount; i++) {
            if (curColHeights[i] < guard) {
                guard = curColHeights[i];
                dest = i;
            }
        }

        if (!curColCount) {
            guard = 0;
        }

        // 元素保持间隔不变，居中
        var margin = Math.max(containerRegion.width - curColCount * self.get("colWidth"), 0) / 2,
            destProp = {
                // left:dest * Math.max(containerRegion.width / curColCount, self.get("colWidth"))
                //    + containerRegion.left,
                // 元素间固定间隔好点
                left:dest * self.get("colWidth") + margin,
                top:guard
            };

        /*
         不在容器里，就加上
         */
        if (add) {
            // 初始需要动画，那么先把透明度换成 0
            item.css(destProp);
            if (effect && effect.effect) {
                item.css("visibility", "hidden");
            }
            container.append(item);
            callback && callback();
        }
        // 否则调整，需要动画
        else {
            var adjustEffect = self.get("adjustEffect");
            if (adjustEffect) {
                item.animate(destProp, adjustEffect.duration, adjustEffect.easing, callback);
            } else {
                item.css(destProp);
                callback && callback();
            }
        }

        // 加入到 dom 树才能取得高度
        curColHeights[dest] += item.outerHeight(true);
        var colItems = self.get("colItems");
        colItems[dest] = colItems[dest] || [];
        colItems[dest].push(item);
        item.attr("data-waterfall-col", dest);

        return item;
    }

    function addItem(itemRaw) {
        var self = this,
            item = adjustItemAction(self, true, itemRaw),
            effect = self.get("effect");
        if (effect && effect.effect) {
            // 先隐藏才能调用 fadeIn slideDown
            item.hide();
            item.css("visibility", "");
            item[effect.effect](
                effect.duration,
                0,
                effect.easing
            );
        }
    }

    S.extend(Waterfall, Base,
        /**
         * @lends Waterfall
         */
        {
            isAdjusting:function () {
                return !!this._adjuster;
            },

            _init:function () {
                var self = this;
                // 一开始就 adjust 一次，可以对已有静态数据处理
                doResize.call(self);
                self.__onResize = S.buffer(doResize, RESIZE_DURATION, self);
                $(win).on("resize", self.__onResize);
            },


            /**
             * 调整一个元素的高度
             * @param {Node} item 待调整的元素
             * @param {Object} cfg 控制配置
             * @param {Function} cfg.callback 调整结束后的回调
             * @param {Function} cfg.process
             * 用于做调整操作的函数，
             * 可以返回数字表示调整后的高度，
             * 不返回的话直接取调整后元素的高度
             * @param {Object} cfg.effect 其他元素配合调整位置的特效配置
             * @param {Number} cfg.effect.duration
             * @param {String} cfg.effect.easing
             */
            adjustItem:function (item, cfg) {
                var self = this;

                if (self.isAdjusting()) {
                    return;
                }

                var originalOuterHeight = item.outerHeight(true),
                    outerHeight;

                if (cfg.process) {
                    outerHeight = cfg.process.call(self);
                }

                if (outerHeight === undefined) {
                    outerHeight = item.outerHeight(true);
                }

                var diff = outerHeight - originalOuterHeight,
                    curColHeights = self.get("curColHeights"),
                    dest = parseInt(item.attr("data-waterfall-col")),
                    colItems = self.get("colItems")[dest],
                    items = [],
                    original = Math.max.apply(Math, curColHeights),
                    now;

                for (var i = 0; i < colItems.length; i++) {
                    if (colItems[i][0] === item[0]) {
                        break;
                    }
                }

                i++;

                while (i < colItems.length) {
                    items.push(colItems[i]);
                    i++;
                }

                curColHeights[dest] += diff;

                now = Math.max.apply(Math, curColHeights);

                if (now != original) {
                    self.get("container").height(now);
                }

                var effect = cfg.effect,
                    num = items.length;

                if (effect === undefined) {
                    effect = self.get("adjustEffect");
                }

                function check() {
                    num--;
                    if (num <= 0) {
                        self._adjuster = 0;
                        cfg && cfg.callback && cfg.callback.call(self);
                    }
                }

                if (!num) {
                    return check();
                }

                return self._adjuster = timedChunk(items, function (item) {
                    if (effect) {
                        item.animate({
                                top:parseInt(item.css("top")) + diff
                            },
                            effect.duration,
                            effect.easing,
                            check);
                    } else {
                        item.css("top", parseInt(item.css("top")) + diff);
                        check();
                    }
                });
            },

            /**
             * 删除一个元素
             * @param {Node} item 待删除的元素
             * @param {Object} cfg 控制配置
             * @param {Function} cfg.callback 删除结束后的回调
             * @param {Function} cfg.process 用于做删除操作的函数
             * @param {Object} cfg.effect 删除后其他元素调整位置特效配置
             * @param {Number} cfg.effect.duration
             * @param {String} cfg.effect.easing
             */
            removeItem:function (item, cfg) {
                cfg = cfg || {};
                var self = this,
                    callback = cfg.callback;
                self.adjustItem(item, S.mix(cfg, {
                    process:function () {
                        item.remove();
                        return 0;
                    },
                    callback:function () {
                        var dest = parseInt(item.attr("data-waterfall-col")),
                            colItems = self.get("colItems")[dest];
                        for (var i = 0; i < colItems.length; i++) {
                            if (colItems[i][0] == item[0]) {
                                colItems.splice(i, 1);
                                break;
                            }
                        }
                        callback && callback();
                    }
                }));
            },

            /**
             * 调整所有的元素位置
             * @param [callback]
             */
            adjust:function (callback) {
                S.log("waterfall:adjust");
                var self = this,
                    items = self.get("container").all(".ks-waterfall");
                /* 正在加，直接开始这次调整，剩余的加和正在调整的一起处理 */
                /* 正在调整中，取消上次调整，开始这次调整 */
                if (self.isAdjusting()) {
                    self._adjuster.stop();
                    self._adjuster = 0;
                }
                /*计算容器宽度等信息*/
                recalculate.call(self);
                var num = items.length;

                function check() {
                    num--;
                    if (num <= 0) {
                        self.get("container").height(Math.max.apply(Math, self.get("curColHeights")));
                        self._adjuster = 0;
                        callback && callback.call(self);
                        items.length && self.fire('adjustComplete', {
                            items:items
                        });
                    }
                }

                if (!num) {
                    return check();
                }

                return self._adjuster = timedChunk(items, function (item) {
                    adjustItemAction(self, false, item, check);
                });
            },

            addItems:function (items, callback) {
                var self = this;

                /* 正在调整中，直接这次加，和调整的节点一起处理 */
                /* 正在加，直接这次加，一起处理 */
                self._adder = timedChunk(items,
                    addItem,
                    self,
                    function () {
                        self.get("container").height(Math.max.apply(Math,
                            self.get("curColHeights")));
                        self._adder = 0;
                        callback && callback.call(self);
                        items.length && self.fire('addComplete', {
                            items:items
                        });
                    });

                return self._adder;
            },

            destroy:function () {
                $(win).detach("resize", this.__onResize);
            }
        });


    return Waterfall;

}, {
    requires:['node', 'base']
});
/**
 * 2012-03-21 yiminghe@gmail.com
 *  - 增加动画特效
 *  - 增加删除/调整接口
 **//**
 * @fileOverview load content
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/loader", function (S, Node, Waterfall) {

    var $ = Node.all,
        win=S.Env.host,
        SCROLL_TIMER = 50;

    /**
     * @class
     * @memberOf Waterfall
     */
    function Loader() {
        Loader.superclass.constructor.apply(this, arguments);
    }


    function doScroll() {
        var self = this;
        if (self.__pause) {
            return;
        }
        S.log("waterfall:doScroll");
        if (self.__loading) {
            return;
        }
        // 如果正在调整中，等会再看
        // 调整中的高度不确定，现在不适合判断是否到了加载新数据的条件
        if (self.isAdjusting()) {
            // 恰好 __onScroll 是 buffered . :)
            self.__onScroll();
            return;
        }
        var container = self.get("container"),
            colHeight = container.offset().top,
            diff = self.get("diff"),
            curColHeights = self.get("curColHeights");
        // 找到最小列高度
        if (curColHeights.length) {
            colHeight += Math.min.apply(Math, curColHeights);
        }
        // 动态载
        // 最小高度(或被用户看到了)低于预加载线
        if (diff + $(win).scrollTop() + $(win).height() > colHeight) {
            S.log("waterfall:loading");
            loadData.call(self);
        }
    }

    function loadData() {
        var self = this,
            container = this.get("container");

        self.__loading = 1;

        var load = self.get("load");

        load && load(success, end);

        function success(items) {
            self.__loading = 0;
            self.addItems(items);
        }

        function end() {
            self.end();
        }

    }

    Loader.ATTRS =
    /**
     * @lends Waterfall#
     */
    {
        diff:{
            getter:function (v) {
                return v || 0;
                // 默认一屏内加载
                //return $(window).height() / 4;
            }
        }
    };


    S.extend(Loader, Waterfall,
        /**
         * @lends Waterfall#
         */
        {
            _init:function () {
                var self = this;
                Loader.superclass._init.apply(self, arguments);
                self.__onScroll = S.buffer(doScroll, SCROLL_TIMER, self);
                $(win).on("scroll", self.__onScroll);
                doScroll.call(self);
            },

            end:function () {
                $(win).detach("scroll", this.__onScroll);
            },


            pause:function () {
                this.__pause = 1;
            },

            resume:function () {
                this.__pause = 0;
            },

            destroy:function () {
                var self = this;
                Loader.superclass.destroy.apply(self, arguments);
                $(win).detach("scroll", self.__onScroll);
            }
        });

    return Loader;

}, {
    requires:['node', './base']
});/**
 * @fileOverview waterfall
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall", function (S, Waterfall, Loader) {
    Waterfall.Loader = Loader;
    return Waterfall;
}, {
    requires:['waterfall/base', 'waterfall/loader']
});
