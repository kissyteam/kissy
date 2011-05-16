KISSY.add('overlay/effect', function(S) {

    var effect = {
        'fade': ['fadeIn', 'fadeOut'],
        'slide': ['slideDown', 'slideUp'],
        'default': ['show', 'hide']
    };

    function anim(isVisible, callback) {
        var self = this,
            el = self.get('el'),
            fn = effect[self.get('effect')][isVisible ? 0 : 1];

        el.css("visibility", isVisible ? "visible" : "hidden");
        return el[fn](self.get('duration'), function() {
            el.css("display", "");
            if (callback && S.isFunction(callback)) callback();
        });
    }

    function Effect() {

    }

    Effect.ATTRS = {
        effect: {
            value: 'fade'  // 动画的类型,
        },
        duration: {
            value: .5   // 动画的时长
        },
        easing: {
            value: 'easeNone' // easing method
        },
        nativeAnim: {
            value: true
        }
    };


    Effect.prototype = {

        __bindUI:function() {
            var self = this;

            self.on("beforeVisibleChange", function(ev) {
                var v = ev.newVal;
                if (self.__animRunning) {
                    self.__animRunning.stop(true);
                    self.__animRunning = null;
                }
                self.__animRunning = anim.call(self, v, function() {
                    self.__set("visible", v);
                    self.__animRunning = null;
                });

                return false;
            });
        }
    };

    S.__OverlayEffect = Effect;
});

