/**
 * @fileOverview intervein elements dynamically
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/base", function (S, Node, Base) {

    var $ = Node.all,
        win=S.Env.host,
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
        }
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

    function adjustItem(itemRaw) {
        var self = this,
            effect = self.get("effect"),
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
        var margin = Math.max(containerRegion.width - curColCount * self.get("colWidth"), 0) / 2;
        item.css({
            // left:dest * Math.max(containerRegion.width / curColCount, self.get("colWidth"))
            //    + containerRegion.left,
            // 元素间固定间隔好点
            left:dest * self.get("colWidth") + margin,
            top:guard
        });
        /*不在容器里，就加上*/
        if (!container.contains(item)) {
            if (effect && effect.effect == "fadeIn") {
                item.css("opacity", 0);
            }
            container.append(item);
        }
        curColHeights[dest] += item.outerHeight(true);
        var colItems = self.get("colItems");
        colItems[dest] = colItems[dest] || [];
        colItems[dest].push(item);
        item.attr("data-waterfall-col", dest);
        return item;
    }

    function addItem(itemRaw) {
        var self = this,
            curColHeights = self.get("curColHeights"),
            container = self.get("container"),
            item = adjustItem.call(self, itemRaw),
            effect = self.get("effect");
        if (!effect.effect ||
            effect.effect !== "fadeIn") {
            return;
        }
        // only allow fadeIn temporary
        item.animate({
            opacity:1
        }, {
            duration:effect.duration,
            easing:effect.easing,
            complete:function () {
                item.css("opacity", "");
            }
        });
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

            adjustItem:function (item, cfg) {
                var self = this;

                if (self.isAdjusting()) {
                    return;
                }

                var originalOuterHeight = item.outerHeight(true),
                    outerHeight,
                    remove = false;
                if (cfg.process) {
                    remove = cfg.process.call(self);
                }
                if (remove) {
                    outerHeight = 0;
                } else {
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

                return self._adjuster = timedChunk(items, function (item) {
                    item.css("top", parseInt(item.css("top")) + diff);
                }, null, function () {
                    self._adjuster = 0;
                    cfg && cfg.callback && cfg.callback.call(self);
                });
            },

            removeItem:function (item, cfg) {
                var self = this;
                self.adjustItem(item, {
                    process:function () {
                        item.remove();
                        return true;
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
                        if (cfg && cfg.callback) {
                            cfg.callback.call(self);
                        }
                    }
                });
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
                }
                /*计算容器宽度等信息*/
                recalculate.call(self);
                return self._adjuster = timedChunk(items, addItem, self, function () {
                    self.get("container").height(Math.max.apply(Math, self.get("curColHeights")));
                    self._adjuster = 0;
                    callback && callback.call(self);

                    items.length && self.fire('adjustComplete', {
                        items:items
                    });
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