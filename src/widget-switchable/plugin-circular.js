/**
 * Switchable Circular Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget, switchable
 */
KISSY.add("switchable-circular", function(S) {

    var Y = YAHOO.util, Event = Y.Event, Lang = YAHOO.lang,
        SWITCHABLE = "switchable",
        RELATIVE = "relative", LEFT = "left", TOP = "top",
        SCROLLX = "scrollx", SCROLLY = "scrolly",
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    /**
     * 织入初始化函数
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE],
            max = self.length - 1, steps = cfg.steps,
            panels = self.panels,
            effect = cfg.effect, isX = effect === SCROLLX;

        if (!cfg.circular || (!isX && effect !== SCROLLY)) return; // 仅有滚动效果需要下面的调整

        self.subscribe("beforeSwitch", function(index) {
            var activeIndex = self.activeIndex, i, from, to,
                prop = isX ? LEFT : TOP,
                panelDiff = self.viewSize[isX ? 0 : 1] / steps;

            if (activeIndex === 0 && index === max) { // 从第一个到最后一个
                from = max * steps;
                to = (max + 1) * steps;

                // 将最后一个视图内的 panels 调整到前面
                for(i = from; i < to; i++) {
                    panels[i].style.position = RELATIVE;
                    panels[i].style[prop] = "-" + panelDiff * (i + steps - 1) + "px";
                }
            }
        });

    }, "after", Switchable, "_initSwitchable");
});

/**
 * TODO:
 *   - 是否需要考虑从 1 到 2 顺时针滚动？这需要添加 direction 判断。
 */