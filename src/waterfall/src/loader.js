/**
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
        var container = self.get("container");
        // in case container is display none
        if (!container[0].offsetWidth) {
            return;
        }
        var colHeight = container.offset().top,
            diff = self.get("diff"),
            curColHeights = self.get("curColHeights");
        // 找到最小列高度
        if (curColHeights.length) {
            colHeight += Math.min.apply(Math, curColHeights);
        }
        // 动态载
        // 最小高度(或被用户看到了)低于预加载线
        if (diff + $(win).scrollTop() + $(win).height() >= colHeight) {
            S.log("waterfall:loading");
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
            self.__onScroll();
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
});