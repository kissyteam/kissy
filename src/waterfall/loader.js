/**
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