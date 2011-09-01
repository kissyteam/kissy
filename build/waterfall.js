/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 1 12:22
*/
/**
 * load content from remote async
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/async", function(S, Node, io, Template, Intervein) {

    var $ = Node.all;

    var SCROLL_TIMER = 50;

    function Async() {
        Async.superclass.constructor.apply(this, arguments);
    }


    function doScroll() {
        var self = this;
        S.log("waterfall:doScroll");
        if (self.__loading) {
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
        // S.log(diff + " : " + $(window).scrollTop() + " : " + colHeight);
        // 动态载
        if (diff + $(window).scrollTop() + $(window).height() > colHeight) {
            S.log("waterfall:loading");
            loadData.call(self);
        }
    }

    function loadData() {
        var self = this,
            container = this.get("container");

        self.__loading = true;
        var remote = self.get("remote");
        if (S.isFunction(remote)) {
            remote = remote();
        }
        io(S.mix({
            success:function(d) {
                if (d.end) {
                    $(window).detach("scroll", onScroll, self);
                }
                self.__loading = false;
                var data = d.data,
                    template = Template(self.get("itemTpl")),
                    items = [];

                S.each(data, function(d) {
                    var html = template.render(d);
                    items.push($(html));
                });
                self.addItems(items);
            }
        }, remote));
    }

    Async.ATTRS = {
        remote:{},
        diff:{
            getter:function(v) {
                return v || 0;
                // 默认一屏内加载
                //return $(window).height() / 4;
            }
        },
        itemTpl:{}
    };

    S.extend(Async, Intervein, {
        _init:function() {
            var self = this;
            Async.superclass._init.apply(self, arguments);
            self.__onScroll = S.buffer(doScroll, SCROLL_TIMER, self).fn;
            $(window).on("scroll", self.__onScroll);
            loadData.call(self);
        },

        destroy:function() {
            var self = this;
            Async.superclass.destroy.apply(self, arguments);
            $(window).detach("scroll", self.__onScroll);
        }
    });

    return Async;

}, {
    requires:['node','ajax','template','./base']
});/**
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
            container = self.get("container"),
            containerRegion = self._containerRegion;
        // 宽度没变就没必要调整
        if (container.width() === containerRegion.width) {
            return
        }
        if (self._resizer) {
            self._resizer.stop();
            self._resizer = 0;
        }
        recalculate.call(self);
        self._resizer = self.adjust(function() {
            self._resizer = 0;
        });
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
            left:dest * self.get("colWidth") + margin,
            top:guard
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
            self.__onResize = S.buffer(doResize, RESIZE_DURATION,self).fn;
            $(window).on("resize", self.__onResize);
        },

        adjust:function(callback) {
            S.log("waterfall:adjust");
            var self = this,
                items = self.get("container").all(".ks-waterfall");
            return timedChunk(items, adjustItem, self, function() {
                self.get("container").height(Math.max.apply(Math, self.get("curColHeights")));
                callback && callback.call(self);
            });
        },

        addItems:function(items, callback) {
            var self = this;
            /* 正在缩放中，取消*/
            if (self._resizer) {
                return;
            }
            return timedChunk(items, self.addItem, self, function() {
                self.get("container").height(Math.max.apply(Math, self.get("curColHeights")));
                callback && callback.call(self);
            });
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
            $(window).detach("resize", this.__onResize);
        }
    });


    return Intervein;

}, {
    requires:['node','base']
});KISSY.add("waterfall", function(S, Intervein, Async) {
    Intervein.Async = Async;
    return Intervein;
}, {
    requires:['waterfall/base','waterfall/async']
});
