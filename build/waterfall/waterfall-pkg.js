/*
Copyright 2011, KISSY UI Library v1.1.8dev
MIT Licensed
build time: ${build.time}
*/
/**
 * intervein elements dynamically
 * @author yiminghe@gmail.com
 */
//KISSY.add("waterfall/base", function(S, undefined) {
KISSY.add("waterfall", function(S, undefined) {
    var Base = S.Base;

    // 增加 S.buffer
    S.mix(S, {
        /**
         * buffers a call between  a fixed time
         * @param {function} fn
         * @param {object} context
         * @param {Number} ms
         */
        buffer:function(fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return (function() {
                    fn.apply(context || this, arguments);
                });
            }
            var bufferTimer = 0;

            function f() {
                f.stop();
                bufferTimer = S.later(fn, ms, false, context || this);
            }

            f.stop = function() {
                if (bufferTimer) {
                    bufferTimer.cancel();
                    bufferTimer = 0;
                }
            };

            return f;
        }
    });


    var RESIZE_DURATION = 50;

    function Intervein() {
        Intervein.superclass.constructor.apply(this, arguments);
        this._init();
    }


    function timedChunk(items, process, context, callback) {
        var todo = [].concat(S.makeArray(items)),
            stopper = {},
            timer;
        if (todo.length > 0) {
            timer = setTimeout(function() {
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

        stopper.stop = function() {
            if (timer) {
                clearTimeout(timer);
                todo = [];
            }
        };

        return stopper;
    }


    Intervein.ATTRS = {
        /**
         * 错乱节点容器
         * @type Node
         */
        container:{
            setter:function(v) {
                return S.one(v);
            }
        },

        /**
         * 列数,及每个列当前的高度值
         * @private
         */
        curColHeights:{
            value:[]
        },


        /**
         * 最小的列数
         * @type Number
         */
        minColCount:{
            value:1
        },

        /**
         * 动画效果, fadeIn/slideDown/show
         * @type String
         */
        effect:{
            value:{
                effect:"fadeIn",
                duration:1
            }
        },

        /**
         * 列宽
         * @type Number
         */
        colWidth:{}
    };

    function doResize() {
        var self = this,
            containerRegion = self._containerRegion;
        // 宽度没变就没必要调整
        if (containerRegion && self.get("container").width() === containerRegion.width) {
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
        S.each(curColHeights, function(v, i) {
            curColHeights[i] = 0;
        });
    }

    function adjustItem(itemRaw) {
        var self = this,
            effect = self.get("effect"),
            item = new S.Node(itemRaw),
            curColHeights = self.get("curColHeights"),
            container = self.get("container"),
            curColCount = curColHeights.length,
            dest = 0,
            containerRegion = self._containerRegion,
            guard = Number.MAX_VALUE;

        // 寻找哪列的高度最小, 最小的即是要插入新元素的那列
        for (var i = 0; i < curColCount; i++) {
            if (curColHeights[i] < guard) {
                guard = curColHeights[i];
                dest = i;
            }
        }
        // 初始时, 没列, 所以这时 curColCount 为 0
        if (!curColCount) {
            guard = 0;
        }
        // 元素保持间隔不变，居中
        var margin = Math.max(containerRegion.width - curColCount * self.get("colWidth"), 0) / 2;
        item.css({
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
        curColHeights[dest] += item[0].offsetHeight + (parseInt(item.css('marginTop')) || 0) + (parseInt(item.css('marginBottom')) || 0);
        return item;
    }

    S.extend(Intervein, Base, {
        /**
         * @return {Boolean} 是否正在调整中
         */
        isAdjusting:function() {
            return !!this._adjuster;
        },
        _init:function() {
            var self = this;
            // 一开始就 adjust 一次，可以对已有静态数据处理
            doResize.call(self);
            // 窗口变化时, 重新计算各项位置
            self.__onResize = S.buffer(doResize, RESIZE_DURATION, self);
            S.Event.on(window, "resize", self.__onResize);
        },

        /**
         * 调整所有的元素位置
         * @param callback
         */
        adjust:function(callback) {
            S.log("waterfall:adjust");
            var self = this,
                items = self.get("container").all(".ks-waterfall"),
                count = items.length;
            /* 正在加，直接开始这次调整，剩余的加和正在调整的一起处理 */
            /* 正在调整中，取消上次调整，开始这次调整 */
            if (self.isAdjusting()) {
                self._adjuster.stop();
            }
            /*计算容器宽度等信息*/
            recalculate.call(self);
            return self._adjuster = timedChunk(items, self._addItem, self, function() {
                self.get("container").height(Math.max.apply(Math, self.get("curColHeights")));
                self._adjuster = 0;
                callback && callback.call(self);

                count && self.fire('adjustComplete', {
                    items:items
                });
            });
        },

        addItems:function(items, callback) {
            var self = this,
                count = items.length;

            /* 正在调整中，直接这次加，和调整的节点一起处理 */
            /* 正在加，直接这次加，一起处理 */
            self._adder = timedChunk(items,
                self._addItem,
                self,
                function() {
                    self.get("container").height(Math.max.apply(Math,
                        self.get("curColHeights")));
                    self._adder = 0;
                    callback && callback.call(self);

                    count && self.fire('addComplete', {
                        items:items
                    });
                });

            return self._adder;
        },

        _addItem:function(itemRaw) {
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
                easing:effect.easing || 'easeNone',
                complete:function() {
                    item.css("opacity", "");
                }
            });
        },

        destroy:function() {
            S.Event.remove(window, "resize", this.__onResize);
        }
    });

    S.Waterfall = Intervein;

}, {
    requires:['template']
});/**
 * load content from remote async
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/loader", function(S, undefined) {

    var SCROLL_TIMER = 50;

    function Loader() {
        Loader.superclass.constructor.apply(this, arguments);
    }


    function doScroll() {
        var self = this;

        S.log("waterfall:doScroll");
        if (self.__loading || self.__pause) {
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
        if (diff + S.DOM.scrollTop() + S.DOM.viewportHeight() > colHeight) {
            S.log("waterfall:loading");
            loadData.call(self);
        }
    }

    function loadData() {
        var self = this,
            container = this.get("container");
        self.__loading = true;

        var load = self.get("load");

        load && load(success, end);

        function success(items) {
            self.__loading = false;
            self.addItems(items);
        }

        function end() {
            self.end();
        }
    }

    Loader.ATTRS = {
        diff:{
            getter:function(v) {
                return v || 0;
            }
        }
    };

    S.extend(Loader, S.Waterfall, {
        _init:function() {
            var self = this;
            Loader.superclass._init.apply(self, arguments);
            self.__onScroll = S.buffer(doScroll, SCROLL_TIMER, self);
            S.Event.on(window, "scroll", self.__onScroll);
            doScroll.call(self);
        },
        end: function() {
            this.__loading = false;
            S.Event.remove(window, "scroll", this.__onScroll);
        },
        pause:function() {
            this.__pause = 1;
        },

        resume:function() {
            this.__pause = 0;
        },
        destroy:function() {
            var self = this;
            Loader.superclass.destroy.apply(self, arguments);
            S.Event.remove(window, "scroll", self.__onScroll);
        }
    });

    S.Waterfall.Loader = Loader;
}, {
    host:'waterfall'
});
