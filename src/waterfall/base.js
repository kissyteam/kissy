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
        var todo = S.makeArray(items);
        var stopper = {},timer;
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
        var self = this;
        if (this._resizer) {
            this._resizer.stop();
            this._resizer = 0;
        }
        var container = this.get("container");
        recalculate.call(this);
        S.log("resize");
        this._resizer = this.adjust(function() {
            self._resizer = 0;
        });
    }

    function onResize() {
        if (this.__resizeTimer) {
            this.__resizeTimer.cancel();
        }
        this.__resizeTimer = S.later(doResize, RESIZE_DURATION, false, this);
    }

    function recalculate() {
        var container = this.get("container");
        var containerWidth = this.get("container").width();
        var containerRegion = this._containerRegion;
        if (!containerRegion || containerWidth !== containerRegion.width) {
            var cols = Math.max(parseInt(containerWidth / this.get("colWidth")),
                this.get("minColCount"));
            var curColHeights = this.get("curColHeights");
            curColHeights.length = cols;
            S.each(curColHeights, function(v, i) {
                curColHeights[i] = 0;
            });
            this._containerRegion = S.mix({
                width:containerWidth
            }, container.offset());
        }
    }

    function adjustItem(itemRaw) {
        var item = $(itemRaw),
            curColHeights = this.get("curColHeights"),
            container = this.get("container"),
            curColCount = curColHeights.length,
            dest = 0,
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
        var containerRegion = this._containerRegion;
        item.css({
            position:"absolute",
            left:dest * Math.max(containerRegion.width / curColCount, this.get("colWidth"))
                + containerRegion.left,
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
            recalculate.call(this);
            $(window).on("resize", onResize, this);
        },

        adjust:function(callback) {
            var items = this.get("container").all(".ks-waterfall");
            return timedChunk(items, adjustItem, this, callback);
        },

        addItems:function(items, callback) {
            /* 正在缩放中，取消*/
            if (this._resizer) {
                return;
            }
            return timedChunk(items, this.addItem, this, callback);
        },

        addItem:function(itemRaw) {
            var curColHeights = this.get("curColHeights"),
                container = this.get("container"),
                item = adjustItem.call(this, itemRaw),
                effect = this.get("effect");
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