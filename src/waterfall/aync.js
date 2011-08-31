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
        S.log("doScroll");
        if (this.__loading) {
            return;
        }
        var container = this.get("container");
        var colHeight = Number.MAX_VALUE;
        var curColHeights = this.get("curColHeights");
        // 找到最小列高度
        S.each(curColHeights, function(v) {
            if (colHeight > v) {
                colHeight = v;
            }
        });
        if (curColHeights.length) {
            colHeight = container.offset().top + colHeight;
        } else {
            colHeight = container.offset().top;
        }
        var diff = this.get("diff");

        // S.log(diff + " : " + $(window).scrollTop() + " : " + colHeight);
        // 动态载
        if (diff + $(window).scrollTop() + $(window).height() > colHeight) {
            // S.log("loading");
            loadData.call(this);
        }
    }

    function onScroll() {
        if (this.__scrollTimer) {
            this.__scrollTimer.cancel();
        }
        this.__scrollTimer = S.later(doScroll, SCROLL_TIMER, false, this);
    }


    function loadData() {
        this.__loading = true;
        var container = this.get("container");
        var self = this;
        io(S.mix({
            data:{
                from:container.all(".ks-waterfall").length
            },
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
        }, self.get("remote")));
    }

    Async.ATTRS = {
        remote:{},
        diff:{
            getter:function(v) {
                return v || 0;
                // 默认一屏内加载
                return $(window).height() / 4;
            }
        },
        itemTpl:{}
    };

    S.extend(Async, Intervein, {
        _init:function() {
            Async.superclass._init.apply(this, arguments);
            $(window).on("scroll", onScroll, this);
            loadData.call(this);
        },

        destroy:function() {
            Async.superclass.destroy.apply(this, arguments);
            $(window).detach("scroll", onScroll, this);
        }
    });

    return Async;

}, {
    requires:['node','ajax','template','./base']
});