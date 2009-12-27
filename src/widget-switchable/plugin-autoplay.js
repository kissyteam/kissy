/**
 * Switchable Autoplay Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget, widget-switchable
 */
KISSY.add("widget-switchable-autoplay", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        SWITCHABLE = "switchable",
        Switchable = S.Switchable;

    S.mix(Switchable.Config, {
        autoPlay: false,
        autoPlayInterval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 初始化自动播放
     */
    function initAutoPlay() {
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
        self.autoPlayTimer = Lang.later(cfg.autoPlayInterval * 1000, self, function() {
            if (self.paused) return;
            self.switchTo(self.activeIndex < max ? self.activeIndex + 1 : 0);
        }, null, true);
    }

    S.weave(initAutoPlay, "after", Switchable, "_initSwitchable");
});
