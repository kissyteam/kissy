/**
 * Switchable Autoplay Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget, widget-switchable
 */
KISSY.add("widget-switchable-autoplay", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        SWITCHABLE = "switchable",
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        autoPlay: false,
        interval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 织入初始化函数
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE], max;
        if (!cfg.autoPlay) return;

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
        max = self.panels.length - 1;
        self.autoPlayTimer = Lang.later(cfg.interval * 1000, self, function() {
            if (self.paused) return;
            self.switchTo(self.activeIndex < max ? self.activeIndex + 1 : 0);
        }, null, true);

    }, "after", Switchable, "_initSwitchable");
});
