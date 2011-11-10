/**
 * @module  anim-node-plugin
 * @author  yiminghe@gmail.com,
 *          lifesinger@gmail.com,
 *          qiaohua@taobao.com,
 *
 */
KISSY.add('node/anim', function(S, DOM, Anim, Node, undefined) {

    var FX = [
        // height animations
        [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
        // width animations
        [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
        // opacity animations
        [ "opacity" ]
    ];

    function getFxs(type, num, from) {
        var ret = [],
            obj = {};
        for (var i = from || 0; i < num; i++) {
            ret.push.apply(ret, FX[i]);
        }
        for (i = 0; i < ret.length; i++) {
            obj[ret[i]] = type;
        }
        return obj;
    }

    S.augment(Node, {
        animate:function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return self;
        },
        stop:function(end, clearQueue) {
            var self = this;
            S.each(self, function(elem) {
                Anim.stop(elem, end, clearQueue);
            });
            return self;
        },
        stopQueue:function(queueName, end, clearQueue) {
            var self = this;
            S.each(self, function(elem) {
                Anim.stopQueue(elem, queueName, end, clearQueue);
            });
            return self;
        },
        toggle:function(speed) {
            var self = this;
            self[self.css("display") === "none" ? "show" : "hide"].apply(self, arguments);
        }
    });

    S.each({
            show: getFxs("show", 3),
            hide: getFxs("hide", 3),
            fadeIn: getFxs("show", 3, 2),
            fadeOut: getFxs("hide", 3, 2),
            slideDown: getFxs("show", 1),
            slideUp: getFxs("hide", 1)
        },
        function(v, k) {
            Node.prototype[k] = function(speed, callback, easing) {
                var self = this;
                // 没有参数时，调用 DOM 中的对应方法
                if (DOM[k] && !speed) {
                    DOM[k](self);
                } else {
                    S.each(self, function(elem) {
                        Anim(elem, v, speed, easing || 'easeOut', callback).run();
                    });
                }
                return self;
            };
        });

}, {
    requires:["dom","anim","./base"]
});
/**
 * 2011-05-17
 *  - 承玉：添加 stop ，随时停止动画
 *
 *  TODO
 *  - anim needs queue mechanism ?
 */
