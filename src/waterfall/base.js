/**
 * intervein elements dynamically
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/base", function(S, Node, Base) {

    var $ = Node.all;

    var RESIZE_DURATION = 50;

    function Intervein() {
        Intervein.superclass.constructor.apply(this, arguments);
        this._init();
    }


    function timedChunk(items, process, context, callback) {
        var todo = S.makeArray(items),
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
            callback && callback.call(context, items);
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
                return $(v);
            }
        },
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
        colWidth:{}
    };

    function doResize() {
        var self = this,
            container = self.get("container");
        if (self._resizer) {
            self._resizer.stop();
            self._resizer = 0;
        }
        recalculate.call(self);
        self._resizer = self.adjust(function() {
            self._resizer = 0;
        });
    }

    function onResize() {
        var self = this,
            container = self.get("container"),
            containerRegion = self._containerRegion;
        // 宽度没变就没必要调整
        if (container.width() === containerRegion.width) {
            return
        }
        if (self.__resizeTimer) {
            self.__resizeTimer.cancel();
        }
        self.__resizeTimer = S.later(doResize, RESIZE_DURATION, false, self);
    }

    function recalculate() {
        var self = this,
            container = self.get("container"),
            containerWidth = container.width(),
            curColHeights = self.get("curColHeights");
        curColHeights.length = Math.max(parseInt(containerWidth / self.get("colWidth")),
            self.get("minColCount"));
        self._containerRegion = S.mix({
            width:containerWidth
        }, container.offset());
        S.each(curColHeights, function(v, i) {
            curColHeights[i] = 0;
        });
    }

    function adjustItem(itemRaw) {
        var self = this,
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
        var margin = (containerRegion.width - curColCount * self.get("colWidth")) / 2;
        item.css({
            position:"absolute",
            //left:dest * Math.max(containerRegion.width / curColCount, self.get("colWidth"))
            //    + containerRegion.left,
            // 元素间固定间隔好点
            left:dest * self.get("colWidth") + containerRegion.left + margin,
            top:guard + containerRegion.top
        });
        if (!container.contains(item)) {
            container.append(item);
        }
        curColHeights[dest] += item.height();
        return item;
    }

    S.extend(Intervein, Base, {
        _init:function() {
            var self = this;
            recalculate.call(self);
            $(window).on("resize", onResize, self);
        },

        adjust:function(callback) {
            S.log("waterfall:adjust");
            var self = this,
                items = self.get("container").all(".ks-waterfall");
            return timedChunk(items, adjustItem, self, callback);
        },

        addItems:function(items, callback) {
            var self = this;
            /* 正在缩放中，取消*/
            if (self._resizer) {
                return;
            }
            return timedChunk(items, self.addItem, self, callback);
        },

        addItem:function(itemRaw) {
            var self = this,
                curColHeights = self.get("curColHeights"),
                container = self.get("container"),
                item = adjustItem.call(self, itemRaw),
                effect = self.get("effect");
            if (!effect.effect) {
                return;
            }
            item[effect.effect](effect.duration, undefined, effect.easing);
        },

        destroy:function() {
            $(window).detach("resize", onResize, this);
        }
    });


    return Intervein;

}, {
    requires:['node','base']
});