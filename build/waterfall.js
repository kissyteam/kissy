/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:23
*/
/**
 * @ignore
 * Make Elements flow like waterfall.
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/base", function (S, Node, Base) {

    var $ = Node.all,
        win = S.Env.host,
        RESIZE_DURATION = 50;

    /**
     * Make Elements flow like waterfall.
     * @class KISSY.Waterfall
     */
    function Waterfall() {
        var self = this;
        Waterfall.superclass.constructor.apply(self, arguments);
        // windows ie<9
        //  - 出滚动条就会触发 resize 事件
        //  - ie<8 出不出滚动条，窗口区域一致
        //  - ie=8 出了滚动条窗口区域和以前不一样了，触发调整逻辑
        var onResize = self.__onResize = S.buffer(doResize, RESIZE_DURATION, self);
        // 一开始就 adjust 一次，可以对已有静态数据处理
        doResize.call(self);
        $(win).on("resize", onResize);
    }

    function timedChunk(items, process, context, callback) {

        var stopper = {},
            timer, todo;

        function start() {

            todo = [].concat(S.makeArray(items));

            if (todo.length > 0) {
                // 2012-07-10
                // 第一次不延迟，防止
                // adjust -> recalculate -> addItem -> adjustItemAction
                // 打乱了固定在左上角的元素
                (function () {
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
                })();
            } else {
                callback && callback.call(context, items);
            }
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

        // 启动函数，防止同步时立刻被清掉了
        stopper.start = start;

        return stopper;
    }


    Waterfall.ATTRS = {
        /**
         * Container which contains waterfall elements.
         * @cfg {KISSY.NodeList} container
         */
        /**
         * @ignore
         */
        container: {
            setter: function (v) {
                return $(v);
            }
        },

        /**
         * Horizontal alignment of waterfall items with container.
         * Enum: 'left','center','right','justify'.
         * @cfg {String} align
         */
        /**
         * @ignore
         */
        align: {
            value: 'center'
        },

        /**
         * Minimum col count of waterfall items.
         * Event window resize to 0.
         * Defaults to: 1.
         * @cfg {Number} minColCount
         */
        /**
         * @ignore
         */
        minColCount: {
            value: 1
        },

        /**
         * Effect config object when waterfall item is added to container.
         *
         * Defaults to: { effect:"fadeIn",duration:1 }
         * @cfg {Object} effect
         *
         *      for example:
         *      {
         *          effect:'fadeIn', // or slideUp
         *          duration:1 // unit is second
         *      }
         */
        /**
         * @ignore
         */
        effect: {
            value: {
                effect: "fadeIn",
                duration: 1
            }
        },

        /**
         * Column's width.
         * @cfg {Number|Function} colWidth
         */
        /**
         * @ignore
         */
        colWidth: {},

        /**
         * Effect config object when waterfall item is adjusted on window resize.
         *
         * Defaults to: { easing:"",duration:1 }
         * @cfg {Object} adjustEffect
         *
         *      for example:
         *      {
         *          easing:'', // easing type
         *          duration:1 // unit is second
         *      }
         */
        /**
         * @ignore
         */
        adjustEffect: {}
    };

    function doResize() {
        var self = this,
            colWidth = self.get('colWidth'),
            container = self.get('container'),
            containerRegion = self._containerRegion || {};

        // support fluid width
        // responsive design!
        if (S.isFunction(colWidth)) {
            colWidth = colWidth(self);
        }
        // S.log('resize: colWidth: ' + colWidth);

        if (
        // container display none ...
            !container[0].offsetWidth ||
                // 容器宽度没变并且每列宽度也没变就没必要调整
                self._colWidth === colWidth &&
                    container.width() === containerRegion.width) {
            return
        }
        self._colWidth = colWidth;
        self.adjust();
    }

    function recalculate() {
        var self = this,
            container = self.get("container"),
            containerWidth = container.width(),
            curColHeights = self._curColHeights || [];
        /**
         * Array of height of current waterfall cols.
         * @protected
         * @type {Number[]}
         * @property curColHeights
         */
        self._curColHeights = curColHeights;
        // 当前列数
        curColHeights.length = Math.max(Math.floor(containerWidth / self._colWidth), self.get("minColCount"));
        // 当前容器宽度
        self._containerRegion = {
            width: containerWidth
        };
        S.each(curColHeights, function (v, i) {
            curColHeights[i] = 0;
        });
        /**
         * Waterfall items grouped by col.
         * @private
         * @type {KISSY.NodeList[][]}
         * @property colItems
         *
         *      for example:
         *      [
         *          [ node11, node12 ],
         *          [ node21, node22 ]
         *      ]
         */
        self._colItems = [];
    }

    function adjustItemAction(self, add, itemRaw, callback) {
        var effect = self.get("effect"),
            item = $(itemRaw),
            align = self.get("align"),
            margin,
            curColHeights = self._curColHeights,
            container = self.get("container"),
            colWidth = self._colWidth,
            curColCount = curColHeights.length,
            col = 0,
            colProp,
            containerRegion = self._containerRegion,
            guard = Number['MAX_VALUE'];

        if (!curColCount) {
            return undefined;
        }

        // 固定左边或右边
        if (item.hasClass("ks-waterfall-fixed-left")) {
            col = 0;
        } else if (item.hasClass("ks-waterfall-fixed-right")) {
            col = curColCount > 0 ? curColCount - 1 : 0;
        } else {
            // 否则找到最短的列
            for (var i = 0; i < curColCount; i++) {
                if (curColHeights[i] < guard) {
                    guard = curColHeights[i];
                    col = i;
                }
            }
        }

        // 元素保持间隔不变，居中
        margin = align === 'left' ? 0 :
            Math.max(containerRegion.width -
                curColCount * colWidth, 0);

        if (align === 'center') {
            margin /= 2;
        }

        if (align === 'justify' && curColCount > 1) {
            margin = col > 0 ? Math.max(
                (containerRegion.width - colWidth) / (curColCount - 1) - colWidth,
                0) * col : 0;
        }

        colProp = {
            // 元素间固定间隔好点
            left: col * colWidth + margin,
            top: curColHeights[col]
        };

        function end(ifNotCall) {
            // 加入到 dom 树才能取得高度
            curColHeights[col] += item.outerHeight(true);
            var colItems = self._colItems;
            colItems[col] = colItems[col] || [];
            colItems[col].push(item);
            item.attr("data-waterfall-col", col);
            var className = item[0].className
                .replace(/\s*ks-waterfall-col-(?:first|last|\d+)/g, "");
            className += " ks-waterfall-col-" + col;
            if (col == 0) {
                className += " ks-waterfall-col-first";
            } else if (col == curColHeights.length - 1) {
                className += " ks-waterfall-col-last";
            }
            item[0].className = className;
            if (!ifNotCall) {
                callback && callback();
            }
        }


        /*
         不在容器里，就加上
         */
        if (add) {
            // 初始需要动画，那么先把透明度换成 0
            item.css(colProp);
            if (effect && effect.effect) {
                // has layout to allow to compute height
                item.css("visibility", "hidden");
            }
            container.append(item);
            end();
        }
        // 否则调整，需要动画
        else {
            var adjustEffect = self.get("adjustEffect");
            if (adjustEffect) {
                end(1);
                item.animate(colProp, adjustEffect.duration,
                    adjustEffect.easing, callback);
            } else {
                item.css(colProp);
                end();
            }
        }


        return item;
    }

    function addItem(itemRaw) {
        var self = this,
        // update curColHeights first
        // because may slideDown to affect height
            item = adjustItemAction(self, true, itemRaw),
            effect = self.get("effect");
        // then animate
        if (item && effect && effect.effect) {
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

    S.extend(Waterfall, Base, {
        /**
         * Whether is adjusting waterfall items.
         * @return Boolean
         */
        isAdjusting: function () {
            return !!this._adjuster;
        },

        /**
         * Whether is adding waterfall item.
         * @return Boolean
         */
        'isAdding': function () {
            return !!this._adder;
        },

        /**
         * Adjust the height of one specified item.
         * @param {KISSY.NodeList} item Waterfall item to be adjusted.
         * @param {Object} cfg Config object.
         * @param {Function} cfg.callback Callback function after the item is adjusted.
         * @param {Function} cfg.process Adjust logic function.
         * If returns a number, it is used as item height after adjust.
         * else use item.outerHeight(true) as item height after adjust.
         * @param {Object} cfg.effect Same as {@link KISSY.Waterfall#adjustEffect}
         * @param {Number} cfg.effect.duration
         * @param {String} cfg.effect.easing
         */
        adjustItem: function (item, cfg) {
            var self = this;
            cfg = cfg || {};

            if (self.isAdjusting()) {
                return undefined;
            }

            var originalOuterHeight = item['outerHeight'](true),
                outerHeight;

            if (cfg.process) {
                outerHeight = cfg.process.call(self);
            }

            if (outerHeight === undefined) {
                outerHeight = item['outerHeight'](true);
            }

            var diff = outerHeight - originalOuterHeight,
                curColHeights = self._curColHeights,
                col = parseInt(item['attr']("data-waterfall-col")),
                colItems = self._colItems[col],
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

            curColHeights[col] += diff;

            now = Math.max.apply(Math, curColHeights);

            if (now != original) {
                self.get("container").height(now);
            }

            var effect = cfg.effect,
                num = items.length;

            if (!num) {
                return cfg.callback && cfg.callback.call(self);
            }

            function check() {
                num--;
                if (num <= 0) {
                    self._adjuster = 0;
                    cfg.callback && cfg.callback.call(self);
                }
            }

            if (effect === /**
             @ignore
             @type String
             */undefined) {
                effect = self.get("adjustEffect");
            }

            self._adjuster = timedChunk(items, function (item) {
                if (effect) {
                    item.animate({
                            top: parseInt(item.css("top")) + diff
                        },
                        effect.duration,
                        effect.easing,
                        check);
                } else {
                    item.css("top", parseInt(item.css("top")) + diff);
                    check();
                }
            });

            self._adjuster.start();

            return self._adjuster;
        },

        /**
         * Remove a waterfall item.
         * @param {KISSY.NodeList} item Waterfall item to be removed.
         * @param {Object} cfg Config object.
         * @param {Function} cfg.callback Callback function to be called after remove.
         * @param {Object} cfg.effect Same as {@link KISSY.Waterfall#adjustEffect}
         * @param {Number} cfg.effect.duration
         * @param {String} cfg.effect.easing
         */
        removeItem: function (item, cfg) {
            cfg = cfg || {};
            var self = this,
                callback = cfg.callback;
            self.adjustItem(item, S.mix(cfg, {
                process: function () {
                    item['remove']();
                    return 0;
                },
                callback: function () {
                    var col = parseInt(item['attr']("data-waterfall-col")),
                        colItems = self._colItems[col];
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
         * Readjust existing waterfall item.
         * @param {Function} [callback]
         * Callback function to be called after adjust.
         */
        adjust: function (callback) {

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
                    self.get("container").height(Math.max.apply(Math, self._curColHeights));
                    self._adjuster = 0;
                    callback && callback.call(self);
                    self.fire('adjustComplete', {
                        items: items
                    });
                }
            }

            if (!num) {
                return callback && callback.call(self);
            }

            self._adjuster = timedChunk(items, function (item) {
                adjustItemAction(self, false, item, check);
            });

            self._adjuster.start();

            return self._adjuster;
        },

        /**
         * Add array of waterfall items to current instance.
         * @param {NodeList[]} items Waterfall items to be added.
         * @param {Function} [callback] Callback function to be called after waterfall items are added.
         */
        addItems: function (items, callback) {
            var self = this;

            /* 正在调整中，直接这次加，和调整的节点一起处理 */
            /* 正在加，直接这次加，一起处理 */
            self._adder = timedChunk(items,
                addItem,
                self,
                function () {
                    self.get("container").height(Math.max.apply(Math,
                        self._curColHeights));
                    self._adder = 0;
                    callback && callback.call(self);
                    self.fire('addComplete', {
                        items: items
                    });
                });

            self._adder.start();

            return self._adder;
        },

        /**
         * Destroy current instance.
         */
        destroy: function () {
            var self = this;
            var onResize = self.__onResize;
            $(win).detach("resize", onResize);
            onResize.stop();

            self.fire('destroy');
            self.__destroyed = 1;
        }
    });


    return Waterfall;

}, {
    requires: ['node', 'base']
});
/**
 * @ignore
 *
 * 2012-07-10
 *  - 注意滚动条在 ie 下导致的重新调整
 *  - timeChunk 第一次不 setTimeout
 *
 * 2012-03-21 yiminghe@gmail.com
 *  - 增加动画特效
 *  - 增加删除/调整接口
 **//**
 * @ignore
 * Dynamic load waterfall items by monitor window scroll.
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall/loader", function (S, Node, Waterfall) {

    var $ = Node.all,
        win = S.Env.host,
    // > timeChunk interval to allow adjust first
        SCROLL_TIMER = 50;

    /**
     * @class KISSY.Waterfall.Loader
     * @extends KISSY.Waterfall
     * Dynamic load waterfall items by monitoring window scroll.
     */
    function Loader() {
        var self = this;
        Loader.superclass.constructor.apply(self, arguments);
        self.__onScroll = S.buffer(doScroll, SCROLL_TIMER, self);
        self.start();
    }

    function doScroll() {
        var self = this;

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
        var container = self.get("container");
        // in case container is display none
        if (!container[0].offsetWidth) {
            return;
        }
        var colHeight = container.offset().top,
            diff = self.get("diff"),
            curColHeights = self._curColHeights;
        // 找到最小列高度
        if (curColHeights.length) {
            colHeight += Math.min.apply(Math, curColHeights);
        }
        // 动态载
        // 最小高度(或被用户看到了)低于预加载线
        if (diff + $(win).scrollTop() + $(win).height() >= colHeight) {

            loadData.call(self);
        }
    }

    function loadData() {
        var self = this,
            container = self.get("container");

        self.__loading = 1;

        var load = self.get("load");

        load && load(success, end);

        function success(items, callback) {
            self.__loading = 0;
            self.addItems(items, function () {
                callback && callback.apply(this, arguments);
                // 加载完不够一屏再次检测
                doScroll.call(self);
            });
        }

        function end() {
            self.end();
        }
    }

    Loader.ATTRS = {
        /**
         * Preload distance below viewport.
         * Defaults to: 0.
         * @cfg {Number} diff
         */
        /**
         * @ignore
         */
        diff: {
            value: 0
        }
    };


    S.extend(Loader, Waterfall, {

        /**
         * @ignore
         */
        start: function () {
            this.resume();
        },

        /**
         * @ignore
         */
        end: function () {
            this.pause();
        },

        /**
         * Stop monitor scroll on window.
         */
        pause: function () {
            var self = this;
            if (self.__destroyed) {
                return;
            }
            $(win).detach("scroll", self.__onScroll);
            self.__onScroll.stop();
        },

        /**
         * Start monitor scroll on window.
         */
        resume: function () {
            var self = this;
            if (self.__destroyed) {
                return;
            }
            $(win).on("scroll", self.__onScroll);
            self.__started = 1;
            // 初始化时立即检测一次，但是要等初始化 adjust 完成后.
            doScroll.call(self);
        },

        /**
         * Destroy this instance.
         */
        destroy: function () {
            var self = this;
            self.end();
            Loader.superclass.destroy.apply(self, arguments);
        }
    });

    return Loader;

}, {
    requires: ['node', './base']
});/**
 * @ignore
 * waterfall
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall", function (S, Waterfall, Loader) {
    Waterfall.Loader = Loader;
    return Waterfall;
}, {
    requires:['waterfall/base', 'waterfall/loader']
});
