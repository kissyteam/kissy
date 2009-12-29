/**
 * Switchable Autoplay Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget, switchable
 */
KISSY.add("switchable-autoplay", function(S) {

    var Y = YAHOO.util, Event = Y.Event, Lang = YAHOO.lang,
        SWITCHABLE = "switchable",
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        autoplay: false,
        interval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 织入初始化函数
     * attached members:
     *   - this.paused
     *   - this.autoPlayTimer
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE];
        if (!cfg.autoplay) return;

        // 鼠标悬停，停止自动播放
        if (cfg.pauseOnHover) {
            Event.on(self.container, "mouseenter", function() {
                self.paused = true;
            });
            Event.on(self.container, "mouseleave", function() {
                self.paused = false;
            });
        }

        // 设置自动播放
        self.autoplayTimer = Lang.later(cfg.interval * 1000, self, function() {
            if (self.paused) return;
            self.switchTo(self.activeIndex < self.length - 1 ? self.activeIndex + 1 : 0);
        }, null, true);

    }, "after", Switchable.prototype, "_initSwitchable");
});

/**
 * TODO:
 *  - 是否需要提供 play / pause / stop API ?
 *  - autoplayTimer 和 switchTimer 的关联？
 */
